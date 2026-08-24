import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { PlaceService } from '../services/placeService';
import { PlaceCard } from '../components/common/PlaceCard';
import { Flame, Sparkles, ArrowLeft } from 'lucide-react';

interface FeaturedPageProps {
  onNavigate: (route: string) => void;
}

export const FeaturedPage: React.FC<FeaturedPageProps> = ({ onNavigate }) => {
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);

  useEffect(() => {
    setFeaturedPlaces(PlaceService.getFeaturedPlaces());
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="featured-lucknow-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin-Curated Highlights</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
            Featured Lucknow
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
            The most iconic, culturally indispensable, and world-renowned destinations across Lucknow. Managed in real-time through the curator admin panel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPlaces.map((place) => (
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
