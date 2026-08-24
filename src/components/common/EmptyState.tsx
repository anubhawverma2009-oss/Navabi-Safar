import React from 'react';
import { SearchX, RefreshCcw, Compass, MapPin } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  icon?: 'search' | 'map' | 'compass';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No destinations found',
  description = 'Try adjusting your search terms, changing the category, or clearing your vibe filters.',
  onReset,
  resetLabel = 'Reset Filters',
  icon = 'search'
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'map':
        return <MapPin className="w-10 h-10 text-amber-700" />;
      case 'compass':
        return <Compass className="w-10 h-10 text-amber-700" />;
      default:
        return <SearchX className="w-10 h-10 text-amber-700" />;
    }
  };

  return (
    <div className="w-full py-16 px-6 text-center bg-white rounded-3xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-stone-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          {resetLabel}
        </button>
      )}
    </div>
  );
};
