import { Place, CategoryInfo, VibeInfo, LocalBusiness, EmergencyService, SiteStats } from '../types';
import { INITIAL_PLACES, INITIAL_CATEGORIES, INITIAL_VIBES, INITIAL_BUSINESSES, INITIAL_EMERGENCY_SERVICES } from '../data/seedData';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  mapDbPlaceToModel, 
  mapModelPlaceToDb, 
  mapDbBusinessToModel, 
  mapModelBusinessToDb,
  mapDbEmergencyToModel,
  mapModelEmergencyToDb
} from '../lib/supabaseClient';

const STORAGE_KEYS = {
  PLACES: 'nawabi_safar_places_v1',
  CATEGORIES: 'nawabi_safar_categories_v1',
  VIBES: 'nawabi_safar_vibes_v1',
  BUSINESSES: 'nawabi_safar_businesses_v1',
  EMERGENCY: 'nawabi_safar_emergency_v1',
  STATS: 'nawabi_safar_stats_v1',
  ADMIN_AUTH: 'nawabi_safar_admin_session_v1',
  SAVED_BOOKMARKS: 'nawabi_safar_bookmarks_v1'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in storage listener', e);
    }
  });
}

// In-memory cache for instant zero-latency UI rendering
let cachedPlaces: Place[] | null = null;
let cachedBusinesses: LocalBusiness[] | null = null;
let cachedEmergency: EmergencyService[] | null = null;
let isSyncingWithRemote = false;
let remoteSyncAttempted = false;

