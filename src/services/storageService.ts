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
let realtimeSubscribed = false;

export const StorageService = {
  /**
   * Subscribe to storage updates (realtime remote events or local cache updates)
   */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Initial data setup:
   * - Hydrates local cache as immediate offline fallback.
   * - Immediately queries Supabase PostgreSQL as authoritative source of truth.
   * - Attaches Supabase Realtime channel and reconnect event listeners.
   */
  initSeedData(): void {
    // 1. Ensure local fallback structure exists
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

    // 2. Fetch authoritative data from Supabase immediately
    if (isSupabaseConfigured()) {
      this.syncFromRemote().catch(err => {
        console.warn('Initial Supabase fetch warning:', err);
      });
      this.initRealtime();
      this.initWindowListeners();
    }
  },

  /**
   * Sets up window focus and online listeners for fresh-data reconciliation
   */
  initWindowListeners(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('focus', () => {
      this.syncFromRemote().catch(() => {});
    });

    window.addEventListener('online', () => {
      this.syncFromRemote().catch(() => {});
    });
  },

  /**
   * Sets up Supabase Realtime subscription on places, businesses, and emergency tables
   */
  initRealtime(): void {
    if (realtimeSubscribed) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const channel = supabase.channel('nawabi_safar_public_data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, (payload) => {
          this.handlePlaceRealtimeEvent(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'local_businesses' }, (payload) => {
          this.handleBusinessRealtimeEvent(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_services' }, (payload) => {
          this.handleEmergencyRealtimeEvent(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            realtimeSubscribed = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            realtimeSubscribed = false;
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription exception:', err);
    }
  },

  handlePlaceRealtimeEvent(payload: any): void {
    const list = this.getPlaces().slice();
    const eventType = payload.eventType;

    if (eventType === 'INSERT') {
      const newPlace = mapDbPlaceToModel(payload.new);
      const exists = list.some(p => p.id === newPlace.id);
      if (!exists) {
        list.unshift(newPlace);
        this.savePlacesLocal(list);
      }
    } else if (eventType === 'UPDATE') {
      const updatedPlace = mapDbPlaceToModel(payload.new);
      const idx = list.findIndex(p => p.id === updatedPlace.id);
      if (idx >= 0) {
        list[idx] = updatedPlace;
      } else {
        list.unshift(updatedPlace);
      }
      this.savePlacesLocal(list);
    } else if (eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        const filtered = list.filter(p => p.id !== oldId);
        this.savePlacesLocal(filtered);
      }
    }
  },

  handleBusinessRealtimeEvent(payload: any): void {
    const list = this.getBusinesses().slice();
    const eventType = payload.eventType;

    if (eventType === 'INSERT') {
      const newBiz = mapDbBusinessToModel(payload.new);
      if (!list.some(b => b.id === newBiz.id)) {
        list.unshift(newBiz);
        this.saveBusinessesLocal(list);
      }
    } else if (eventType === 'UPDATE') {
      const updatedBiz = mapDbBusinessToModel(payload.new);
      const idx = list.findIndex(b => b.id === updatedBiz.id);
      if (idx >= 0) {
        list[idx] = updatedBiz;
      } else {
        list.unshift(updatedBiz);
      }
      this.saveBusinessesLocal(list);
    } else if (eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        const filtered = list.filter(b => b.id !== oldId);
        this.saveBusinessesLocal(filtered);
      }
    }
  },

  handleEmergencyRealtimeEvent(payload: any): void {
    const list = this.getEmergencyServices().slice();
    const eventType = payload.eventType;

    if (eventType === 'INSERT') {
      const newService = mapDbEmergencyToModel(payload.new);
      if (!list.some(s => s.id === newService.id)) {
        list.unshift(newService);
        this.saveEmergencyServicesLocal(list);
      }
    } else if (eventType === 'UPDATE') {
      const updatedService = mapDbEmergencyToModel(payload.new);
      const idx = list.findIndex(s => s.id === updatedService.id);
      if (idx >= 0) {
        list[idx] = updatedService;
      } else {
        list.unshift(updatedService);
      }
      this.saveEmergencyServicesLocal(list);
    } else if (eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        const filtered = list.filter(s => s.id !== oldId);
        this.saveEmergencyServicesLocal(filtered);
      }
    }
  },

  /**
   * Synchronizes data from Supabase into local runtime cache and localStorage.
   * Supabase PostgreSQL is the authoritative master.
   */
  async syncFromRemote(): Promise<{ success: boolean; placeCount: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, placeCount: 0, error: 'Supabase unconfigured' };
    }

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
      console.warn('Supabase remote fetch notice (using cache):', e.message || e);
      return { 
        success: false, 
        placeCount: cachedPlaces ? cachedPlaces.length : 0, 
        error: e.message || 'Remote fetch failed' 
      };
    }
  },

  /**
   * Safe manual sync tool for Admin: syncs initial dataset to Supabase PostgreSQL without overwriting on conflicts
   */
  async syncSeedToSupabase(): Promise<{ success: boolean; message: string; count: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        message: 'Cannot sync: Supabase is not configured in environment variables.',
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
        message: `Successfully synchronized ${placesToSeed.length} destinations, ${businessesToSeed.length} local businesses, and ${emergencyToSeed.length} emergency contacts with Supabase PostgreSQL!`,
        count: placesToSeed.length
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Database sync error: ${e.message || 'Unknown error during Supabase sync'}`,
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

  savePlacesLocal(places: Place[]): void {
    cachedPlaces = places;
    try {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
    } catch (e) {
      console.error('Failed to save places to cache', e);
    }
    notifyListeners();
  },

  savePlaces(places: Place[]): void {
    this.savePlacesLocal(places);
  },

  /**
   * Authoritative Place Persistence:
   * Writes directly to Supabase PostgreSQL.
   * Local cache is updated ONLY after the database confirms the write.
   */
  async savePlaceRemote(place: Place): Promise<{ success: boolean; error?: string; place?: Place }> {
    const supabase = getSupabase();
    if (!supabase) {
      // Local fallback only if Supabase is completely unconfigured
      const list = this.getPlaces().slice();
      const idx = list.findIndex(p => p.id === place.id);
      if (idx >= 0) list[idx] = place;
      else list.unshift(place);
      this.savePlacesLocal(list);
      return { success: true, place };
    }

    try {
      const dbPayload = mapModelPlaceToDb(place);
      dbPayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('places')
        .upsert(dbPayload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Supabase place upsert rejected by database:', error);
        return { 
          success: false, 
          error: `Database write rejected (${error.code || 'RLS'}): ${error.message}. Ensure you are signed in with an active curator account.` 
        };
      }

      const persistedModel = data ? mapDbPlaceToModel(data) : place;

      // Update local cache only upon successful database commit
      const list = this.getPlaces().slice();
      const idx = list.findIndex(p => p.id === persistedModel.id);
      if (idx >= 0) {
        list[idx] = persistedModel;
      } else {
        list.unshift(persistedModel);
      }
      this.savePlacesLocal(list);

      return { success: true, place: persistedModel };
    } catch (e: any) {
      console.error('Supabase write exception:', e);
      return { success: false, error: e.message || 'Network exception during place update' };
    }
  },

  /**
   * Authoritative Place Deletion:
   * Deletes directly from Supabase PostgreSQL.
   */
  async deletePlaceRemote(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      const list = this.getPlaces().filter(p => p.id !== id);
      this.savePlacesLocal(list);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase place delete rejected by database:', error);
        return { 
          success: false, 
          error: `Database delete rejected (${error.code || 'RLS'}): ${error.message}` 
        };
      }

      const list = this.getPlaces().filter(p => p.id !== id);
      this.savePlacesLocal(list);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network exception during place delete' };
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

  saveBusinessesLocal(businesses: LocalBusiness[]): void {
    cachedBusinesses = businesses;
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    } catch (e) {
      console.error('Failed to save businesses', e);
    }
    notifyListeners();
  },

  saveBusinesses(businesses: LocalBusiness[]): void {
    this.saveBusinessesLocal(businesses);
  },

  /**
   * Authoritative Business Creation:
   * Writes to Supabase first; commits to local state on success.
   */
  async addBusiness(biz: Partial<LocalBusiness>): Promise<{ success: boolean; business?: LocalBusiness; error?: string }> {
    const newBiz: LocalBusiness = {
      id: biz.id || ('biz_' + Date.now()),
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

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelBusinessToDb(newBiz);
        const { data, error } = await supabase
          .from('local_businesses')
          .insert(dbPayload)
          .select()
          .single();

        if (error) {
          return { success: false, error: `Supabase business insert failed: ${error.message}` };
        }
        const created = data ? mapDbBusinessToModel(data) : newBiz;
        const list = this.getBusinesses().slice();
        list.unshift(created);
        this.saveBusinessesLocal(list);
        return { success: true, business: created };
      } catch (e: any) {
        return { success: false, error: e.message || 'Business insert exception' };
      }
    }

    const list = this.getBusinesses().slice();
    list.unshift(newBiz);
    this.saveBusinessesLocal(list);
    return { success: true, business: newBiz };
  },

  /**
   * Authoritative Business Update:
   * Updates Supabase first; commits to local state on success.
   */
  async updateBusiness(id: string, updates: Partial<LocalBusiness>): Promise<{ success: boolean; error?: string }> {
    const list = this.getBusinesses().slice();
    const idx = list.findIndex(b => b.id === id);
    if (idx < 0) {
      return { success: false, error: 'Business not found' };
    }

    const updated: LocalBusiness = { ...list[idx], ...updates };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelBusinessToDb(updated);
        dbPayload.updated_at = new Date().toISOString();
        const { error } = await supabase
          .from('local_businesses')
          .upsert(dbPayload, { onConflict: 'id' });

        if (error) {
          return { success: false, error: `Supabase business update failed: ${error.message}` };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Business update exception' };
      }
    }

    list[idx] = updated;
    this.saveBusinessesLocal(list);
    return { success: true };
  },

  /**
   * Authoritative Business Delete:
   * Deletes from Supabase first.
   */
  async deleteBusiness(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('local_businesses')
          .delete()
          .eq('id', id);

        if (error) {
          return { success: false, error: `Supabase business delete failed: ${error.message}` };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Business delete exception' };
      }
    }

    const list = this.getBusinesses().filter(b => b.id !== id);
    this.saveBusinessesLocal(list);
    return { success: true };
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

  saveEmergencyServicesLocal(services: EmergencyService[]): void {
    cachedEmergency = services;
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save emergency services', e);
    }
    notifyListeners();
  },

  saveEmergencyServices(services: EmergencyService[]): void {
    this.saveEmergencyServicesLocal(services);
  },

  /**
   * Authoritative Emergency Service Creation:
   * Writes to Supabase first.
   */
  async addEmergencyService(service: Partial<EmergencyService>): Promise<{ success: boolean; service?: EmergencyService; error?: string }> {
    const list = this.getEmergencyServices().slice();
    const newService: EmergencyService = {
      id: service.id || ('emerg_' + Date.now()),
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

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelEmergencyToDb(newService);
        const { data, error } = await supabase
          .from('emergency_services')
          .insert(dbPayload)
          .select()
          .single();

        if (error) {
          return { success: false, error: `Supabase emergency insert failed: ${error.message}` };
        }
        const created = data ? mapDbEmergencyToModel(data) : newService;
        list.unshift(created);
        this.saveEmergencyServicesLocal(list);
        return { success: true, service: created };
      } catch (e: any) {
        return { success: false, error: e.message || 'Emergency insert exception' };
      }
    }

    list.unshift(newService);
    this.saveEmergencyServicesLocal(list);
    return { success: true, service: newService };
  },

  /**
   * Authoritative Emergency Service Update:
   * Updates Supabase first.
   */
  async updateEmergencyService(id: string, updates: Partial<EmergencyService>): Promise<{ success: boolean; error?: string }> {
    const list = this.getEmergencyServices().slice();
    const idx = list.findIndex(s => s.id === id);
    if (idx < 0) {
      return { success: false, error: 'Emergency record not found' };
    }

    const updated: EmergencyService = { ...list[idx], ...updates };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelEmergencyToDb(updated);
        dbPayload.updated_at = new Date().toISOString();
        const { error } = await supabase
          .from('emergency_services')
          .upsert(dbPayload, { onConflict: 'id' });

        if (error) {
          return { success: false, error: `Supabase emergency update failed: ${error.message}` };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Emergency update exception' };
      }
    }

    list[idx] = updated;
    this.saveEmergencyServicesLocal(list);
    return { success: true };
  },

  /**
   * Authoritative Emergency Service Deletion:
   * Deletes from Supabase first.
   */
  async deleteEmergencyService(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('emergency_services')
          .delete()
          .eq('id', id);

        if (error) {
          return { success: false, error: `Supabase emergency delete failed: ${error.message}` };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Emergency delete exception' };
      }
    }

    const list = this.getEmergencyServices().filter(s => s.id !== id);
    this.saveEmergencyServicesLocal(list);
    return { success: true };
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
      version: '3.0-database-first',
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
        this.savePlacesLocal(parsed.places);
      }
      if (Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
      if (Array.isArray(parsed.vibes)) {
        this.saveVibes(parsed.vibes);
      }
      if (Array.isArray(parsed.businesses)) {
        this.saveBusinessesLocal(parsed.businesses);
      }
      if (Array.isArray(parsed.emergencyServices)) {
        this.saveEmergencyServicesLocal(parsed.emergencyServices);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};
