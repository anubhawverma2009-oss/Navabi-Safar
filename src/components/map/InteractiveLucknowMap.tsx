import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Place, PlaceCategory } from '../../types';
import { StorageService } from '../../services/storageService';
import { MapPin, Search, Eye, Navigation, IndianRupee, Layers } from 'lucide-react';

interface Props {
  places?: Place[];
  selectedPlaceId?: string;
  onSelectPlace?: (place: Place) => void;
  height?: string;
  initialCategory?: string;
  showControls?: boolean;
}

export const InteractiveLucknowMap: React.FC<Props> = ({
  places: propPlaces,
  selectedPlaceId,
  onSelectPlace,
  height = '600px',
  initialCategory = 'all',
  showControls = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlace, setActivePlace] = useState<Place | null>(null);

  useEffect(() => {
    if (propPlaces) {
      setPlaces(propPlaces);
    } else {
      const stored = StorageService.getPlaces().filter(p => p.status === 'published' && p.latitude && p.longitude);
      setPlaces(stored);
    }
  }, [propPlaces]);

  // Filtered places
  const filteredPlaces = places.filter(place => {
    const matchesCat = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.8520, 80.9380], // Central Lucknow (Hazratganj / Riverfront)
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Premium CartoDB Positron / OSM tiles for clean aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size immediately and after layout finishes painting
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    const getPinColor = (category: PlaceCategory) => {
      switch (category) {
        case 'historical':
        case 'landmarks':
          return '#B45309'; // Amber/Gold
        case 'food':
          return '#DC2626'; // Red
        case 'shopping':
          return '#DB2777'; // Pink
        case 'parks':
          return '#059669'; // Emerald
        case 'culture':
          return '#7C3AED'; // Purple
        case 'hidden-gems':
          return '#0D9488'; // Teal
        default:
          return '#2563EB'; // Blue
      }
    };

    filteredPlaces.forEach(place => {
      const color = getPinColor(place.category);
      const isSelected = selectedPlaceId === place.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background: ${color};">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="w-2 h-2 bg-stone-800 rotate-45 -mt-1 mx-auto shadow-sm"></div>
          </div>
        `,
        iconSize: [40, 44],
        iconAnchor: [20, 44],
        popupAnchor: [0, -44]
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const popupContent = `
        <div class="w-64 bg-white rounded-xl overflow-hidden shadow-2xl font-sans text-stone-900 border border-stone-200">
          <div class="relative h-28 w-full bg-stone-800 overflow-hidden">
            <img src="${place.coverImage}" alt="${place.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white tracking-wide uppercase" style="background: ${color}">
              ${place.category}
            </span>
            ${place.featured ? '<span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-900 shadow">Featured</span>' : ''}
          </div>
          <div class="p-3">
            <h4 class="font-bold text-sm text-stone-900 leading-tight">${place.name}</h4>
            <p class="text-xs text-amber-800 font-medium mt-0.5">${place.area} • ${place.recommendedDuration}</p>
            <p class="text-xs text-stone-600 line-clamp-2 mt-1">${place.shortDescription}</p>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-xs">
              <span class="font-semibold text-stone-700">₹${place.estimatedBudget} / person</span>
              <a href="/places/${place.slug}" class="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900 transition-colors">
                Details →
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setActivePlace(place);
        if (onSelectPlace) {
          onSelectPlace(place);
        }
      });

      markersRef.current[place.id] = marker;
    });

    // If selected place is passed, fly to it
    if (selectedPlaceId && markersRef.current[selectedPlaceId]) {
      const place = places.find(p => p.id === selectedPlaceId);
      if (place) {
        map.flyTo([place.latitude, place.longitude], 15, { duration: 1.5 });
        markersRef.current[selectedPlaceId].openPopup();
      }
    }
  }, [filteredPlaces, selectedPlaceId, onSelectPlace, places]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.8520, 80.9380], 13, { duration: 1.2 });
    }
  };

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-100 flex flex-col ${height === '100%' ? 'h-full min-h-[480px]' : ''}`} 
      style={{ height: height !== '100%' ? height : undefined }}
      id="interactive-lucknow-map-wrapper"
    >
      {showControls && (
        <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-b border-stone-200 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search map destinations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                id="map-search-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Destinations' },
              { id: 'historical', label: 'Historical' },
              { id: 'food', label: 'Food' },
              { id: 'shopping', label: 'Shopping' },
              { id: 'parks', label: 'Parks' },
              { id: 'hidden-gems', label: 'Hidden Gems' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                id={`map-filter-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecenter}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
              title="Recenter Lucknow City"
              id="map-recenter-button"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Center City</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full min-h-[380px] lg:min-h-0 z-0 relative"
        id="leaflet-lucknow-map-container"
      />

      {/* Map Legend & Active Marker Stats */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-stone-200/80 text-xs flex items-center gap-3 max-w-[calc(100%-24px)] overflow-x-auto">
        <span className="font-bold text-stone-900 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          Showing {filteredPlaces.length} Destinations
        </span>
        <div className="h-3 w-px bg-stone-200"></div>
        <div className="flex items-center gap-2 text-[11px] text-stone-600 font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Heritage</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Food</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span> Shopping</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Parks</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Hidden Gems</span>
        </div>
      </div>
    </div>
  );
};
