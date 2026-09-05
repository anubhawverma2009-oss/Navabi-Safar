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
import { 
  getSupabase, 
  isSupabaseConfigured,
  mapDbReviewToModel,
  mapModelReviewToDb,
  mapDbFeedbackToModel,
  mapModelFeedbackToDb,
  mapDbSuggestionToModel,
  mapModelSuggestionToDb,
  mapDbIssueToModel,
  mapModelIssueToDb
} from '../lib/supabaseClient';

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

// In-memory runtime cache
let cachedReviews: PlaceReview[] | null = null;
let cachedPlatformFeedback: PlatformFeedback[] | null = null;
let cachedSuggestions: Suggestion[] | null = null;
let cachedIssueReports: IssueReport[] | null = null;
let feedbackRealtimeSubscribed = false;

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
   * Initialize feedback store with seed fallback, then query Supabase and connect Realtime
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

    if (isSupabaseConfigured()) {
      this.fetchFromRemote().catch(err => {
        console.warn('Initial feedback remote fetch notice:', err);
      });
      this.initRealtime();
    }
  },

  initRealtime(): void {
    if (feedbackRealtimeSubscribed) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      supabase.channel('nawabi_safar_feedback_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'place_reviews' }, (payload) => {
          this.handleReviewRealtime(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_feedback' }, (payload) => {
          this.handleFeedbackRealtime(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, (payload) => {
          this.handleSuggestionRealtime(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_reports' }, (payload) => {
          this.handleIssueRealtime(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            feedbackRealtimeSubscribed = true;
          }
        });
    } catch (err) {
      console.warn('Feedback Realtime channel setup exception:', err);
    }
  },

  handleReviewRealtime(payload: any): void {
    const list = this.getAllPlaceReviews().slice();
    if (payload.eventType === 'INSERT') {
      const item = mapDbReviewToModel(payload.new);
      if (!list.some(r => r.id === item.id)) {
        list.unshift(item);
        cachedReviews = list;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(list));
        this.syncPlaceRating(item.placeId);
        notifyFeedbackListeners();
      }
    } else if (payload.eventType === 'UPDATE') {
      const item = mapDbReviewToModel(payload.new);
      const idx = list.findIndex(r => r.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      cachedReviews = list;
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(list));
      this.syncPlaceRating(item.placeId);
      notifyFeedbackListeners();
    } else if (payload.eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        const item = list.find(r => r.id === oldId);
        const filtered = list.filter(r => r.id !== oldId);
        cachedReviews = filtered;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(filtered));
        if (item) this.syncPlaceRating(item.placeId);
        notifyFeedbackListeners();
      }
    }
  },

  handleFeedbackRealtime(payload: any): void {
    const list = this.getPlatformFeedback().slice();
    if (payload.eventType === 'INSERT') {
      const item = mapDbFeedbackToModel(payload.new);
      if (!list.some(f => f.id === item.id)) {
        list.unshift(item);
        cachedPlatformFeedback = list;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(list));
        notifyFeedbackListeners();
      }
    } else if (payload.eventType === 'UPDATE') {
      const item = mapDbFeedbackToModel(payload.new);
      const idx = list.findIndex(f => f.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      cachedPlatformFeedback = list;
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(list));
      notifyFeedbackListeners();
    } else if (payload.eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        cachedPlatformFeedback = list.filter(f => f.id !== oldId);
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(cachedPlatformFeedback));
        notifyFeedbackListeners();
      }
    }
  },

  handleSuggestionRealtime(payload: any): void {
    const list = this.getSuggestions().slice();
    if (payload.eventType === 'INSERT') {
      const item = mapDbSuggestionToModel(payload.new);
      if (!list.some(s => s.id === item.id)) {
        list.unshift(item);
        cachedSuggestions = list;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(list));
        notifyFeedbackListeners();
      }
    } else if (payload.eventType === 'UPDATE') {
      const item = mapDbSuggestionToModel(payload.new);
      const idx = list.findIndex(s => s.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      cachedSuggestions = list;
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(list));
      notifyFeedbackListeners();
    } else if (payload.eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        cachedSuggestions = list.filter(s => s.id !== oldId);
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(cachedSuggestions));
        notifyFeedbackListeners();
      }
    }
  },

  handleIssueRealtime(payload: any): void {
    const list = this.getIssueReports().slice();
    if (payload.eventType === 'INSERT') {
      const item = mapDbIssueToModel(payload.new);
      if (!list.some(r => r.id === item.id)) {
        list.unshift(item);
        cachedIssueReports = list;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(list));
        notifyFeedbackListeners();
      }
    } else if (payload.eventType === 'UPDATE') {
      const item = mapDbIssueToModel(payload.new);
      const idx = list.findIndex(r => r.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      cachedIssueReports = list;
      localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(list));
      notifyFeedbackListeners();
    } else if (payload.eventType === 'DELETE') {
      const oldId = payload.old?.id;
      if (oldId) {
        cachedIssueReports = list.filter(r => r.id !== oldId);
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(cachedIssueReports));
        notifyFeedbackListeners();
      }
    }
  },

  /**
   * Synchronizes feedback collections from Supabase
   */
  async fetchFromRemote(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const [revRes, fbRes, sugRes, issRes] = await Promise.all([
        supabase.from('place_reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('platform_feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
        supabase.from('issue_reports').select('*').order('created_at', { ascending: false })
      ]);

      if (revRes.data && revRes.data.length > 0) {
        const mapped = revRes.data.map(mapDbReviewToModel);
        cachedReviews = mapped;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(mapped));
      }

      if (fbRes.data && fbRes.data.length > 0) {
        const mapped = fbRes.data.map(mapDbFeedbackToModel);
        cachedPlatformFeedback = mapped;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(mapped));
      }

      if (sugRes.data && sugRes.data.length > 0) {
        const mapped = sugRes.data.map(mapDbSuggestionToModel);
        cachedSuggestions = mapped;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(mapped));
      }

      if (issRes.data && issRes.data.length > 0) {
        const mapped = issRes.data.map(mapDbIssueToModel);
        cachedIssueReports = mapped;
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(mapped));
      }

      notifyFeedbackListeners();
    } catch (e) {
      console.warn('Feedback remote fetch exception:', e);
    }
  },

  // ==========================================
  // 1. PLACE REVIEWS
  // ==========================================

  getAllPlaceReviews(): PlaceReview[] {
    if (cachedReviews) return cachedReviews;
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS);
    if (!raw) return INITIAL_PLACE_REVIEWS;
    try {
      cachedReviews = JSON.parse(raw);
      return cachedReviews || INITIAL_PLACE_REVIEWS;
    } catch (e) {
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
    
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    });

    const totalCount = reviews.length;
    let averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : (basePlaceRating || 4.8);

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

  async addPlaceReview(reviewData: {
    placeId: string;
    placeName?: string;
    userName?: string;
    userLocation?: string;
    rating: number;
    reviewText: string;
    visitExperience?: VisitExperience;
    visitedDate?: string;
  }): Promise<PlaceReview> {
    const newReview: PlaceReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      placeId: reviewData.placeId,
      placeName: reviewData.placeName,
      userName: reviewData.userName?.trim() || 'Fellow Explorer',
      userLocation: reviewData.userLocation?.trim() || 'Visitor',
      rating: Math.min(5, Math.max(1, reviewData.rating)),
      reviewText: reviewData.reviewText.trim(),
      visitExperience: reviewData.visitExperience || 'Solo Explorer',
      visitedDate: reviewData.visitedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'published',
      helpfulVotes: 0
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelReviewToDb(newReview);
        const { data, error } = await supabase
          .from('place_reviews')
          .insert(dbPayload)
          .select()
          .single();

        if (error) {
          console.warn('Supabase place review insert error:', error.message);
        } else if (data) {
          const created = mapDbReviewToModel(data);
          this.commitReviewLocal(created);
          return created;
        }
      } catch (e) {
        console.warn('Supabase review insert exception:', e);
      }
    }

    this.commitReviewLocal(newReview);
    return newReview;
  },

  commitReviewLocal(review: PlaceReview): void {
    const all = this.getAllPlaceReviews().filter(r => r.id !== review.id);
    const updated = [review, ...all];
    cachedReviews = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    this.syncPlaceRating(review.placeId);
    notifyFeedbackListeners();
  },

  async updatePlaceReviewStatus(id: string, status: 'published' | 'hidden' | 'pending'): Promise<void> {
    const all = this.getAllPlaceReviews();
    const review = all.find(r => r.id === id);
    
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('place_reviews')
          .update({ status })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase update review status notice:', e);
      }
    }

    const updated = all.map(r => r.id === id ? { ...r, status } : r);
    cachedReviews = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    if (review) {
      this.syncPlaceRating(review.placeId);
    }
    notifyFeedbackListeners();
  },

  async deletePlaceReview(id: string): Promise<void> {
    const all = this.getAllPlaceReviews();
    const review = all.find(r => r.id === id);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('place_reviews')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase delete review notice:', e);
      }
    }

    const updated = all.filter(r => r.id !== id);
    cachedReviews = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLACE_REVIEWS, JSON.stringify(updated));
    if (review) {
      this.syncPlaceRating(review.placeId);
    }
    notifyFeedbackListeners();
  },

  async voteHelpful(reviewId: string): Promise<boolean> {
    const votedRaw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.HELPFUL_VOTES);
    const votedIds: string[] = votedRaw ? JSON.parse(votedRaw) : [];
    if (votedIds.includes(reviewId)) {
      return false; // Already voted
    }

    const all = this.getAllPlaceReviews();
    const target = all.find(r => r.id === reviewId);
    const nextVotes = (target?.helpfulVotes || 0) + 1;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('place_reviews')
          .update({ helpful_votes: nextVotes })
          .eq('id', id => reviewId);
      } catch (e) {
        console.warn('Supabase vote helpful notice:', e);
      }
    }

    const updated = all.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulVotes: nextVotes };
      }
      return r;
    });

    cachedReviews = updated;
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
      StorageService.savePlaceRemote(targetPlace).catch(() => {});
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
    if (cachedPlatformFeedback) return cachedPlatformFeedback;
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK);
    if (!raw) return INITIAL_PLATFORM_FEEDBACK;
    try {
      cachedPlatformFeedback = JSON.parse(raw);
      return cachedPlatformFeedback || INITIAL_PLATFORM_FEEDBACK;
    } catch (e) {
      return INITIAL_PLATFORM_FEEDBACK;
    }
  },

  async addPlatformFeedback(data: {
    category: PlatformFeedback['category'];
    rating: number;
    message: string;
    userName?: string;
    email?: string;
  }): Promise<PlatformFeedback> {
    const newFeedback: PlatformFeedback = {
      id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      category: data.category,
      rating: Math.min(5, Math.max(1, data.rating)),
      message: data.message.trim(),
      userName: data.userName?.trim() || 'Anonymous Explorer',
      email: data.email?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelFeedbackToDb(newFeedback);
        const { data: dbRes } = await supabase
          .from('platform_feedback')
          .insert(dbPayload)
          .select()
          .single();

        if (dbRes) {
          const created = mapDbFeedbackToModel(dbRes);
          this.commitFeedbackLocal(created);
          return created;
        }
      } catch (e) {
        console.warn('Supabase feedback insert notice:', e);
      }
    }

    this.commitFeedbackLocal(newFeedback);
    return newFeedback;
  },

  commitFeedbackLocal(fb: PlatformFeedback): void {
    const all = this.getPlatformFeedback().filter(f => f.id !== fb.id);
    const updated = [fb, ...all];
    cachedPlatformFeedback = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async updateFeedbackStatus(id: string, status: 'pending' | 'reviewed' | 'resolved'): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('platform_feedback')
          .update({ status })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase feedback status update notice:', e);
      }
    }

    const all = this.getPlatformFeedback();
    const updated = all.map(f => f.id === id ? { ...f, status } : f);
    cachedPlatformFeedback = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async deletePlatformFeedback(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('platform_feedback')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase feedback delete notice:', e);
      }
    }

    const all = this.getPlatformFeedback();
    const updated = all.filter(f => f.id !== id);
    cachedPlatformFeedback = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.PLATFORM_FEEDBACK, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  // ==========================================
  // 3. SUGGESTIONS
  // ==========================================

  getSuggestions(): Suggestion[] {
    if (cachedSuggestions) return cachedSuggestions;
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS);
    if (!raw) return INITIAL_SUGGESTIONS;
    try {
      cachedSuggestions = JSON.parse(raw);
      return cachedSuggestions || INITIAL_SUGGESTIONS;
    } catch (e) {
      return INITIAL_SUGGESTIONS;
    }
  },

  async addSuggestion(data: {
    category: Suggestion['category'];
    title: string;
    description: string;
    locationArea?: string;
    suggestedBy?: string;
    contactEmail?: string;
  }): Promise<Suggestion> {
    const newSuggestion: Suggestion = {
      id: 'sug_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      locationArea: data.locationArea?.trim() || undefined,
      suggestedBy: data.suggestedBy?.trim() || 'Curious Traveller',
      contactEmail: data.contactEmail?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelSuggestionToDb(newSuggestion);
        const { data: dbRes } = await supabase
          .from('suggestions')
          .insert(dbPayload)
          .select()
          .single();

        if (dbRes) {
          const created = mapDbSuggestionToModel(dbRes);
          this.commitSuggestionLocal(created);
          return created;
        }
      } catch (e) {
        console.warn('Supabase suggestion insert notice:', e);
      }
    }

    this.commitSuggestionLocal(newSuggestion);
    return newSuggestion;
  },

  commitSuggestionLocal(sug: Suggestion): void {
    const all = this.getSuggestions().filter(s => s.id !== sug.id);
    const updated = [sug, ...all];
    cachedSuggestions = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async updateSuggestionStatus(id: string, status: Suggestion['status']): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('suggestions')
          .update({ status })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase suggestion status update notice:', e);
      }
    }

    const all = this.getSuggestions();
    const updated = all.map(s => s.id === id ? { ...s, status } : s);
    cachedSuggestions = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async deleteSuggestion(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('suggestions')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase suggestion delete notice:', e);
      }
    }

    const all = this.getSuggestions();
    const updated = all.filter(s => s.id !== id);
    cachedSuggestions = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  // ==========================================
  // 4. ISSUE & INACCURACY REPORTS
  // ==========================================

  getIssueReports(): IssueReport[] {
    if (cachedIssueReports) return cachedIssueReports;
    this.initSeedFeedback();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS);
    if (!raw) return INITIAL_ISSUE_REPORTS;
    try {
      cachedIssueReports = JSON.parse(raw);
      return cachedIssueReports || INITIAL_ISSUE_REPORTS;
    } catch (e) {
      return INITIAL_ISSUE_REPORTS;
    }
  },

  async addIssueReport(data: {
    placeId?: string;
    placeName?: string;
    issueType: IssueReport['issueType'];
    description: string;
    reportedBy?: string;
    contactEmail?: string;
  }): Promise<IssueReport> {
    const newReport: IssueReport = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      placeId: data.placeId || undefined,
      placeName: data.placeName || undefined,
      issueType: data.issueType,
      description: data.description.trim(),
      reportedBy: data.reportedBy?.trim() || 'Concerned Visitor',
      contactEmail: data.contactEmail?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = mapModelIssueToDb(newReport);
        const { data: dbRes } = await supabase
          .from('issue_reports')
          .insert(dbPayload)
          .select()
          .single();

        if (dbRes) {
          const created = mapDbIssueToModel(dbRes);
          this.commitIssueLocal(created);
          return created;
        }
      } catch (e) {
        console.warn('Supabase issue insert notice:', e);
      }
    }

    this.commitIssueLocal(newReport);
    return newReport;
  },

  commitIssueLocal(issue: IssueReport): void {
    const all = this.getIssueReports().filter(r => r.id !== issue.id);
    const updated = [issue, ...all];
    cachedIssueReports = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async updateIssueReportStatus(id: string, status: IssueReport['status'], adminNotes?: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: any = { status };
        if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
        await supabase
          .from('issue_reports')
          .update(updatePayload)
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase issue status update notice:', e);
      }
    }

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
    cachedIssueReports = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
  },

  async deleteIssueReport(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('issue_reports')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase issue delete notice:', e);
      }
    }

    const all = this.getIssueReports();
    const updated = all.filter(r => r.id !== id);
    cachedIssueReports = updated;
    localStorage.setItem(FEEDBACK_STORAGE_KEYS.ISSUE_REPORTS, JSON.stringify(updated));
    notifyFeedbackListeners();
  }
};
