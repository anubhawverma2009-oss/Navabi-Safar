import React, { useState, useEffect } from 'react';
import { Place, PlaceCategory } from '../types';
import { PlaceService } from '../services/placeService';
import { InteractiveLucknowMap } from '../components/map/InteractiveLucknowMap';
import { Map, Navigation, Layers, Compass, ArrowLeft, Sparkles, MapPin, IndianRupee, Clock, Search, ListFilter, ExternalLink, Calendar, Star } from 'lucide-react';

interface MapPageProps {
  onNavigate: (route: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onNavigate }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'details' | 'list'>('details');
  const [listFilter, setListFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loaded = PlaceService.getPublishedPlaces();
    setPlaces(loaded);
    if (loaded.length > 0) {
      setSelectedPlace(loaded[0]);
    }
  }, []);

  const filteredListPlaces = places.filter(p => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = !listFilter.trim() || 
      p.name.toLowerCase().includes(listFilter.toLowerCase()) ||
      p.area.toLowerCase().includes(listFilter.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(listFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setSidebarTab('details');
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col" id="interactive-lucknow-map-page">
      {/* Top Header */}
      <div className="bg-[#181512] text-white py-5 sm:py-6 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('/')}
                className="p-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Back to Home"
                id="map-back-home-btn"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-heading text-white flex items-center gap-2">
                <span>Interactive Lucknow Map</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                  {places.length} Locations
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 pl-9">
              Pinpoint monuments, Awadhi kebab joints, Chikankari bazaars, and scenic parks with precise GPS coordinates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pl-9 sm:pl-0">
            <button
              onClick={() => onNavigate('/build-my-day')}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              id="map-plan-day-btn"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Build My Day</span>
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              id="map-view-grid-btn"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full Interactive Map (8 cols on lg = 67%) */}
        <div className="lg:col-span-8 h-[480px] sm:h-[560px] lg:h-[720px] xl:h-[760px] flex flex-col w-full">
          <InteractiveLucknowMap
            places={places}
            selectedPlaceId={selectedPlace?.id}
            onSelectPlace={handleSelectPlace}
            height="100%"
            showControls={true}
          />
        </div>

        {/* Selected Destination Preview Sidebar (4 cols on lg = 33%) */}
        <div className="lg:col-span-4 h-[520px] sm:h-[580px] lg:h-[720px] xl:h-[760px] flex flex-col w-full">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg flex-1 flex flex-col overflow-hidden">
            {/* Sidebar Tab Bar */}
            <div className="flex items-center border-b border-stone-100 bg-stone-50/80 p-1.5">
              <button
                onClick={() => setSidebarTab('details')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'details'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="sidebar-tab-details"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Destination Intel</span>
              </button>
              <button
                onClick={() => setSidebarTab('list')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'list'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="sidebar-tab-list"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>All Places ({places.length})</span>
              </button>
            </div>

            {/* TAB 1: Selected Place Details */}
            {sidebarTab === 'details' && (
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                {selectedPlace ? (
                  <div className="space-y-4">
                    <div className="relative h-48 rounded-xl overflow-hidden bg-stone-900 shadow-sm group">
                      <img
                        src={selectedPlace.coverImage}
                        alt={selectedPlace.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow">
                        {selectedPlace.category}
                      </span>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center justify-between text-xs">
                        <span className="text-amber-300 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedPlace.area}
                        </span>
                        {selectedPlace.hiddenGem && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-600/90 text-[10px] font-bold text-white">
                            Hidden Gem
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {selectedPlace.hindiName && (
                        <span className="text-xs font-serif text-amber-800 font-semibold block mb-0.5">
                          {selectedPlace.hindiName}
                        </span>
                      )}
                      <h3 className="text-xl font-bold font-serif-heading text-stone-900 leading-snug">
                        {selectedPlace.name}
                      </h3>
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[11px]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{selectedPlace.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-stone-500 text-[11px]">
                            • {selectedPlace.reviewCount || 0} reviews
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {selectedPlace.shortDescription}
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                      <div>
                        <div className="text-stone-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Timings</span>
                        </div>
                        <div className="font-semibold text-stone-800 mt-0.5">{selectedPlace.openingTime} - {selectedPlace.closingTime}</div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-amber-600" />
                          <span>Budget / Person</span>
                        </div>
                        <div className="font-semibold text-amber-800 mt-0.5">
                          {selectedPlace.estimatedBudget === 0 ? 'Free' : `₹${selectedPlace.estimatedBudget}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Best Time</div>
                        <div className="font-semibold text-stone-800 mt-0.5">{selectedPlace.bestTime}</div>
                      </div>
                      <div>
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Duration</div>
                        <div className="font-semibold text-stone-800 mt-0.5">{selectedPlace.recommendedDuration}</div>
                      </div>
                    </div>

                    {/* Vibes */}
                    <div>
                      <div className="text-stone-400 text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Experience Vibes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlace.vibes.map(v => (
                          <span key={v} className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-900 rounded-md border border-amber-200">
                            #{v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={() => onNavigate(`/places/${selectedPlace.slug}`)}
                        className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                        id="open-place-details-btn"
                      >
                        <span>Open Place Details</span>
                        <span>→</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1.5 border border-stone-200"
                        id="open-google-maps-btn"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-700" />
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 text-xs">
                    <MapPin className="w-8 h-8 text-stone-300 mb-2" />
                    <p className="font-medium text-stone-600">No destination selected</p>
                    <p className="mt-1 text-[11px]">Click any marker on the map or pick from the destination list.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Quick Destination List */}
            {sidebarTab === 'list' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search in List */}
                <div className="p-3 border-b border-stone-100 bg-stone-50/50">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={listFilter}
                      onChange={e => setListFilter(e.target.value)}
                      placeholder="Filter places in list..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>

                {/* Places Scroll List */}
                <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
                  {filteredListPlaces.map(place => {
                    const isSelected = selectedPlace?.id === place.id;
                    return (
                      <button
                        key={place.id}
                        onClick={() => handleSelectPlace(place)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-50 border border-amber-200'
                            : 'hover:bg-stone-50 border border-transparent'
                        }`}
                      >
                        <img
                          src={place.coverImage}
                          alt={place.name}
                          className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-stone-900 truncate">
                            {place.name}
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="capitalize text-amber-800 font-medium">{place.category}</span>
                            <span>•</span>
                            <span className="truncate">{place.area}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-bold text-stone-700">
                            {place.estimatedBudget === 0 ? 'Free' : `₹${place.estimatedBudget}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredListPlaces.length === 0 && (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No matching destinations found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

