import { 
  PlaceReview, 
  PlatformFeedback, 
  Suggestion, 
  IssueReport, 
  ReviewFilterOptions,
  VisitExperience
} from '../types';
import { 
  INITIAL_PLACE_REVIEWS, 
  INITIAL_PLATFORM_FEEDBACK, 
  INITIAL_SUGGESTIONS, 
  INITIAL_ISSUE_REPORTS 
} from '../data/seedReviews';
import { StorageService } from './storageService';

const FEEDBACK_STORAGE_KEYS = {
  PLACE_REVIEWS: 'nawabi_safar_place_reviews_v1',
  PLATFORM_FEEDBACK: 'nawabi_safar_platform_feedback_v1',
  SUGGESTIONS: 'nawabi_safar_suggestions_v1',
  ISSUE_REPORTS: 'nawabi_safar_issue_reports_v1',
  HELPFUL_VOTES: 'nawabi_safar_helpful_votes_v1'
};

type FeedbackListener = () => void;
const feedbackListeners: Set<FeedbackListener> = new Set();

function notifyFeedbackListeners() {
  feedbackListeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in feedback listener', e);
    }
  });
}

export const FeedbackService = {
  /**
   * Subscribe to real-time feedback and review updates
   */
  subscribe(fn: FeedbackListener): () => void {
    feedbackListeners.add(fn);
    return () => {
      feedbackListeners.delete(fn);
    };
  },

  /**
   * Initialize feedback store with curated Awadhi seed reviews if empty
   */
  initSeedFeedback(): void {
    if (!localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS)) {
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(INITIAL_PLACE_REVIEWS));
    }
    if (!localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK)) {
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(INITIAL_PLATFORM_FEEDBACK));
    }
    if (!localStorage.getItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS)) {
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(INITIAL_SUGGESTIONS));
    }
    if (!localStorage.getItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS)) {
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(INITIAL_ISSUE_REPORTS));
    }
  },

  // ==========================================
  // 1. PLACE REVIEWS
  // ==========================================

  getAllPlaceReviews(): PlaceReview[] {
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS);
    if (!raw) return INITIAL_PLACE_REVIEWS;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse place reviews', e);
      return INITIAL_PLACE_REVIEWS;
    }
  },

  getReviewsForPlace(placeId: string, options?: ReviewFilterOptions): PlaceReview[] {
    const all = this.getAllPlaceReviews();
    let placeReviews = all.filter(r => r.placeId === placeId && r.status === 'published');

    if (options?.ratingFilter && options.ratingFilter !== 'all') {
      placeReviews = placeReviews.filter(r => r.rating === options.ratingFilter);
    }

    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'recent':
          placeReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'highest':
          placeReviews.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'lowest':
          placeReviews.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    } else {
      // Default: most recent first
      placeReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return placeReviews;
  },

  getPlaceRatingSummary(placeId: string, basePlaceRating?: number, basePlaceReviewsCount?: number): {
    averageRating: number;
    totalCount: number;
    distribution: Record<number, number>;
    percentages: Record<number, number>;
  } {
    const reviews = this.getReviewsForPlace(placeId);
    
    // Distribution breakdown
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    });

    const totalCount = reviews.length;
    let averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : (basePlaceRating || 4.8);

    // If there are zero user reviews yet, provide a natural starting breakdown matching the curated place rating
    if (totalCount === 0) {
      const estimatedCount = basePlaceReviewsCount || 100;
      return {
        averageRating,
        totalCount: estimatedCount,
        distribution: {
          5: Math.round(estimatedCount * 0.78),
          4: Math.round(estimatedCount * 0.18),
          3: Math.round(estimatedCount * 0.03),
          2: Math.round(estimatedCount * 0.01),
          1: 0
        },
        percentages: { 5: 78, 4: 18, 3: 3, 2: 1, 1: 0 }
      };
    }

    const percentages: Record<number, number> = {
      5: Math.round((distribution[5] / totalCount) * 100),
      4: Math.round((distribution[4] / totalCount) * 100),
      3: Math.round((distribution[3] / totalCount) * 100),
      2: Math.round((distribution[2] / totalCount) * 100),
      1: Math.round((distribution[1] / totalCount) * 100)
    };

    return {
      averageRating,
      totalCount,
      distribution,
      percentages
    };
  },

  addPlaceReview(reviewData: {
    placeId: string;
    placeName?: string;
    userName?: string;
    userLocation?: string;
    rating: number;
    reviewText: string;
    visitExperience?: VisitExperience;
    visitedDate?: string;
  }): PlaceReview {
    const all = this.getAllPlaceReviews();
    const newReview: PlaceReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      placeId: reviewData.placeId,
      placeName: reviewData.placeName,
      userName: reviewData.userName?.trim() || 'Fellow Explorer',
      userLocation: reviewData.userLocation?.trim() || 'Visitor',
      rating: Math.min(5, Math.max(1, reviewData.rating)),
      reviewText: reviewData.reviewText.trim(),
      visitExperience: reviewData.visitExperience || 'Solo Explorer',
      visitedDate: reviewData.visitedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'published', // Published by default for real-time MVP responsiveness
      helpfulVotes: 0
    };

    const updated = [newReview, ...all];
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));

    // Update place average rating & review count in Place model if applicable
    this.syncPlaceRating(reviewData.placeId);

    notifyFeedbackListeners();
    return newReview;
  },

  updatePlaceReviewStatus(id: string, status: 'published' | 'hidden' | 'pending'): void {
    const all = this.getAllPlaceReviews();
    const review = all.find(r => r.id === id);
    const updated = all.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    if (review) {
      this.syncPlaceRating(review.placeId);
    }
    notifyFeedbackListeners();
  },

  deletePlaceReview(id: string): void {
    const all = this.getAllPlaceReviews();
    const review = all.find(r => r.id === id);
    const updated = all.filter(r => r.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    if (review) {
      this.syncPlaceRating(review.placeId);
    }
    notifyFeedbackListeners();
  },

  voteHelpful(reviewId: string): boolean {
    const votedRaw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.HELPFUL_VOTES);
    const votedIds: string[] = votedRaw ? JSON.parse(votedRaw) : [];
    if (votedIds.includes(reviewId)) {
      return false; // Already voted
    }

    const all = this.getAllPlaceReviews();
    const updated = all.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 };
      }
      return r;
    });

    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    votedIds.push(reviewId);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.HELPFUL_VOTES, JSON.stringify(votedIds));
    notifyFeedbackListeners();
    return true;
  },

  hasVotedHelpful(reviewId: string): boolean {
    const votedRaw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.HELPFUL_VOTES);
    const votedIds: string[] = votedRaw ? JSON.parse(votedRaw) : [];
    return votedIds.includes(reviewId);
  },

  syncPlaceRating(placeId: string): void {
    const places = StorageService.getPlaces();
    const targetPlace = places.find(p => p.id === placeId);
    if (!targetPlace) return;

    const publishedReviews = this.getReviewsForPlace(placeId);
    if (publishedReviews.length > 0) {
      const sum = publishedReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / publishedReviews.length).toFixed(1));
      targetPlace.rating = avg;
      targetPlace.reviewsCount = publishedReviews.length;
      StorageService.savePlaces(places);
    }
  },

  getRecentVerifiedReviews(limit = 6): PlaceReview[] {
    const all = this.getAllPlaceReviews().filter(r => r.status === 'published');
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },

  // ==========================================
  // 2. PLATFORM FEEDBACK
  // ==========================================

  getPlatformFeedback(): PlatformFeedback[] {
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK);
    if (!raw) return INITIAL_PLATFORM_FEEDBACK;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_PLATFORM_FEEDBACK;
    }
  },

  addPlatformFeedback(data: {
    category: PlatformFeedback['category'];
    rating: number;
    message: string;
    userName?: string;
    email?: string;
  }): PlatformFeedback {
    const all = this.getPlatformFeedback();
    const newFeedback: PlatformFeedback = {
      id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      category: data.category,
      rating: Math.min(5, Math.max(1, data.rating)),
      message: data.message.trim(),
      userName: data.userName?.trim() || 'Anonymous Explorer',
      email: data.email?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newFeedback, ...all];
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
    return newFeedback;
  },

  updateFeedbackStatus(id: string, status: 'pending' | 'reviewed' | 'resolved'): void {
    const all = this.getPlatformFeedback();
    const updated = all.map(f => f.id === id ? { ...f, status } : f);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  deletePlatformFeedback(id: string): void {
    const all = this.getPlatformFeedback();
    const updated = all.filter(f => f.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  // ==========================================
  // 3. SUGGESTIONS
  // ==========================================

  getSuggestions(): Suggestion[] {
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS);
    if (!raw) return INITIAL_SUGGESTIONS;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_SUGGESTIONS;
    }
  },

  addSuggestion(data: {
    category: Suggestion['category'];
    title: string;
    description: string;
    locationArea?: string;
    suggestedBy?: string;
    contactEmail?: string;
  }): Suggestion {
    const all = this.getSuggestions();
    const newSuggestion: Suggestion = {
      id: 'sug_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      locationArea: data.locationArea?.trim() || undefined,
      suggestedBy: data.suggestedBy?.trim() || 'Curious Traveller',
      contactEmail: data.contactEmail?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newSuggestion, ...all];
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
    return newSuggestion;
  },

  updateSuggestionStatus(id: string, status: Suggestion['status']): void {
    const all = this.getSuggestions();
    const updated = all.map(s => s.id === id ? { ...s, status } : s);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  deleteSuggestion(id: string): void {
    const all = this.getSuggestions();
    const updated = all.filter(s => s.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  // ==========================================
  // 4. ISSUE & INACCURACY REPORTS
  // ==========================================

  getIssueReports(): IssueReport[] {
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS);
    if (!raw) return INITIAL_ISSUE_REPORTS;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_ISSUE_REPORTS;
    }
  },

  addIssueReport(data: {
    placeId?: string;
    placeName?: string;
    issueType: IssueReport['issueType'];
    description: string;
    reportedBy?: string;
    contactEmail?: string;
  }): IssueReport {
    const all = this.getIssueReports();
    const newReport: IssueReport = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      placeId: data.placeId || undefined,
      placeName: data.placeName || undefined,
      issueType: data.issueType,
      description: data.description.trim(),
      reportedBy: data.reportedBy?.trim() || 'Concerned Visitor',
      contactEmail: data.contactEmail?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newReport, ...all];
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
    return newReport;
  },

  updateIssueReportStatus(id: string, status: IssueReport['status'], adminNotes?: string): void {
    const all = this.getIssueReports();
    const updated = all.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes
        };
      }
      return r;
    });
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  deleteIssueReport(id: string): void {
    const all = this.getIssueReports();
    const updated = all.filter(r => r.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
  }
};
