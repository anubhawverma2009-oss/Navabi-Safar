import React from 'react';
import { CategoryInfo } from '../../types';
import { Landmark, Utensils, ShoppingBag, Trees, Music, Sparkles, Compass, Church, Gem, ArrowRight } from 'lucide-react';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Landmark,
  Utensils,
  ShoppingBag,
  Trees,
  Music,
  Sparkles,
  Compass,
  Church,
  Gem
};

interface CategoryCardProps {
  category: CategoryInfo;
  placeCount?: number;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  placeCount,
  onClick
}) => {
  const IconComponent = iconMap[category.iconName] || Compass;

  return (
    <div
      onClick={onClick}
      id={`category-card-${category.id}`}
      className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-200/80 flex flex-col justify-end p-5 bg-stone-900"
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-60"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-amber-950/20 mix-blend-multiply opacity-60 group-hover:opacity-30 transition-opacity" />

      {/* Content */}
      <div className="relative z-10 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/90 text-stone-950 flex items-center justify-center backdrop-blur-md shadow-md group-hover:bg-amber-400 group-hover:scale-110 transition-all">
            <IconComponent className="w-5 h-5" />
          </div>
          {typeof placeCount === 'number' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/20 text-white">
              {placeCount} Places
            </span>
          )}
        </div>

        {category.hindiName && (
          <p className="text-xs text-amber-300/90 font-serif mb-0.5 tracking-wide">
            {category.hindiName}
          </p>
        )}

        <h3 className="text-xl font-bold font-serif-heading text-white group-hover:text-amber-300 transition-colors leading-snug">
          {category.name}
        </h3>

        <p className="text-xs text-stone-300 line-clamp-2 mt-1.5 leading-relaxed">
          {category.description}
        </p>

        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
          <span>Explore Category</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
