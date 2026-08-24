import React from 'react';
import { VibeInfo } from '../../types';
import { 
  Landmark, Utensils, Camera, Feather, Users, ShoppingBag, 
  BookOpen, Sun, Gem, Coins, Building, Sparkles, Compass 
} from 'lucide-react';

const vibeIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Landmark,
  Utensils,
  Camera,
  Feather,
  Users,
  ShoppingBag,
  BookOpen,
  Sun,
  Gem,
  Coins,
  Building,
  Sparkles,
  Compass
};

interface VibeCardProps {
  vibe: VibeInfo;
  placeCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const VibeCard: React.FC<VibeCardProps> = ({
  vibe,
  placeCount,
  isSelected,
  onClick
}) => {
  const Icon = vibeIcons[vibe.iconName] || Sparkles;

  return (
    <div
      onClick={onClick}
      id={`vibe-card-${vibe.id}`}
      className={`group relative p-5 rounded-2xl cursor-pointer border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'bg-amber-900 text-white border-amber-700 ring-2 ring-amber-500 shadow-lg'
          : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-200 hover:border-amber-400/60 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-amber-500 text-stone-950 shadow'
            : 'bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-stone-950'
        }`}>
          <Icon className="w-5 h-5" />
        </div>

        {typeof placeCount === 'number' && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-stone-100 text-stone-600'
          }`}>
            {placeCount} spots
          </span>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-base font-serif-heading leading-snug">
          {vibe.name}
        </h4>
        <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
          isSelected ? 'text-amber-100' : 'text-stone-500'
        }`}>
          {vibe.description}
        </p>
      </div>

      <div className={`mt-3 pt-2.5 border-t text-[11px] font-bold flex items-center justify-between ${
        isSelected ? 'border-amber-800 text-amber-300' : 'border-stone-100 text-amber-700'
      }`}>
        <span>Explore #{vibe.name}</span>
        <span>→</span>
      </div>
    </div>
  );
};
