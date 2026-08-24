import React, { useState, useEffect } from 'react';
import { Place, VibeInfo, PlaceVibe } from '../types';
import { PlaceService } from '../services/placeService';
import { StorageService } from '../services/storageService';
import { PlaceCard } from '../components/common/PlaceCard';
import { VibeCard } from '../components/common/VibeCard';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface VibesPageProps {
  onNavigate: (route: string) => void;
  selectedVibeName?: string;
}

export const VibesPage: React.FC<VibesPageProps> = ({ onNavigate, selectedVibeName }) => {
  const [vibes, setVibes] = useState<VibeInfo[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeVibe, setActiveVibe] = useState<PlaceVibe | 'all'>((selectedVibeName as PlaceVibe) || 'all');

  useEffect(() => {
    setVibes(StorageService.getVibes());
    setPlaces(PlaceService.getPublishedPlaces());
  }, []);

  const filteredPlaces = activeVibe === 'all'
    ? places
    : places.filter(p => p.vibes.includes(activeVibe));

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="vibes-exploration-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Vibe Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
            Explore Lucknow by Vibe
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
            Choose the mood of your journey — from royal architectural grandeur to serene lakeside sunsets, authentic foodie pilgrimages, and vibrant bazaars.
          </p>
        </div>

        {/* Vibe Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-12">
          <button
            onClick={() => setActiveVibe('all')}
            className={`p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all ${
              activeVibe === 'all'
                ? 'bg-stone-900 text-white border-stone-950 shadow-md'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div>All Vibes</div>
            <div className="text-[11px] font-normal text-stone-400 mt-1">{places.length} Destinations</div>
          </button>

          {vibes.map((vibe) => {
            const count = places.filter(p => p.vibes.includes(vibe.name)).length;
            return (
              <VibeCard
                key={vibe.id}
                vibe={vibe}
                placeCount={count}
                isSelected={activeVibe === vibe.name}
                onClick={() => setActiveVibe(vibe.name)}
              />
            );
          })}
        </div>

        {/* Filtered Places Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-stone-900">
              {activeVibe === 'all' ? 'All Curated Destinations' : `Destinations matching #${activeVibe}`}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Showing {filteredPlaces.length} verified places
            </p>
          </div>
          {activeVibe !== 'all' && (
            <button
              onClick={() => setActiveVibe('all')}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Show All
            </button>
          )}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onNavigate={(slug) => onNavigate(`/places/${slug}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
