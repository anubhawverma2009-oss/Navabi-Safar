import React, { useState, useEffect } from 'react';
import { Place, VisitExperience, PlatformFeedbackCategory, SuggestionCategory, IssueReportType } from '../types';
import { PlaceService } from '../services/placeService';
import { FeedbackService } from '../services/feedbackService';
import { 
  Star, MessageSquare, Lightbulb, AlertTriangle, CheckCircle2, 
  Send, Sparkles, MapPin, Heart, HelpCircle, ShieldCheck, 
  Search, ArrowRight, User, Mail, ThumbsUp, Calendar, ChevronRight
} from 'lucide-react';

interface FeedbackPageProps {
  onNavigate: (route: string) => void;
  initialTab?: 'place' | 'platform' | 'suggestion' | 'report';
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

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onNavigate, initialTab = 'place' }) => {
  const [activeTab, setActiveTab] = useState<'place' | 'platform' | 'suggestion' | 'report'>(initialTab);
  const [places, setPlaces] = useState<Place[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  // 1. PLACE REVIEW FORM STATE
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('bara-imambara');
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeRating, setPlaceRating] = useState(5);
  const [placeHoverRating, setPlaceHoverRating] = useState(0);
  const [placeUserName, setPlaceUserName] = useState('');
  const [placeUserLoc, setPlaceUserLoc] = useState('');
  const [placeVisitExp, setPlaceVisitExp] = useState<VisitExperience>('Solo Explorer');
  const [placeVisitDate, setPlaceVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [placeReviewText, setPlaceReviewText] = useState('');

  // 2. PLATFORM FEEDBACK FORM STATE
  const [platformCategory, setPlatformCategory] = useState<PlatformFeedbackCategory>('overall');
  const [platformRating, setPlatformRating] = useState(5);
  const [platformHoverRating, setPlatformHoverRating] = useState(0);
  const [platformMessage, setPlatformMessage] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [platformEmail, setPlatformEmail] = useState('');

  // 3. SUGGESTION FORM STATE
  const [sugCategory, setSugCategory] = useState<SuggestionCategory>('hidden_gem');
  const [sugTitle, setSugTitle] = useState('');
  const [sugDescription, setSugDescription] = useState('');
  const [sugLocation, setSugLocation] = useState('');
  const [sugName, setSugName] = useState('');
  const [sugEmail, setSugEmail] = useState('');

  // 4. REPORT FORM STATE
  const [reportPlaceId, setReportPlaceId] = useState<string>('general');
  const [reportType, setReportType] = useState<IssueReportType>('incorrect_timing');
  const [reportDescription, setReportDescription] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportEmail, setReportEmail] = useState('');

  // Common submission UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlaces(PlaceService.getPublishedPlaces());
    setRecentReviews(FeedbackService.getRecentVerifiedReviews(6));

    const unsubscribe = FeedbackService.subscribe(() => {
      setRecentReviews(FeedbackService.getRecentVerifiedReviews(6));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handlePlaceReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPlaceId) {
      setErrorMessage('Please select a destination to review.');
      return;
    }
    if (!placeReviewText.trim() || placeReviewText.trim().length < 15) {
      setErrorMessage('Please provide a written review of at least 15 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetPlace = places.find(p => p.id === selectedPlaceId);
      FeedbackService.addPlaceReview({
        placeId: selectedPlaceId,
        placeName: targetPlace?.name || 'Lucknow Destination',
        userName: placeUserName.trim() || 'Fellow Explorer',
        userLocation: placeUserLoc.trim() || 'Visitor',
        rating: placeRating,
        reviewText: placeReviewText.trim(),
        visitExperience: placeVisitExp,
        visitedDate: placeVisitDate
      });

      setSuccessMessage(`Shukriya! Your review for ${targetPlace?.name || 'this destination'} is now live.`);
      setPlaceReviewText('');
      setPlaceUserName('');
      setPlaceUserLoc('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlatformFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!platformMessage.trim() || platformMessage.trim().length < 10) {
      setErrorMessage('Please enter your feedback message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      FeedbackService.addPlatformFeedback({
        category: platformCategory,
        rating: platformRating,
        message: platformMessage.trim(),
        userName: platformName.trim() || 'Anonymous Explorer',
        email: platformEmail.trim() || undefined
      });

      setSuccessMessage('Thank you for sharing your thoughts on Nawabi Safar! Our team reads every submission.');
      setPlatformMessage('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sugTitle.trim()) {
      setErrorMessage('Please provide a title for your suggestion.');
      return;
    }
    if (!sugDescription.trim() || sugDescription.trim().length < 15) {
      setErrorMessage('Please provide details regarding your suggestion (at least 15 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      FeedbackService.addSuggestion({
        category: sugCategory,
        title: sugTitle.trim(),
        description: sugDescription.trim(),
        locationArea: sugLocation.trim() || undefined,
        suggestedBy: sugName.trim() || 'Curious Traveller',
        contactEmail: sugEmail.trim() || undefined
      });

      setSuccessMessage('Shukriya! Your idea has been sent to our Awadh curation team.');
      setSugTitle('');
      setSugDescription('');
      setSugLocation('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reportDescription.trim() || reportDescription.trim().length < 10) {
      setErrorMessage('Please describe the inaccuracy or issue clearly (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const placeObj = places.find(p => p.id === reportPlaceId);
      FeedbackService.addIssueReport({
        placeId: reportPlaceId !== 'general' ? reportPlaceId : undefined,
        placeName: placeObj?.name || (reportPlaceId === 'general' ? 'General Platform Info' : undefined),
        issueType: reportType,
        description: reportDescription.trim(),
        reportedBy: reportName.trim() || 'Concerned Visitor',
        contactEmail: reportEmail.trim() || undefined
      });

      setSuccessMessage('Thank you for reporting this issue. Our team will verify and update the records promptly.');
      setReportDescription('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlacesForSelect = places.filter(p => 
    p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
    p.area.toLowerCase().includes(placeSearch.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 pb-24" id="feedback-and-reviews-page">
      {/* 1. HERO BANNER */}
      <div className="relative bg-[#181512] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-800 lucknow-pattern">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Voice of Awadh</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-heading text-white tracking-tight leading-tight">
            Your Experience Matters
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Help us make discovering Lucknow better for everyone. Share destination reviews, suggest hidden gems, give platform feedback, or report outdated information.
          </p>

          {/* 4 Interactive Mode Selectors */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
            <button
              onClick={() => { setActiveTab('place'); setSuccessMessage(null); setErrorMessage(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                activeTab === 'place'
                  ? 'bg-amber-600 border-amber-400 text-stone-950 shadow-lg scale-[1.02]'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
              id="tab-btn-review-place"
            >
              <div className="flex items-center justify-between">
                <Star className={`w-5 h-5 ${activeTab === 'place' ? 'fill-stone-950 text-stone-950' : 'text-amber-400'}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">1/4</span>
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm">Review a Place</div>
                <div className={`text-[11px] leading-tight mt-0.5 ${activeTab === 'place' ? 'text-stone-900' : 'text-stone-400'}`}>
                  Rate Lucknow monuments & food
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('platform'); setSuccessMessage(null); setErrorMessage(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                activeTab === 'platform'
                  ? 'bg-amber-600 border-amber-400 text-stone-950 shadow-lg scale-[1.02]'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
              id="tab-btn-platform-feedback"
            >
              <div className="flex items-center justify-between">
                <MessageSquare className={`w-5 h-5 ${activeTab === 'platform' ? 'text-stone-950' : 'text-amber-400'}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">2/4</span>
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm">Platform Feedback</div>
                <div className={`text-[11px] leading-tight mt-0.5 ${activeTab === 'platform' ? 'text-stone-900' : 'text-stone-400'}`}>
                  Map, Day Planner & UI review
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('suggestion'); setSuccessMessage(null); setErrorMessage(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                activeTab === 'suggestion'
                  ? 'bg-amber-600 border-amber-400 text-stone-950 shadow-lg scale-[1.02]'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
              id="tab-btn-suggest-idea"
            >
              <div className="flex items-center justify-between">
                <Lightbulb className={`w-5 h-5 ${activeTab === 'suggestion' ? 'text-stone-950' : 'text-amber-400'}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">3/4</span>
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm">Suggest an Idea</div>
                <div className={`text-[11px] leading-tight mt-0.5 ${activeTab === 'suggestion' ? 'text-stone-900' : 'text-stone-400'}`}>
                  Add spots or hidden gems
                </div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('report'); setSuccessMessage(null); setErrorMessage(null); }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                activeTab === 'report'
                  ? 'bg-red-600 border-red-400 text-white shadow-lg scale-[1.02]'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
              id="tab-btn-report-issue"
            >
              <div className="flex items-center justify-between">
                <AlertTriangle className={`w-5 h-5 ${activeTab === 'report' ? 'text-white' : 'text-red-400'}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">4/4</span>
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm">Report an Issue</div>
                <div className={`text-[11px] leading-tight mt-0.5 ${activeTab === 'report' ? 'text-red-100' : 'text-stone-400'}`}>
                  Incorrect timings, price or location
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE FORM CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl">
          {/* Notifications */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: REVIEW A PLACE */}
          {activeTab === 'place' && (
            <form onSubmit={handlePlaceReviewSubmit} className="space-y-6" id="form-review-destination">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                  Review a Lucknow Destination
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Share your visit experiences, crowd insights, and tips for monuments, bazaars, and eateries.
                </p>
              </div>

              {/* Destination Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Select Destination / Spot <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      placeholder="Quick filter places..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>
                  <select
                    value={selectedPlaceId}
                    onChange={(e) => setSelectedPlaceId(e.target.value)}
                    className="w-full p-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {filteredPlacesForSelect.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.area})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Star Rating */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-center space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setPlaceRating(star)}
                      onMouseEnter={() => setPlaceHoverRating(star)}
                      onMouseLeave={() => setPlaceHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= (placeHoverRating || placeRating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Visit Experience Pills */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                  Your Travel Context
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {VISIT_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setPlaceVisitExp(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        placeVisitExp === type
                          ? 'bg-amber-800 text-white font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Name <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={placeUserName}
                    onChange={(e) => setPlaceUserName(e.target.value)}
                    placeholder="e.g. Zoya Akhtar"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Home City / Lucknow Resident
                  </label>
                  <input
                    type="text"
                    value={placeUserLoc}
                    onChange={(e) => setPlaceUserLoc(e.target.value)}
                    placeholder="e.g. Lucknow, Chowk or Bengaluru"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Your Detailed Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={placeReviewText}
                  onChange={(e) => setPlaceReviewText(e.target.value)}
                  placeholder="Share what made your visit special! Give advice on best time of day, photography spots, ticket booking, transport, or surrounding food joints..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                id="submit-place-review-btn"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Destination Review'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: PLATFORM FEEDBACK */}
          {activeTab === 'platform' && (
            <form onSubmit={handlePlatformFeedbackSubmit} className="space-y-6" id="form-platform-feedback">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                  Nawabi Safar Platform Experience
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  How was your digital journey exploring Lucknow through our website, map, and day planner?
                </p>
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Feedback Area
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'overall', label: 'Overall Website' },
                    { id: 'planner', label: 'Build My Day Planner' },
                    { id: 'map', label: 'Interactive Live Map' },
                    { id: 'design_ui', label: 'Design & Visuals' },
                    { id: 'content_quality', label: 'Information Quality' },
                    { id: 'speed', label: 'Speed & Performance' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPlatformCategory(cat.id as PlatformFeedbackCategory)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        platformCategory === cat.id
                          ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Star Rating */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-center space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Platform Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setPlatformRating(star)}
                      onMouseEnter={() => setPlatformHoverRating(star)}
                      onMouseLeave={() => setPlatformHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (platformHoverRating || platformRating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Your Suggestions / Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={platformMessage}
                  onChange={(e) => setPlatformMessage(e.target.value)}
                  placeholder="Tell us what you enjoyed, what feature was most helpful, or what we can refine to elevate Lucknow tourism..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              {/* Name / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Name <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="e.g. Manish Tiwari"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Email <span className="text-stone-400 font-normal">(Optional, for updates)</span>
                  </label>
                  <input
                    type="email"
                    value={platformEmail}
                    onChange={(e) => setPlatformEmail(e.target.value)}
                    placeholder="e.g. manish@example.com"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                id="submit-platform-feedback-btn"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Platform Feedback'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: SUGGEST AN IDEA */}
          {activeTab === 'suggestion' && (
            <form onSubmit={handleSuggestionSubmit} className="space-y-6" id="form-suggestion">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                  Suggest a Hidden Gem or Idea
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Know a secluded Awadhi monument, an iconic 100-year-old ittar shop, or have a feature idea for the portal?
                </p>
              </div>

              {/* Suggestion Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Suggestion Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hidden_gem', label: 'Hidden Gem Spot' },
                    { id: 'new_place', label: 'New Monument / Park' },
                    { id: 'cultural_story', label: 'Folklore / Story' },
                    { id: 'feature_idea', label: 'New Platform Feature' },
                    { id: 'new_category', label: 'New Theme / Category' },
                    { id: 'improvement', label: 'General Improvement' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSugCategory(c.id as SuggestionCategory)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        sugCategory === c.id
                          ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Title / Name of the Spot <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  placeholder="e.g. Satkhanda Minaret or Kashmiri Chai Stall in Chowk"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              {/* Area / Location */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Location / Area in Lucknow
                </label>
                <input
                  type="text"
                  value={sugLocation}
                  onChange={(e) => setSugLocation(e.target.value)}
                  placeholder="e.g. Hussainabad, Aminabad, Hazratganj, Gomti Nagar"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Why Should We Feature It? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={sugDescription}
                  onChange={(e) => setSugDescription(e.target.value)}
                  placeholder="Explain why this place or feature is special, historical significance, specialties to taste, or how it adds value for visitors..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              {/* Submitter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={sugName}
                    onChange={(e) => setSugName(e.target.value)}
                    placeholder="e.g. Shreya Saxena"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Email <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={sugEmail}
                    onChange={(e) => setSugEmail(e.target.value)}
                    placeholder="e.g. shreya@example.com"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                id="submit-suggestion-btn"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: REPORT AN INACCURACY */}
          {activeTab === 'report' && (
            <form onSubmit={handleReportSubmit} className="space-y-6" id="form-report-issue">
              <div className="border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Quality & Accuracy Assurance</span>
                </div>
                <h2 className="text-2xl font-bold font-serif-heading text-stone-900 mt-1">
                  Report Outdated or Incorrect Information
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Spotted an outdated entry ticket price, incorrect monument opening timings, or GPS pin? Let us know immediately.
                </p>
              </div>

              {/* Destination Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Associated Place (If applicable)
                </label>
                <select
                  value={reportPlaceId}
                  onChange={(e) => setReportPlaceId(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                >
                  <option value="general">-- General Information / Not Listed --</option>
                  {places.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Issue Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'incorrect_timing', label: 'Wrong Timings' },
                    { id: 'incorrect_pricing', label: 'Updated Pricing / Tickets' },
                    { id: 'wrong_location', label: 'Wrong GPS / Area' },
                    { id: 'outdated_info', label: 'Outdated Details' },
                    { id: 'broken_image_link', label: 'Broken Image / Link' },
                    { id: 'other', label: 'Other Issue' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReportType(t.id as IssueReportType)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        reportType === t.id
                          ? 'bg-red-700 text-white border-red-500 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Issue Description & Corrections <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide correct details (e.g. 'Bara Imambara ticket counter closes at 5:00 PM in winters', 'Ticket fee is now ₹50 instead of ₹25', etc.)..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              {/* Submitter info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g. Alok Sharma"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Contact Email <span className="text-stone-400 font-normal">(For verification)</span>
                  </label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="e.g. alok@example.com"
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                id="submit-issue-report-btn"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Report...' : 'Submit Inaccuracy Report'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. RECENT COMMUNITY REVIEWS FEED */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono">
              Live Awadh Feedback
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900 mt-1">
              Recent Visitor Reviews Across Lucknow
            </h3>
          </div>
          <button
            onClick={() => onNavigate('/explore')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            Explore all destinations →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {rev.placeName || 'Lucknow Landmark'}
                    </h4>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-stone-400" />
                      <span>{rev.userName}</span>
                      {rev.userLocation && <span>• {rev.userLocation}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-900">{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 italic font-sans leading-relaxed line-clamp-4">
                  “{rev.reviewText}”
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                  {rev.visitExperience || 'Explorer'}
                </span>
                <button
                  onClick={() => onNavigate(`/places/${rev.placeId}`)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  View Place →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