export const StorageService = {
  /**
   * Subscribe to storage updates (useful when remote Supabase data is fetched)
   */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Initial data setup (Hydrates local fallback and triggers background remote sync)
   */
  initSeedData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PLACES)) {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIBES)) {
      localStorage.setItem(STORAGE_KEYS.VIBES, JSON.stringify(INITIAL_VIBES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES)) {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY)) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(INITIAL_EMERGENCY_SERVICES));
    }

    // Auto-sync with Supabase in background if configured
    if (isSupabaseConfigured() && !remoteSyncAttempted) {
      this.syncFromRemote().catch(err => {
        console.warn('Initial remote sync warning:', err);
      });
    }
  },

  /**
   * Synchronizes data from Supabase into local runtime cache and localStorage
   */
  async syncFromRemote(): Promise<{ success: boolean; placeCount: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, placeCount: 0, error: 'Supabase unconfigured' };
    }

    remoteSyncAttempted = true;
    isSyncingWithRemote = true;

    try {
      // 1. Fetch places
      const { data: dbPlaces, error: placesErr } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (placesErr) throw placesErr;

      if (dbPlaces && dbPlaces.length > 0) {
        const mappedPlaces = dbPlaces.map(mapDbPlaceToModel);
        cachedPlaces = mappedPlaces;
        localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(mappedPlaces));
      }

      // 2. Fetch businesses
      const { data: dbBiz, error: bizErr } = await supabase
        .from('local_businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!bizErr && dbBiz && dbBiz.length > 0) {
        const mappedBiz = dbBiz.map(mapDbBusinessToModel);
        cachedBusinesses = mappedBiz;
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(mappedBiz));
      }

      // 3. Fetch emergency services
      const { data: dbEmerg, error: emergErr } = await supabase
        .from('emergency_services')
        .select('*')
        .order('display_order', { ascending: true });

      if (!emergErr && dbEmerg && dbEmerg.length > 0) {
        const mappedEmerg = dbEmerg.map(mapDbEmergencyToModel);
        cachedEmergency = mappedEmerg;
        localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(mappedEmerg));
      }

      isSyncingWithRemote = false;
      notifyListeners();
      return { 
        success: true, 
        placeCount: cachedPlaces ? cachedPlaces.length : 0 
      };
    } catch (e: any) {
      isSyncingWithRemote = false;
      console.warn('Supabase remote sync failed, using local cache:', e.message || e);
      return { 
        success: false, 
        placeCount: 0, 
        error: e.message || 'Remote sync failed' 
      };
    }
  },

  /**
   * One-click tool: Seeds/Migrates initial tourism data to Supabase PostgreSQL without duplicates
   */
  async syncSeedToSupabase(): Promise<{ success: boolean; message: string; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        message: 'Cannot seed: Supabase is not configured in .env variables.',
        count: 0
      };
    }

    try {
      const placesToSeed = this.getPlaces();
      const dbPlaces = placesToSeed.map(mapModelPlaceToDb);

      const { error: pErr } = await supabase
        .from('places')
        .upsert(dbPlaces, { onConflict: 'id' });

      if (pErr) throw pErr;

      const businessesToSeed = this.getBusinesses();
      const dbBiz = businessesToSeed.map(mapModelBusinessToDb);
      await supabase.from('local_businesses').upsert(dbBiz, { onConflict: 'id' });

      const emergencyToSeed = this.getEmergencyServices();
      const dbEmerg = emergencyToSeed.map(mapModelEmergencyToDb);
      await supabase.from('emergency_services').upsert(dbEmerg, { onConflict: 'id' });

      await this.syncFromRemote();

      return {
        success: true,
        message: `Successfully synchronized ${placesToSeed.length} places, ${businessesToSeed.length} businesses, and ${emergencyToSeed.length} emergency contacts to Supabase PostgreSQL.`,
        count: placesToSeed.length
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Migration error: ${e.message || 'Unknown error during Supabase upsert'}`,
        count: 0
      };
    }
  },

  // ----------------------------------------------------------------------------
  // PLACES
  // ----------------------------------------------------------------------------

  getPlaces(): Place[] {
    if (cachedPlaces) {
      return cachedPlaces;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLACES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
        cachedPlaces = INITIAL_PLACES;
        return INITIAL_PLACES;
      }
      cachedPlaces = JSON.parse(data);
      return cachedPlaces || INITIAL_PLACES;
    } catch {
      return INITIAL_PLACES;
    }
  },

  savePlaces(places: Place[]): void {
    cachedPlaces = places;
    try {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
    } catch (e) {
      console.error('Failed to save places to local storage', e);
    }
    notifyListeners();
  },

  async savePlaceRemote(place: Place): Promise<{ success: boolean; error?: string }> {
    // 1. Update local cache immediately
    const list = this.getPlaces();
    const idx = list.findIndex(p => p.id === place.id);
    if (idx >= 0) {
      list[idx] = place;
    } else {
      list.unshift(place);
    }
    this.savePlaces(list);

    // 2. Persist to Supabase if available
    const supabase = getSupabase();
    if (!supabase) {
      return { success: true }; // Local persistence succeeded
    }

    try {
      const dbPayload = mapModelPlaceToDb(place);
      const { error } = await supabase
        .from('places')
        .upsert(dbPayload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase remote write error (using local cache):', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('Supabase write exception:', e);
      return { success: false, error: e.message };
    }
  },

  async deletePlaceRemote(id: string): Promise<{ success: boolean; error?: string }> {
    // 1. Remove from local cache
    const list = this.getPlaces();
    const filtered = list.filter(p => p.id !== id);
    this.savePlaces(filtered);

    // 2. Delete from Supabase if available
    const supabase = getSupabase();
    if (!supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // ----------------------------------------------------------------------------
  // CATEGORIES & VIBES
  // ----------------------------------------------------------------------------

  getCategories(): CategoryInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories(categories: CategoryInfo[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      notifyListeners();
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  getVibes(): VibeInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIBES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VIBES, JSON.stringify(INITIAL_VIBES));
        return INITIAL_VIBES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VIBES;
    }
  },

  saveVibes(vibes: VibeInfo[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIBES, JSON.stringify(vibes));
      notifyListeners();
    } catch (e) {
      console.error('Failed to save vibes', e);
    }
  },

  // ----------------------------------------------------------------------------
  // BUSINESSES & ARTISANS
  // ----------------------------------------------------------------------------

  getBusinesses(): LocalBusiness[] {
    if (cachedBusinesses) return cachedBusinesses;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
        cachedBusinesses = INITIAL_BUSINESSES;
        return INITIAL_BUSINESSES;
      }
      cachedBusinesses = JSON.parse(data);
      return cachedBusinesses || INITIAL_BUSINESSES;
    } catch {
      return INITIAL_BUSINESSES;
    }
  },

  saveBusinesses(businesses: LocalBusiness[]): void {
    cachedBusinesses = businesses;
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
      notifyListeners();
    } catch (e) {
      console.error('Failed to save businesses', e);
    }
  },

  async addBusiness(biz: Partial<LocalBusiness>): Promise<LocalBusiness> {
    const list = this.getBusinesses();
    const newBiz: LocalBusiness = {
      id: 'biz_' + Date.now(),
      name: biz.name || 'Artisan Boutique',
      category: biz.category || 'attire',
      specialty: biz.specialty || '',
      description: biz.description || '',
      image: biz.image || 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
      address: biz.address || 'Lucknow, Uttar Pradesh',
      area: biz.area || 'Chowk',
      contactNumber: biz.contactNumber || '+91 522 2256000',
      websiteUrl: biz.websiteUrl,
      featured: biz.featured ?? true,
      status: biz.status || 'published',
      createdAt: new Date().toISOString()
    };
    list.unshift(newBiz);
    this.saveBusinesses(list);

    // Sync to Supabase in background
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('local_businesses').insert(mapModelBusinessToDb(newBiz)).then(
        ({ error }) => { if (error) console.warn('Supabase business insert notice:', error.message); },
        (err) => console.warn('Supabase network error:', err)
      );
    }

    return newBiz;
  },

  async updateBusiness(id: string, updates: Partial<LocalBusiness>): Promise<boolean> {
    const list = this.getBusinesses();
    const idx = list.findIndex(b => b.id === id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      this.saveBusinesses(list);

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('local_businesses').upsert(mapModelBusinessToDb(updated)).then(
          ({ error }) => { if (error) console.warn('Supabase business update notice:', error.message); },
          (err) => console.warn('Supabase network error:', err)
        );
      }
      return true;
    }
    return false;
  },

  async deleteBusiness(id: string): Promise<boolean> {
    const list = this.getBusinesses();
    const filtered = list.filter(b => b.id !== id);
    if (filtered.length !== list.length) {
      this.saveBusinesses(filtered);

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('local_businesses').delete().eq('id', id).then(
          ({ error }) => { if (error) console.warn('Supabase business delete notice:', error.message); },
          (err) => console.warn('Supabase network error:', err)
        );
      }
      return true;
    }
    return false;
  },

  // ----------------------------------------------------------------------------
  // EMERGENCY SERVICES DIRECTORY
  // ----------------------------------------------------------------------------

  getEmergencyServices(): EmergencyService[] {
    if (cachedEmergency) return cachedEmergency;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(INITIAL_EMERGENCY_SERVICES));
        cachedEmergency = INITIAL_EMERGENCY_SERVICES;
        return INITIAL_EMERGENCY_SERVICES;
      }
      cachedEmergency = JSON.parse(data);
      return cachedEmergency || INITIAL_EMERGENCY_SERVICES;
    } catch {
      return INITIAL_EMERGENCY_SERVICES;
    }
  },

  saveEmergencyServices(services: EmergencyService[]): void {
    cachedEmergency = services;
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(services));
      notifyListeners();
    } catch (e) {
      console.error('Failed to save emergency services', e);
    }
  },

  async addEmergencyService(service: Partial<EmergencyService>): Promise<EmergencyService> {
    const list = this.getEmergencyServices();
    const newService: EmergencyService = {
      id: 'emerg_' + Date.now(),
      serviceName: service.serviceName || 'Emergency Support',
      category: service.category || 'police',
      number: service.number || '112',
      description: service.description || '',
      address: service.address,
      availability: service.availability || '24x7',
      officialSource: service.officialSource || 'UP Government',
      displayOrder: service.displayOrder || (list.length + 1),
      enabled: service.enabled ?? true
    };
    list.unshift(newService);
    this.saveEmergencyServices(list);

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('emergency_services').insert(mapModelEmergencyToDb(newService)).then(
        ({ error }) => { if (error) console.warn('Supabase emergency insert notice:', error.message); },
        (err) => console.warn('Supabase network error:', err)
      );
    }

    return newService;
  },

  async updateEmergencyService(id: string, updates: Partial<EmergencyService>): Promise<boolean> {
    const list = this.getEmergencyServices();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      this.saveEmergencyServices(list);

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('emergency_services').upsert(mapModelEmergencyToDb(updated)).then(
          ({ error }) => { if (error) console.warn('Supabase emergency update notice:', error.message); },
          (err) => console.warn('Supabase network error:', err)
        );
      }
      return true;
    }
    return false;
  },

  async deleteEmergencyService(id: string): Promise<boolean> {
    const list = this.getEmergencyServices();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length !== list.length) {
      this.saveEmergencyServices(filtered);

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('emergency_services').delete().eq('id', id).then(
          ({ error }) => { if (error) console.warn('Supabase emergency delete notice:', error.message); },
          (err) => console.warn('Supabase network error:', err)
        );
      }
      return true;
    }
    return false;
  },

  // ----------------------------------------------------------------------------
  // ANALYTICS & BOOKMARKS
  // ----------------------------------------------------------------------------

  getStats(): SiteStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        const initial: SiteStats = {
          totalVisitors: 48260,
          todayVisitors: 342,
          monthVisitors: 12890,
          totalSavedItineraries: 3420
        };
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return {
        totalVisitors: 48260,
        todayVisitors: 342,
        monthVisitors: 12890,
        totalSavedItineraries: 3420
      };
    }
  },

  incrementVisitorCount(): SiteStats {
    try {
      const stats = this.getStats();
      const updated: SiteStats = {
        ...stats,
        totalVisitors: stats.totalVisitors + 1,
        todayVisitors: stats.todayVisitors + 1,
        monthVisitors: stats.monthVisitors + 1
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      return updated;
    } catch {
      return this.getStats();
    }
  },

  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(placeId: string): string[] {
    try {
      const bookmarks = this.getBookmarks();
      const exists = bookmarks.includes(placeId);
      const updated = exists 
        ? bookmarks.filter(id => id !== placeId)
        : [...bookmarks, placeId];
      localStorage.setItem(STORAGE_KEYS.SAVED_BOOKMARKS, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  resetToDefault(): void {
    cachedPlaces = null;
    cachedBusinesses = null;
    cachedEmergency = null;
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.VIBES, JSON.stringify(INITIAL_VIBES));
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(INITIAL_EMERGENCY_SERVICES));
    notifyListeners();
  },

  resetToSeed(): void {
    this.resetToDefault();
  },

  exportFullDatabase(): string {
    const exportObject = {
      version: '2.0-cloud-sync',
      exportedAt: new Date().toISOString(),
      places: this.getPlaces(),
      categories: this.getCategories(),
      vibes: this.getVibes(),
      businesses: this.getBusinesses(),
      emergencyServices: this.getEmergencyServices()
    };
    return JSON.stringify(exportObject, null, 2);
  },

  importFullDatabase(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.places)) {
        this.savePlaces(parsed.places);
      }
      if (Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
      if (Array.isArray(parsed.vibes)) {
        this.saveVibes(parsed.vibes);
      }
      if (Array.isArray(parsed.businesses)) {
        this.saveBusinesses(parsed.businesses);
      }
      if (Array.isArray(parsed.emergencyServices)) {
        this.saveEmergencyServices(parsed.emergencyServices);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

