import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { PlaceService } from '../services/placeService';
import { PlaceCard } from '../components/common/PlaceCard';
import { Gem, ArrowLeft } from 'lucide-react';

interface HiddenGemsPageProps {
  onNavigate: (route: string) => void;
}

export const HiddenGemsPage: React.FC<HiddenGemsPageProps> = ({ onNavigate }) => {
  const [hiddenGems, setHiddenGems] = useState<Place[]>([]);

  useEffect(() => {
    setHiddenGems(PlaceService.getHiddenGems());
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="hidden-gems-lucknow-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300/60 mb-2">
            <Gem className="w-3.5 h-3.5 text-teal-600" />
            <span>Off-Beat Awadhi Secrets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
            Hidden Gems of Lucknow
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
            Lesser-known architectural wonders, secluded hunting lodges, eccentric French estates, optical illusion art galleries, and historic breakfast stalls away from tourist crowds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {hiddenGems.map((place) => (
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
