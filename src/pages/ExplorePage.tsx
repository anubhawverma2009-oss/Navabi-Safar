import React, { useState, useEffect, useMemo } from 'react';
import { Place, FilterState, PlaceCategory, PlaceVibe, BestTimeToVisit } from '../types';
import { PlaceService } from '../services/placeService';
import { StorageService } from '../services/storageService';
import { PlaceCard } from '../components/common/PlaceCard';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Search, SlidersHorizontal, X, Sparkles, Flame, Gem, 
  MapPin, Clock, IndianRupee, RotateCcw, Check, Bookmark, ArrowUpDown
} from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (route: string) => void;
  initialCategory?: PlaceCategory | 'all';
  initialVibe?: PlaceVibe | 'all';
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  initialCategory = 'all',
  initialVibe = 'all'
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState(StorageService.getCategories());
  const [vibes, setVibes] = useState(StorageService.getVibes());
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: initialCategory,
    vibe: initialVibe,
    budgetMax: 1000,
    duration: 'all',
    bestTime: 'all',
    area: 'all',
    onlyFeatured: false,
    onlyHiddenGems: false,
    sortBy: 'featured'
  });

  useEffect(() => {
    // Parse URL params if any
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category') as PlaceCategory | null;
    const vibeParam = params.get('vibe') as PlaceVibe | null;
    const filterParam = params.get('filter');

    if (catParam) {
      setFilters(prev => ({ ...prev, category: catParam }));
    }
    if (vibeParam) {
      setFilters(prev => ({ ...prev, vibe: vibeParam }));
    }
    if (filterParam === 'saved') {
      setShowOnlySaved(true);
    }

    const loadAll = () => {
      setPlaces(PlaceService.getPublishedPlaces());
      setSavedPlaceIds(StorageService.getBookmarks());
      setCategories(StorageService.getCategories());
      setVibes(StorageService.getVibes());
    };

    loadAll();
    const unsubscribe = StorageService.subscribe(loadAll);
    return () => unsubscribe();
  }, []);

  // Unique areas in Lucknow from data
  const distinctAreas = useMemo(() => {
    const areas = new Set<string>();
    places.forEach(p => {
      if (p.area) areas.add(p.area);
    });
    return Array.from(areas).sort();
  }, [places]);

  // Compute filtered places
  const filteredPlaces = useMemo(() => {
    let result = PlaceService.filterPlaces(filters);
    if (showOnlySaved) {
      result = result.filter(p => savedPlaceIds.includes(p.id));
    }
    return result;
  }, [filters, places, showOnlySaved, savedPlaceIds]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      vibe: 'all',
      budgetMax: 1000,
      duration: 'all',
      bestTime: 'all',
      area: 'all',
      onlyFeatured: false,
      onlyHiddenGems: false,
      sortBy: 'featured'
    });
    setShowOnlySaved(false);
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.vibe !== 'all' ||
    filters.budgetMax < 1000 ||
    filters.bestTime !== 'all' ||
    filters.area !== 'all' ||
    filters.onlyFeatured ||
    filters.onlyHiddenGems ||
    showOnlySaved;

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-10" id="explore-lucknow-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Complete Lucknow Curations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
            Explore Lucknow
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
            Search across {places.length} verified destinations, filter by your favorite vibe, explore estimated budgets, timings, and authentic local tips.
          </p>
        </div>

        {/* Search & Top Action Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by monument, kebab spot, bazaar, or area..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
              id="explore-search-input"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters / Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setFilters(prev => ({ ...prev, onlyFeatured: !prev.onlyFeatured }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filters.onlyFeatured
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, onlyHiddenGems: !prev.onlyHiddenGems }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filters.onlyHiddenGems
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>Hidden Gems</span>
            </button>

            <button
              onClick={() => setShowOnlySaved(!showOnlySaved)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showOnlySaved
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedPlaceIds.length})</span>
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="pl-8 pr-4 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                id="explore-sort-select"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="budget-asc">Sort: Budget (Low to High)</option>
                <option value="budget-desc">Sort: Budget (High to Low)</option>
                <option value="newest">Sort: Newly Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Body: Filter Sidebar + Place Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm sticky top-28 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                  Filter Destinations
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 block">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      filters.category === 'all'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{places.length}</span>
                  </button>
                  {categories.map(cat => {
                    const count = places.filter(p => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          filters.category === cat.id
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-stone-400 text-[11px]">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vibes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 block">
                  Vibe Tag
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, vibe: 'all' }))}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filters.vibe === 'all'
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    All Vibes
                  </button>
                  {vibes.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setFilters(prev => ({ ...prev, vibe: v.name }))}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filters.vibe === v.name
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      #{v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area / Locality */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                  Lucknow Locality / Area
                </label>
                <select
                  value={filters.area}
                  onChange={e => setFilters(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Localities</option>
                  {distinctAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Best Time to Visit */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                  Best Time of Day
                </label>
                <select
                  value={filters.bestTime}
                  onChange={e => setFilters(prev => ({ ...prev, bestTime: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Any Time of Day</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening (Sunset / Night)</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Max Estimated Budget
                  </label>
                  <span className="text-xs font-bold text-amber-800">
                    {filters.budgetMax >= 1000 ? 'Any Budget' : `₹${filters.budgetMax}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={filters.budgetMax}
                  onChange={e => setFilters(prev => ({ ...prev, budgetMax: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>Free (₹0)</span>
                  <span>₹500</span>
                  <span>₹1000+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Place Grid Results */}
          <div className="lg:col-span-3">
            {/* Active filters pill bar */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-500 font-medium">Active Filters:</span>
                {filters.category !== 'all' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold flex items-center gap-1">
                    Category: {filters.category}
                    <button onClick={() => setFilters(p => ({ ...p, category: 'all' }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.vibe !== 'all' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold flex items-center gap-1">
                    Vibe: {filters.vibe}
                    <button onClick={() => setFilters(p => ({ ...p, vibe: 'all' }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.area !== 'all' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold flex items-center gap-1">
                    Area: {filters.area}
                    <button onClick={() => setFilters(p => ({ ...p, area: 'all' }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.onlyFeatured && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-semibold flex items-center gap-1">
                    Featured Only
                    <button onClick={() => setFilters(p => ({ ...p, onlyFeatured: false }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.onlyHiddenGems && (
                  <span className="px-2.5 py-1 rounded-full bg-teal-600 text-white font-semibold flex items-center gap-1">
                    Hidden Gems
                    <button onClick={() => setFilters(p => ({ ...p, onlyHiddenGems: false }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {showOnlySaved && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-700 text-white font-semibold flex items-center gap-1">
                    Saved Places
                    <button onClick={() => setShowOnlySaved(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-amber-800 hover:underline font-bold ml-2 text-xs"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="mb-4 flex items-center justify-between text-xs text-stone-600">
              <span>Showing <strong>{filteredPlaces.length}</strong> matching destinations</span>
              <button 
                onClick={() => onNavigate('/map')}
                className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                View on Map
              </button>
            </div>

            {/* Grid */}
            {filteredPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPlaces.map(place => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onBookmarkChange={() => setSavedPlaceIds(StorageService.getBookmarks())}
                    onNavigate={(slug) => onNavigate(`/places/${slug}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No destinations match your filters"
                description="Try expanding your budget range, resetting category selections, or searching with broader keywords."
                onReset={handleResetFilters}
                resetLabel="Reset All Filters"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
