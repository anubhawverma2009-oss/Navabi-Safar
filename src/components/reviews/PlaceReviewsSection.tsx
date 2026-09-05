import React, { useState, useEffect } from 'react';
import { Place, PlaceReview, VisitExperience, ReviewFilterOptions } from '../../types';
import { FeedbackService } from '../../services/feedbackService';
import { 
  Star, ThumbsUp, MessageSquare, Filter, Plus, CheckCircle2, 
  Sparkles, Calendar, MapPin, User, Send, ShieldCheck, AlertCircle, 
  ChevronDown, X
} from 'lucide-react';

interface PlaceReviewsSectionProps {
  place: Place;
  onReviewSubmitted?: () => void;
}

const VISIT_TYPES: VisitExperience[] = [
  'Solo Explorer',
  'Family Trip',
  'Friends Group',
  'Couples & Romantic',
  'Heritage Enthusiast',
  'Foodie / Culinary Walk',
  'Photography Tour',
  'Local Resident'
];

export const PlaceReviewsSection: React.FC<PlaceReviewsSectionProps> = ({ place, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: place.rating || 4.8,
    totalCount: place.reviewsCount || 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
  });

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<ReviewFilterOptions['sortBy']>('recent');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  // Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [visitExperience, setVisitExperience] = useState<VisitExperience>('Solo Explorer');
  const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadReviewsData = () => {
    const list = FeedbackService.getReviewsForPlace(place.id, {
      sortBy,
      ratingFilter: starFilter
    });
    setReviews(list);
    const summary = FeedbackService.getPlaceRatingSummary(place.id, place.rating, place.reviewsCount);
    setRatingSummary(summary);
  };

  useEffect(() => {
    loadReviewsData();
    const unsubscribe = FeedbackService.subscribe(() => {
      loadReviewsData();
    });
    return () => {
      unsubscribe();
    };
  }, [place.id, sortBy, starFilter]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reviewText.trim() || reviewText.trim().length < 15) {
      setFormError('Please write a descriptive review of at least 15 characters to help other travellers.');
      return;
    }

    setIsSubmitting(true);
    try {
      FeedbackService.addPlaceReview({
        placeId: place.id,
        placeName: place.name,
        userName: userName.trim() || 'Fellow Traveller',
        userLocation: userLocation.trim() || 'Visitor',
        rating,
        reviewText: reviewText.trim(),
        visitExperience,
        visitedDate
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReviewModal(false);
        setReviewText('');
        setRating(5);
        if (onReviewSubmitted) onReviewSubmitted();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulVote = (reviewId: string) => {
    FeedbackService.voteHelpful(reviewId);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return 'Outstanding Awadhi Wonder';
      case 4: return 'Very Good Experience';
      case 3: return 'Average / Worth a Quick Look';
      case 2: return 'Disappointing / Needs Maintenance';
      case 1: return 'Poor Experience';
      default: return 'Rate Your Visit';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-8" id="destination-reviews-section">
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 font-mono">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Traveller Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900 mt-1">
            Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Genuine visitor accounts, photography tips, and heritage insights for {place.name}.
          </p>
        </div>

        <button
          onClick={() => setShowReviewModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 hover:scale-[1.02]"
          id="write-review-cta-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* 2. Rating Breakdown Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-stone-50/80 rounded-2xl p-5 sm:p-6 border border-stone-200/60">
        {/* Big Average Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-stone-200">
          <div className="text-5xl sm:text-6xl font-extrabold font-serif-heading text-amber-900 leading-none">
            {ratingSummary.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(ratingSummary.averageRating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold text-stone-600 mt-2">
            Based on {ratingSummary.totalCount} {ratingSummary.totalCount === 1 ? 'review' : 'reviews'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Lucknow Visitors</span>
          </div>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5 px-2 sm:px-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingSummary.distribution[stars] || 0;
            const pct = ratingSummary.percentages[stars] || 0;
            const isSelected = starFilter === stars;
            return (
              <button
                key={stars}
                onClick={() => setStarFilter(isSelected ? 'all' : stars)}
                className={`flex items-center gap-3 text-xs w-full group text-left rounded-lg p-1 transition-colors ${
                  isSelected ? 'bg-amber-100/70 font-bold' : 'hover:bg-stone-100'
                }`}
                title={`Filter by ${stars} stars`}
              >
                <div className="w-12 flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                  <span>{stars}</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-12 text-right text-stone-500 font-mono text-[11px] shrink-0">
                  {pct}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filters & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              starFilter === 'all'
                ? 'bg-amber-800 text-white font-bold shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Ratings ({ratingSummary.totalCount})
          </button>
          {[5, 4, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(starFilter === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                starFilter === s
                  ? 'bg-amber-800 text-white font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{s}★</span>
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ReviewFilterOptions['sortBy'])}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            id="review-sort-dropdown"
          >
            <option value="recent">Most Recent First</option>
            <option value="highest">Highest Rated (5★)</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <MessageSquare className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-base font-bold font-serif-heading text-stone-800">
              No matching reviews found
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              {starFilter !== 'all'
                ? `There are no ${starFilter}-star reviews yet. Try resetting the filter.`
                : `Be the very first traveller to share your experience visiting ${place.name}!`}
            </p>
            {starFilter !== 'all' ? (
              <button
                onClick={() => setStarFilter('all')}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
              >
                Show All Reviews
              </button>
            ) : (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3"
              id={`review-item-${rev.id}`}
            >
              {/* Reviewer Meta Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-stone-900 text-white font-bold font-serif text-sm flex items-center justify-center shadow-xs">
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {rev.userName}
                      </span>
                      {rev.userLocation && (
                        <span className="text-[11px] text-stone-500 font-medium">
                          • {rev.userLocation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatRelativeTime(rev.createdAt)}
                      </span>
                      {rev.visitExperience && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold text-[10px]">
                            {rev.visitExperience}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Star Badge */}
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900 ml-1">
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pt-1">
                “{rev.reviewText}”
              </p>

              {/* Review Footer: Helpful counter */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Review</span>
                </div>

                <button
                  onClick={() => handleHelpfulVote(rev.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    FeedbackService.hasVotedHelpful(rev.id)
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                  title="Mark this review as helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulVotes || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8 animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-serif-heading text-stone-900">
                  Shukriya! Review Published
                </h3>
                <p className="text-sm text-stone-600 max-w-sm mx-auto">
                  Your review for <strong>{place.name}</strong> is live and will help future travellers experience the best of Awadh.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono">
                    Share Your Awadh Experience
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-heading text-stone-900 mt-1">
                    Review {place.name}
                  </h3>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Star Rating Picker */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-center space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                    Your Overall Rating
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                        id={`star-rating-btn-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-amber-900">
                    {getRatingLabel(hoverRating || rating)}
                  </div>
                </div>

                {/* Visit Context Experience */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                    Visit Experience Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VISIT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setVisitExperience(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          visitExperience === type
                            ? 'bg-amber-800 text-white font-bold shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviewer Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Your Name <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Your City / Origin <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. Mumbai / Lucknow"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Written Review */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      Written Review & Advice <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {reviewText.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe what you loved most! Share tips about timings, guides, audio tours, photo angles, food nearby, or ticket counter queues..."
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    id="submit-review-form-btn"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Publishing...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
