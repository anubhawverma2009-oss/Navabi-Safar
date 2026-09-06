import { Place, FilterState, PlaceCategory, PlaceVibe } from '../types';
import { StorageService } from './storageService';

export const PlaceService = {
  getAllPlaces(): Place[] {
    return StorageService.getPlaces();
  },

  getPublishedPlaces(): Place[] {
    return StorageService.getPlaces().filter(p => p.status === 'published');
  },

  getPlaceBySlug(slug: string): Place | undefined {
    return StorageService.getPlaces().find(p => p.slug === slug || p.id === slug);
  },

  getPlaceById(id: string): Place | undefined {
    return StorageService.getPlaces().find(p => p.id === id);
  },

  getFeaturedPlaces(): Place[] {
    return this.getPublishedPlaces().filter(p => p.featured);
  },

  getHiddenGems(): Place[] {
    return this.getPublishedPlaces().filter(p => p.hiddenGem);
  },

  getPlacesByCategory(category: PlaceCategory): Place[] {
    return this.getPublishedPlaces().filter(p => p.category === category);
  },

  getPlacesByVibe(vibe: PlaceVibe): Place[] {
    return this.getPublishedPlaces().filter(p => p.vibes.includes(vibe));
  },

  getNearbyPlaces(place: Place, limit = 4): Place[] {
    const all = this.getPublishedPlaces().filter(p => p.id !== place.id);
    
    // First priority: explicitly tagged nearby ids
    const tagged = all.filter(p => place.nearbyPlaceIds?.includes(p.id));
    if (tagged.length >= limit) return tagged.slice(0, limit);
    
    // Second priority: same area or same category
    const sameArea = all.filter(p => !tagged.some(t => t.id === p.id) && (p.area === place.area || p.category === place.category));
    
    return [...tagged, ...sameArea].slice(0, limit);
  },

  searchPlaces(query: string): Place[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return this.getPublishedPlaces().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.vibes.some(v => v.toLowerCase().includes(q)) ||
      (p.hindiName && p.hindiName.includes(q))
    );
  },

  filterPlaces(filters: FilterState): Place[] {
    let places = this.getPublishedPlaces();

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      places = places.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.area.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.vibes.some(v => v.toLowerCase().includes(query)) ||
        (p.hindiName && p.hindiName.includes(query))
      );
    }

    if (filters.category !== 'all') {
      places = places.filter(p => p.category === filters.category);
    }

    if (filters.vibe !== 'all') {
      places = places.filter(p => p.vibes.includes(filters.vibe as PlaceVibe));
    }

    if (filters.budgetMax < 1000) {
      places = places.filter(p => p.estimatedBudget <= filters.budgetMax);
    }

    if (filters.bestTime !== 'all') {
      places = places.filter(p => p.bestTime === filters.bestTime || p.bestTime === 'Any Time');
    }

    if (filters.area !== 'all') {
      places = places.filter(p => p.area.toLowerCase() === filters.area.toLowerCase());
    }

    if (filters.onlyFeatured) {
      places = places.filter(p => p.featured);
    }

    if (filters.onlyHiddenGems) {
      places = places.filter(p => p.hiddenGem);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'featured':
        places.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        places.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'budget-asc':
        places.sort((a, b) => a.estimatedBudget - b.estimatedBudget);
        break;
      case 'budget-desc':
        places.sort((a, b) => b.estimatedBudget - a.estimatedBudget);
        break;
      case 'newest':
        places.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return places;
  },

  // Authoritative Database-First Admin Actions

  async createPlace(placeData: Partial<Place>): Promise<Place> {
    const newPlace: Place = {
      id: placeData.id || ('dest_' + Date.now()),
      name: placeData.name || 'New Lucknow Destination',
      slug: placeData.slug || ('dest-' + Date.now()),
      hindiName: placeData.hindiName,
      category: placeData.category || 'historical',
      subCategory: placeData.subCategory,
      shortDescription: placeData.shortDescription || '',
      description: placeData.description || '',
      story: placeData.story || '',
      whyVisit: placeData.whyVisit || [],
      vibes: placeData.vibes || ['Heritage'],
      coverImage: placeData.coverImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
      galleryImages: placeData.galleryImages || [placeData.coverImage || ''],
      address: placeData.address || 'Lucknow, Uttar Pradesh',
      area: placeData.area || 'Hussainabad',
      latitude: placeData.latitude || 26.8687,
      longitude: placeData.longitude || 80.9135,
      googleMapsUrl: placeData.googleMapsUrl || placeData.howToReach?.googleMapsUrl || undefined,
      openingTime: placeData.openingTime || '06:00 AM',
      closingTime: placeData.closingTime || '05:00 PM',
      entryFee: placeData.entryFee || 'Free',
      estimatedBudget: placeData.estimatedBudget ?? 0,
      bestTime: placeData.bestTime || 'Morning',
      recommendedDuration: placeData.recommendedDuration || '2 Hours',
      howToReach: placeData.howToReach || {},
      nearbyPlaceIds: placeData.nearbyPlaceIds || [],
      featured: placeData.featured ?? false,
      hiddenGem: placeData.hiddenGem ?? false,
      status: placeData.status || 'published',
      rating: placeData.rating || 4.8,
      reviewsCount: placeData.reviewsCount || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = await StorageService.savePlaceRemote(newPlace);
    if (!res.success) {
      throw new Error(res.error || 'Failed to create destination in database');
    }
    return res.place || newPlace;
  },

  async updatePlace(id: string, updates: Partial<Place>): Promise<boolean> {
    const places = StorageService.getPlaces();
    const existing = places.find(p => p.id === id);
    if (!existing) {
      throw new Error(`Destination with ID "${id}" not found`);
    }

    const updated: Place = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const res = await StorageService.savePlaceRemote(updated);
    if (!res.success) {
      throw new Error(res.error || 'Failed to update destination in database');
    }
    return true;
  },

  async savePlace(place: Place): Promise<Place> {
    const updatedPlace: Place = {
      ...place,
      updatedAt: new Date().toISOString()
    };

    const res = await StorageService.savePlaceRemote(updatedPlace);
    if (!res.success) {
      throw new Error(res.error || 'Failed to persist destination in database');
    }
    return res.place || updatedPlace;
  },

  async deletePlace(id: string): Promise<boolean> {
    const res = await StorageService.deletePlaceRemote(id);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete destination from database');
    }
    return true;
  },

  async toggleFeatured(id: string): Promise<boolean> {
    const places = StorageService.getPlaces();
    const place = places.find(p => p.id === id);
    if (!place) {
      throw new Error('Destination not found');
    }
    const nextFeatured = !place.featured;
    await this.updatePlace(id, { featured: nextFeatured });
    return nextFeatured;
  },

  async toggleHiddenGem(id: string): Promise<boolean> {
    const places = StorageService.getPlaces();
    const place = places.find(p => p.id === id);
    if (!place) {
      throw new Error('Destination not found');
    }
    const nextHiddenGem = !place.hiddenGem;
    await this.updatePlace(id, { hiddenGem: nextHiddenGem });
    return nextHiddenGem;
  }
};
