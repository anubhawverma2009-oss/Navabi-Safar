import { Place, CategoryInfo, VibeInfo, LocalBusiness, EmergencyService, SiteStats } from '../types';
import { INITIAL_PLACES, INITIAL_CATEGORIES, INITIAL_VIBES, INITIAL_BUSINESSES, INITIAL_EMERGENCY_SERVICES } from '../data/seedData';

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

export const StorageService = {
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
  },

  getPlaces(): Place[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLACES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
        return INITIAL_PLACES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLACES;
    }
  },

  savePlaces(places: Place[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
    } catch (e) {
      console.error('Failed to save places to storage', e);
    }
  },

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
    } catch (e) {
      console.error('Failed to save vibes', e);
    }
  },

  getBusinesses(): LocalBusiness[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
        return INITIAL_BUSINESSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BUSINESSES;
    }
  },

  saveBusinesses(businesses: LocalBusiness[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    } catch (e) {
      console.error('Failed to save businesses', e);
    }
  },

  addBusiness(biz: Partial<LocalBusiness>): LocalBusiness {
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
    return newBiz;
  },

  updateBusiness(id: string, updates: Partial<LocalBusiness>): boolean {
    const list = this.getBusinesses();
    const idx = list.findIndex(b => b.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      this.saveBusinesses(list);
      return true;
    }
    return false;
  },

  deleteBusiness(id: string): boolean {
    const list = this.getBusinesses();
    const filtered = list.filter(b => b.id !== id);
    if (filtered.length !== list.length) {
      this.saveBusinesses(filtered);
      return true;
    }
    return false;
  },

  getEmergencyServices(): EmergencyService[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(INITIAL_EMERGENCY_SERVICES));
        return INITIAL_EMERGENCY_SERVICES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EMERGENCY_SERVICES;
    }
  },

  saveEmergencyServices(services: EmergencyService[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save emergency services', e);
    }
  },

  addEmergencyService(service: Partial<EmergencyService>): EmergencyService {
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
    return newService;
  },

  updateEmergencyService(id: string, updates: Partial<EmergencyService>): boolean {
    const list = this.getEmergencyServices();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      this.saveEmergencyServices(list);
      return true;
    }
    return false;
  },

  deleteEmergencyService(id: string): boolean {
    const list = this.getEmergencyServices();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length !== list.length) {
      this.saveEmergencyServices(filtered);
      return true;
    }
    return false;
  },

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
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.VIBES, JSON.stringify(INITIAL_VIBES));
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(INITIAL_EMERGENCY_SERVICES));
  },

  resetToSeed(): void {
    this.resetToDefault();
  },

  exportFullDatabase(): string {
    const exportObject = {
      version: '1.0',
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
