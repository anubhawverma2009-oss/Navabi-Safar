import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { PlaceService } from '../services/placeService';
import { StorageService } from '../services/storageService';
import { PlaceCard } from '../components/common/PlaceCard';
import { PlaceReviewsSection } from '../components/reviews/PlaceReviewsSection';
import { 
  MapPin, Clock, IndianRupee, Star, Bookmark, Share2, Sparkles, 
  Gem, CheckCircle2, Navigation, Train, Bus, Car, ArrowLeft, 
  Layers, Compass, Info, Heart, Eye
} from 'lucide-react';

interface PlaceDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({ slug, onNavigate }) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    const loadCurrentPlace = () => {
      const loadedPlace = PlaceService.getPlaceBySlug(slug);
      if (loadedPlace) {
        setPlace(loadedPlace);
        const nearby = PlaceService.getNearbyPlaces(loadedPlace, 3);
        setNearbyPlaces(nearby);
        const bookmarks = StorageService.getBookmarks();
        setIsBookmarked(bookmarks.includes(loadedPlace.id));
      }
    };

    loadCurrentPlace();
    window.scrollTo(0, 0);

    const unsubscribe = StorageService.subscribe(loadCurrentPlace);
    return () => {
      unsubscribe();
    };
  }, [slug]);

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-md max-w-md">
          <h2 className="text-2xl font-bold font-serif-heading text-stone-900 mb-2">
            Destination Not Found
          </h2>
          <p className="text-sm text-stone-600 mb-6">
            The destination you are looking for does not exist or may have been updated.
          </p>
          <button
            onClick={() => onNavigate('/explore')}
            className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow transition-all"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const handleBookmarkToggle = () => {
    StorageService.toggleBookmark(place.id);
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const allImages = [place.coverImage, ...(place.galleryImages || [])].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 pb-20" id="place-detail-page-container">
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[65vh] min-h-[450px] max-h-[650px] bg-stone-950 text-white overflow-hidden">
        <img
          src={allImages[activeGalleryIndex] || place.coverImage}
          alt={place.name}
          className="w-full h-full object-cover object-center transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/30" />

        {/* Back navigation & Action Bar */}
        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20">
          <button
            onClick={() => onNavigate('/explore')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all"
            id="back-to-explore-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Destinations</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
                isBookmarked
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
              title={isBookmarked ? 'Saved to Bookmarks' : 'Save Place'}
              id="detail-bookmark-btn"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Share Link"
              id="detail-share-btn"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-[11px] text-amber-300">Link Copied!</span>}
            </button>
          </div>
        </div>

        {/* Hero Title and Meta */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 max-w-4xl z-20">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md">
              {place.category}
            </span>
            {place.featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Featured Spot
              </span>
            )}
            {place.hiddenGem && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" /> Hidden Gem
              </span>
            )}
          </div>

          {place.hindiName && (
            <p className="text-amber-300 font-serif text-base sm:text-lg font-semibold tracking-wide">
              {place.hindiName}
            </p>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-heading text-white tracking-tight leading-tight mt-1">
            {place.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-stone-200 mt-4">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-amber-400" />
              {place.area}, Lucknow
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              {place.recommendedDuration}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm font-semibold">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              {place.estimatedBudget === 0 ? 'Free Entry' : `~₹${place.estimatedBudget} / person`}
            </span>
            {place.rating && (
              <span className="flex items-center gap-1 bg-amber-500 text-stone-950 font-bold px-2.5 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 fill-stone-950" />
                {place.rating.toFixed(1)} ({place.reviewsCount || 850}+ reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT & SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Strip */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-700" />
                  Visual Gallery ({allImages.length} Photos)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        activeGalleryIndex === idx ? 'border-amber-600 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${place.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Overview & Vibe Badges */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-heading text-stone-900 mb-3">
                  Overview & Experience
                </h2>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                  {place.description}
                </p>
              </div>

              {/* Vibe Chips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Experience Vibes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {place.vibes.map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => onNavigate(`/explore?vibe=${vibe}`)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      #{vibe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Historical & Cultural Story */}
              {place.story && (
                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-xl font-bold font-serif-heading text-amber-950 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-700" />
                    The Royal Heritage & History
                  </h3>
                  <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/60 text-stone-800 text-sm sm:text-base leading-relaxed italic font-serif">
                    “{place.story}”
                  </div>
                </div>
              )}

              {/* Why Visit Highlights */}
              {place.whyVisit && place.whyVisit.length > 0 && (
                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-4">
                    Why You Must Visit
                  </h3>
                  <div className="space-y-2.5">
                    {place.whyVisit.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-stone-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* How to Reach & Logistics */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                How to Reach & Local Transport Tips
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                {place.howToReach.nearestMetro && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                    <Train className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Nearest Metro Station</div>
                      <div className="text-stone-600 mt-0.5">{place.howToReach.nearestMetro}</div>
                    </div>
                  </div>
                )}

                {place.howToReach.autoCabTips && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                    <Car className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Auto & E-Rickshaw Advice</div>
                      <div className="text-stone-600 mt-0.5">{place.howToReach.autoCabTips}</div>
                    </div>
                  </div>
                )}

                {place.howToReach.busRoute && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                    <Bus className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Bus Transit</div>
                      <div className="text-stone-600 mt-0.5">{place.howToReach.busRoute}</div>
                    </div>
                  </div>
                )}

                {place.howToReach.parking && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Parking Information</div>
                      <div className="text-stone-600 mt-0.5">{place.howToReach.parking}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar (1 Col): Key Visit Data & Location Card */}
          <div className="space-y-6">
            {/* Quick Visit Facts Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-md space-y-5 sticky top-24">
              <h3 className="font-bold text-lg font-serif-heading text-stone-900 pb-3 border-b border-stone-100">
                Visitor Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Timings</div>
                  <div className="font-bold text-stone-900 text-sm mt-0.5">{place.openingTime} – {place.closingTime}</div>
                </div>

                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Entry Fee & Tickets</div>
                  <div className="font-bold text-stone-900 text-sm mt-0.5">{place.entryFee}</div>
                </div>

                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Estimated Budget</div>
                  <div className="font-bold text-amber-800 text-base mt-0.5">
                    {place.estimatedBudget === 0 ? 'Free' : `₹${place.estimatedBudget} / person`}
                  </div>
                </div>

                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Best Time to Visit</div>
                  <div className="font-bold text-stone-900 text-sm mt-0.5">{place.bestTime}</div>
                </div>

                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Recommended Duration</div>
                  <div className="font-bold text-stone-900 text-sm mt-0.5">{place.recommendedDuration}</div>
                </div>

                <div>
                  <div className="text-stone-500 font-semibold uppercase text-[11px] tracking-wider">Address & Area</div>
                  <div className="text-stone-800 font-medium mt-0.5 text-xs leading-relaxed">{place.address}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 space-y-2.5">
                <a
                  href={
                    place.googleMapsUrl ||
                    place.howToReach?.googleMapsUrl ||
                    (place.latitude && place.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + place.area + ', Lucknow')}`)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-md transition-all"
                  id="place-get-directions-btn"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Live Directions</span>
                </a>

                <button
                  onClick={() => onNavigate('/build-my-day')}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-all"
                >
                  <span>Include in My Day Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. REVIEWS & RATINGS SECTION */}
        <div className="mt-12">
          <PlaceReviewsSection
            place={place}
            onReviewSubmitted={() => {
              const reloaded = PlaceService.getPlaceBySlug(slug);
              if (reloaded) setPlace(reloaded);
            }}
          />
        </div>

        {/* 4. NEARBY DESTINATIONS */}
        {nearbyPlaces.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Continue Your Safar
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900 mt-1">
                  Nearby Attractions in {place.area}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/explore')}
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                View all places →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyPlaces.map((np) => (
                <PlaceCard
                  key={np.id}
                  place={np}
                  onNavigate={(slug) => onNavigate(`/places/${slug}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
