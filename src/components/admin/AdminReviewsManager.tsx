import React, { useState, useEffect } from 'react';
import { PlaceReview, PlatformFeedback, Suggestion, IssueReport, Place } from '../../types';
import { FeedbackService } from '../../services/feedbackService';
import { PlaceService } from '../../services/placeService';
import { 
  Star, MessageSquare, Lightbulb, AlertTriangle, CheckCircle2, 
  Trash2, Eye, EyeOff, Search, Filter, Check, Clock, Edit3, 
  Send, ShieldCheck, User, Calendar, MapPin, ExternalLink, RefreshCw
} from 'lucide-react';

export const AdminReviewsManager: React.FC = () => {
  const [subTab, setSubTab] = useState<'places' | 'platform' | 'suggestions' | 'reports'>('places');
  const [places, setPlaces] = useState<Place[]>([]);
  
  // Data lists
  const [placeReviews, setPlaceReviews] = useState<PlaceReview[]>([]);
  const [platformFeedback, setPlatformFeedback] = useState<PlatformFeedback[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');

  // Issue report resolution editing modal/state
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [reportAdminNote, setReportAdminNote] = useState('');

  const loadAllFeedbackData = () => {
    setPlaces(PlaceService.getAllPlaces());
    setPlaceReviews(FeedbackService.getAllPlaceReviews());
    setPlatformFeedback(FeedbackService.getPlatformFeedback());
    setSuggestions(FeedbackService.getSuggestions());
    setIssueReports(FeedbackService.getIssueReports());
  };

  useEffect(() => {
    loadAllFeedbackData();
    const unsubscribe = FeedbackService.subscribe(() => {
      loadAllFeedbackData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handlers for Place Reviews
  const handleToggleReviewStatus = async (id: string, currentStatus: PlaceReview['status']) => {
    const nextStatus = currentStatus === 'published' ? 'hidden' : 'published';
    await FeedbackService.updatePlaceReviewStatus(id, nextStatus);
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review from the database?')) {
      await FeedbackService.deletePlaceReview(id);
    }
  };

  // Handlers for Platform Feedback
  const handleUpdateFeedbackStatus = async (id: string, status: PlatformFeedback['status']) => {
    await FeedbackService.updateFeedbackStatus(id, status);
  };

  const handleDeleteFeedback = async (id: string) => {
    if (window.confirm('Delete this feedback item from database?')) {
      await FeedbackService.deletePlatformFeedback(id);
    }
  };

  // Handlers for Suggestions
  const handleUpdateSuggestionStatus = async (id: string, status: Suggestion['status']) => {
    await FeedbackService.updateSuggestionStatus(id, status);
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (window.confirm('Delete this community suggestion from database?')) {
      await FeedbackService.deleteSuggestion(id);
    }
  };

  // Handlers for Issue Reports
  const handleSaveReportResolution = async (id: string, status: IssueReport['status']) => {
    await FeedbackService.updateIssueReportStatus(id, status, reportAdminNote.trim() || undefined);
    setEditingReportId(null);
    setReportAdminNote('');
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Delete this inaccuracy report from database?')) {
      await FeedbackService.deleteIssueReport(id);
    }
  };

  // KPI Calculations
  const totalReviews = placeReviews.length;
  const publishedReviews = placeReviews.filter(r => r.status === 'published').length;
  const avgCommunityRating = totalReviews > 0
    ? (placeReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '4.8';
  const openReports = issueReports.filter(r => r.status === 'pending' || r.status === 'investigating').length;
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending' || s.status === 'under_review').length;

  // Filtered Place Reviews
  const filteredPlaceReviews = placeReviews.filter(r => {
    const matchesSearch = 
      r.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.placeName && r.placeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlace = placeFilter === 'all' || r.placeId === placeFilter;
    const matchesStatus = reviewStatusFilter === 'all' || r.status === reviewStatusFilter;
    return matchesSearch && matchesPlace && matchesStatus;
  });

  // Filtered Platform Feedback
  const filteredPlatformFeedback = platformFeedback.filter(f => {
    const matchesSearch = 
      f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.userName && f.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Suggestions
  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.suggestedBy && s.suggestedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = suggestionStatusFilter === 'all' || s.status === suggestionStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Reports
  const filteredIssueReports = issueReports.filter(r => {
    const matchesSearch = 
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.placeName && r.placeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.issueType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="admin-reviews-manager">
      {/* 1. METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Destination Reviews</div>
          <div className="text-2xl font-bold font-serif-heading text-stone-900 mt-1">{totalReviews}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{publishedReviews} Published Live</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Avg Rating</div>
          <div className="text-2xl font-bold font-serif-heading text-amber-700 mt-1 flex items-center gap-1">
            <span>{avgCommunityRating}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Visitor Submissions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Open Inaccuracy Reports</div>
          <div className="text-2xl font-bold font-serif-heading text-red-700 mt-1">{openReports}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-0.5">Require Investigation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Community Suggestions</div>
          <div className="text-2xl font-bold font-serif-heading text-teal-700 mt-1">{suggestions.length}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">{pendingSuggestions} Pending Review</div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSubTab('places'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'places'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Place Reviews ({placeReviews.length})</span>
          </button>

          <button
            onClick={() => { setSubTab('platform'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'platform'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Platform Feedback ({platformFeedback.length})</span>
          </button>

          <button
            onClick={() => { setSubTab('suggestions'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'suggestions'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Suggestions ({suggestions.length})</span>
          </button>

          <button
            onClick={() => { setSubTab('reports'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'reports'
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Issue Reports ({issueReports.length})</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search text, user, place..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
          />
        </div>
      </div>

      {/* 3. SUB-TAB 1: DESTINATION REVIEWS */}
      {subTab === 'places' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-stone-600">Filter Destination:</span>
              <select
                value={placeFilter}
                onChange={(e) => setPlaceFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value="all">All Destinations ({places.length})</option>
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <span className="font-semibold text-stone-600 ml-2">Status:</span>
              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Live</option>
                <option value="hidden">Hidden</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Showing {filteredPlaceReviews.length} reviews
            </span>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {filteredPlaceReviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                No destination reviews match your search/filter.
              </div>
            ) : (
              filteredPlaceReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {r.placeName || r.placeId}
                      </span>
                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 text-amber-900 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{r.rating}.0</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {r.status}
                      </span>
                      {r.visitExperience && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                          {r.visitExperience}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 font-sans leading-relaxed">
                      “{r.reviewText}”
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500">
                      <span>By <strong>{r.userName}</strong> ({r.userLocation || 'Visitor'})</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{r.helpfulVotes || 0} helpful votes</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <button
                      onClick={() => handleToggleReviewStatus(r.id, r.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        r.status === 'published'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      }`}
                      title={r.status === 'published' ? 'Hide from public view' : 'Publish publicly'}
                    >
                      {r.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{r.status === 'published' ? 'Hide' : 'Publish'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: PLATFORM FEEDBACK */}
      {subTab === 'platform' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600">Filter Status:</span>
              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
              >
                <option value="all">All Feedback</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <span className="text-stone-500 font-mono">
              {filteredPlatformFeedback.length} items
            </span>
          </div>

          <div className="space-y-3">
            {filteredPlatformFeedback.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                No platform feedback found.
              </div>
            ) : (
              filteredPlatformFeedback.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {f.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{f.rating}.0</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        f.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        f.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {f.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed font-sans">
                      “{f.message}”
                    </p>

                    <div className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>By <strong>{f.userName || 'Anonymous'}</strong> {f.email && `(${f.email})`}</span>
                      <span>•</span>
                      <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={f.status}
                      onChange={(e) => handleUpdateFeedbackStatus(f.id, e.target.value as PlatformFeedback['status'])}
                      className="px-2.5 py-1 text-xs rounded-xl border border-stone-300 bg-white font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDeleteFeedback(f.id)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: SUGGESTIONS */}
      {subTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600">Filter Status:</span>
              <select
                value={suggestionStatusFilter}
                onChange={(e) => setSuggestionStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
              >
                <option value="all">All Suggestions</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="planned">Planned</option>
                <option value="implemented">Implemented</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <span className="text-stone-500 font-mono">
              {filteredSuggestions.length} suggestions
            </span>
          </div>

          <div className="space-y-3">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                No community suggestions found.
              </div>
            ) : (
              filteredSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                          {s.category.replace('_', ' ')}
                        </span>
                        {s.locationArea && (
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {s.locationArea}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          s.status === 'implemented' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          s.status === 'under_review' ? 'bg-purple-100 text-purple-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-900 mt-1">
                        {s.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={s.status}
                        onChange={(e) => handleUpdateSuggestionStatus(s.id, e.target.value as Suggestion['status'])}
                        className="px-2.5 py-1 text-xs rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="implemented">Implemented</option>
                        <option value="archived">Archived</option>
                      </select>

                      <button
                        onClick={() => handleDeleteSuggestion(s.id)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete Suggestion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {s.description}
                  </p>

                  <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-2 border-t border-stone-100">
                    <span>Suggested by: <strong>{s.suggestedBy || 'Community Member'}</strong> {s.contactEmail && `(${s.contactEmail})`}</span>
                    <span>•</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 4: ISSUE REPORTS */}
      {subTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600">Filter Status:</span>
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
              >
                <option value="all">All Issue Reports</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <span className="text-stone-500 font-mono">
              {filteredIssueReports.length} reports
            </span>
          </div>

          <div className="space-y-3">
            {filteredIssueReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                No inaccuracy or issue reports found.
              </div>
            ) : (
              filteredIssueReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-900">
                          {rep.issueType.replace('_', ' ')}
                        </span>
                        {rep.placeName && (
                          <span className="text-xs font-bold text-stone-900">
                            {rep.placeName}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          rep.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                          'bg-stone-200 text-stone-700'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingReportId(rep.id);
                          setReportAdminNote(rep.adminNotes || '');
                        }}
                        className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Status & Notes</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 font-sans leading-relaxed">
                    {rep.description}
                  </p>

                  {rep.adminNotes && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                      <strong>Admin Resolution Note:</strong> {rep.adminNotes}
                    </div>
                  )}

                  {/* Inline update modal/drawer */}
                  {editingReportId === rep.id && (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-300 space-y-3 animate-fade-in">
                      <div className="font-bold text-xs text-stone-800">
                        Update Report Resolution
                      </div>
                      <textarea
                        rows={2}
                        value={reportAdminNote}
                        onChange={(e) => setReportAdminNote(e.target.value)}
                        placeholder="Resolution note (e.g. 'Updated ticket price to ₹50 in database')..."
                        className="w-full p-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveReportResolution(rep.id, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                        >
                          Mark as Resolved
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReportResolution(rep.id, 'investigating')}
                          className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                        >
                          Mark Investigating
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReportResolution(rep.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-xs font-bold"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReportId(null)}
                          className="text-xs text-stone-500 hover:underline ml-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-2 border-t border-stone-100">
                    <span>Reported by: <strong>{rep.reportedBy || 'Visitor'}</strong> {rep.contactEmail && `(${rep.contactEmail})`}</span>
                    <span>•</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
