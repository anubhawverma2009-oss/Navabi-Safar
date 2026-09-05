import React from 'react';
import { Place } from '../../types';
import { MapPin, Clock, IndianRupee, Star, Bookmark, Gem, Sparkles, ArrowUpRight } from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface PlaceCardProps {
  place: Place;
  onBookmarkChange?: () => void;
  variant?: 'standard' | 'compact' | 'featured-hero';
  onNavigate?: (slug: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onBookmarkChange,
  variant = 'standard',
  onNavigate
}) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    const bookmarks = StorageService.getBookmarks();
    setIsBookmarked(bookmarks.includes(place.id));
  }, [place.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    StorageService.toggleBookmark(place.id);
    setIsBookmarked(!isBookmarked);
    if (onBookmarkChange) onBookmarkChange();
  };

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(place.slug);
    } else {
      window.location.href = `/places/${place.slug}`;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      id={`place-card-${place.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative w-full h-52 overflow-hidden bg-stone-900">
        <img
          src={place.coverImage}
          alt={place.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/95 text-stone-900 backdrop-blur-md shadow-sm">
              {place.category}
            </span>
            {place.featured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
            {place.hiddenGem && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1 shadow-sm">
                <Gem className="w-3 h-3" />
                Hidden Gem
              </span>
            )}
          </div>

          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
            id={`bookmark-btn-${place.id}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
          <div className="flex items-center gap-1.5 text-xs text-stone-200 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium truncate max-w-[150px]">{place.area}</span>
          </div>
          {place.rating && (
            <div className="flex items-center gap-1 bg-amber-500/95 text-stone-950 font-bold px-2 py-0.5 rounded-md text-xs backdrop-blur-sm shadow-xs">
              <Star className="w-3 h-3 fill-stone-950" />
              <span>{place.rating.toFixed(1)}</span>
              {place.reviewCount !== undefined && place.reviewCount > 0 && (
                <span className="text-[10px] text-stone-900/80 font-normal">({place.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {place.hindiName && (
            <span className="text-[11px] font-serif tracking-wide text-amber-800 font-semibold mb-1 block">
              {place.hindiName}
            </span>
          )}
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
            {place.name}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
            {place.shortDescription}
          </p>

          {/* Vibe Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {place.vibes.slice(0, 3).map((vibe) => (
              <span
                key={vibe}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-stone-100 text-stone-700 border border-stone-200/60"
              >
                #{vibe}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Recommended Duration">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {place.recommendedDuration}
            </span>
            <span className="flex items-center gap-0.5 font-semibold text-stone-800" title="Estimated Budget">
              <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
              {place.estimatedBudget === 0 ? 'Free' : `~₹${place.estimatedBudget}`}
            </span>
          </div>

          <span className="flex items-center gap-1 font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
            Explore <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
