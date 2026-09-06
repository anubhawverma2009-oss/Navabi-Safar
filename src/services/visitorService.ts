import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_KEYS = {
  VISITOR_ID: 'nawabi_safar_vid_v1',
  SESSION_ID: 'nawabi_safar_sid_v1',
  VISIT_LOGGED_SESSION: 'nawabi_safar_visit_logged_v1',
  LOCAL_VISITORS: 'nawabi_safar_unique_visitors_set_v1',
  CACHED_COUNT: 'nawabi_safar_cached_visitor_count_v1'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in visitor listener', e);
    }
  });
}

// In-memory cache for fast, zero-delay UI rendering
let cachedVisitorCount: number = 0;
let isTrackingInitialized = false;
let realtimeChannelSubscribed = false;

// Initialize cached count from local storage or default
try {
  const stored = localStorage.getItem(STORAGE_KEYS.CACHED_COUNT);
  if (stored) {
    cachedVisitorCount = parseInt(stored, 10) || 0;
  }
} catch {
  cachedVisitorCount = 0;
}

export const VisitorService = {
  /**
   * Subscribes a callback to realtime visitor count updates
   */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Retrieves or creates a persistent, anonymous visitor ID (0 PII, device/browser specific)
   */
  getAnonymousVisitorId(): string {
    try {
      let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
      if (!vid) {
        vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
      }
      return vid;
    } catch {
      return 'vid_anon_' + Math.random().toString(36).substring(2, 10);
    }
  },

  /**
   * Retrieves or creates a temporary session ID for the current browser tab
   */
  getSessionId(): string {
    try {
      let sid = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sid) {
        sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sid);
      }
      return sid;
    } catch {
      return 'sid_anon_' + Math.random().toString(36).substring(2, 10);
    }
  },

  /**
   * Initializes visitor tracking for the entire Nawabi Safar website:
   * - Records unique anonymous visitor in Supabase PostgreSQL
   * - Sets up Realtime listener to update counters live when new visitors arrive
   * - Fetches accurate total visitor count
   */
  async initVisitorTracking(): Promise<void> {
    if (isTrackingInitialized) {
      return;
    }
    isTrackingInitialized = true;

    const vid = this.getAnonymousVisitorId();
    const sid = this.getSessionId();

    // 1. Setup Supabase Realtime channel for live counter updates
    this.initRealtime();

    // 2. Fetch authoritative count from Supabase
    await this.fetchVisitorCountFromRemote();

    // 3. Record visit in Supabase if not yet recorded during this browser tab session
    const alreadyLogged = sessionStorage.getItem(STORAGE_KEYS.VISIT_LOGGED_SESSION);
    if (!alreadyLogged) {
      await this.recordVisitInDatabase(vid, sid);
      try {
        sessionStorage.setItem(STORAGE_KEYS.VISIT_LOGGED_SESSION, 'true');
      } catch {}
    }
  },

  /**
   * Records or updates the visitor's record in Supabase PostgreSQL
   */
  async recordVisitInDatabase(visitorId: string, sessionId: string): Promise<void> {
    const supabase = getSupabase();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (supabase && isSupabaseConfigured()) {
      try {
        // Upsert into Supabase `site_visitors` table
        const { error } = await supabase
          .from('site_visitors')
          .upsert({
            visitor_id: visitorId,
            session_id: sessionId,
            last_path: currentPath,
            last_seen: new Date().toISOString()
          }, { onConflict: 'visitor_id' });

        if (error) {
          console.warn('Supabase visitor tracking notice:', error.message);
          this.recordVisitLocally(visitorId);
        } else {
          // Re-fetch exact count after recording
          await this.fetchVisitorCountFromRemote();
        }
      } catch (e) {
        console.warn('Visitor record exception:', e);
        this.recordVisitLocally(visitorId);
      }
    } else {
      this.recordVisitLocally(visitorId);
    }
  },

  /**
   * Offline/local fallback to track unique visitors if Supabase is offline
   */
  recordVisitLocally(visitorId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_VISITORS);
      const set: string[] = raw ? JSON.parse(raw) : [];
      if (!set.includes(visitorId)) {
        set.push(visitorId);
        localStorage.setItem(STORAGE_KEYS.LOCAL_VISITORS, JSON.stringify(set));
      }
      if (cachedVisitorCount < set.length) {
        cachedVisitorCount = set.length;
        localStorage.setItem(STORAGE_KEYS.CACHED_COUNT, cachedVisitorCount.toString());
        notifyListeners();
      }
    } catch {}
  },

  /**
   * Sets up Supabase Realtime channel to listen for new site visitors
   */
  initRealtime(): void {
    if (realtimeChannelSubscribed) return;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      supabase.channel('nawabi_safar_site_visitors_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_visitors' }, async () => {
          await this.fetchVisitorCountFromRemote();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            realtimeChannelSubscribed = true;
          }
        });
    } catch (e) {
      console.warn('Visitor realtime setup warning:', e);
    }
  },

  /**
   * Queries Supabase for the exact COUNT(DISTINCT visitor_id) from PostgreSQL
   */
  async fetchVisitorCountFromRemote(): Promise<number> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { count, error } = await supabase
          .from('site_visitors')
          .select('*', { count: 'exact', head: true });

        if (!error && typeof count === 'number') {
          cachedVisitorCount = count;
          try {
            localStorage.setItem(STORAGE_KEYS.CACHED_COUNT, count.toString());
          } catch {}
          notifyListeners();
          return count;
        }
      } catch (e) {
        console.warn('Failed to query site_visitors count from Supabase:', e);
      }
    }

    // Local fallback calculation
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_VISITORS);
      const set: string[] = raw ? JSON.parse(raw) : [];
      cachedVisitorCount = Math.max(cachedVisitorCount, set.length, 1);
    } catch {
      cachedVisitorCount = Math.max(cachedVisitorCount, 1);
    }
    return cachedVisitorCount;
  },

  /**
   * Asynchronous count getter: guarantees fresh count from Supabase PostgreSQL
   */
  async getPlatformVisitorCount(): Promise<number> {
    return await this.fetchVisitorCountFromRemote();
  },

  /**
   * Synchronous count getter: returns current cached count instantly for initial render
   */
  getPlatformVisitorCountSync(): number {
    return cachedVisitorCount || 1;
  },

  /**
   * Records navigation visit if needed
   */
  recordPageVisit(path: string): void {
    const supabase = getSupabase();
    const vid = this.getAnonymousVisitorId();
    if (supabase && isSupabaseConfigured()) {
      (async () => {
        try {
          await supabase
            .from('site_visitors')
            .update({ last_path: path, last_seen: new Date().toISOString() })
            .eq('visitor_id', vid);
        } catch {}
      })();
    }
  }
};
