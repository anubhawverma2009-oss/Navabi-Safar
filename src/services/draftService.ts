/**
 * NAWABI SAFAR - ADMIN FORM DRAFT SERVICE
 * 
 * Provides resilient, lightweight client-side draft autosave & recovery for
 * Add/Edit forms (Destinations, Local Businesses, etc.).
 * 
 * Rules:
 * - LocalStorage is strictly used for temporary unsaved drafts to protect against
 *   tab switches, external navigation, accidental reloads, or browser memory evictions.
 * - This is NOT authoritative CMS data (Supabase PostgreSQL is authoritative).
 * - Drafts are cleared ONLY after PostgreSQL confirms successful persistence.
 * - Stale drafts (> 7 days) are safely expired.
 */

export interface FormDraft<T = any> {
  version: number;
  formType: 'destination' | 'business' | 'emergency';
  recordId: string; // 'new' or specific entity ID
  savedAt: string;  // ISO timestamp
  data: T;
}

const DRAFT_PREFIX = 'nawabi-safar:admin:draft';
const DRAFT_VERSION = 1;
const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const DraftService = {
  /**
   * Generates the versioned LocalStorage key
   */
  getStorageKey(formType: 'destination' | 'business' | 'emergency', recordId: string = 'new'): string {
    const cleanId = recordId.trim() || 'new';
    return `${DRAFT_PREFIX}:${formType}:${cleanId}`;
  },

  /**
   * Saves or updates a local form draft with current timestamp & metadata
   */
  saveDraft<T = any>(formType: 'destination' | 'business' | 'emergency', recordId: string = 'new', data: T): void {
    if (typeof window === 'undefined') return;
    try {
      const key = this.getStorageKey(formType, recordId);
      const draft: FormDraft<T> = {
        version: DRAFT_VERSION,
        formType,
        recordId: recordId || 'new',
        savedAt: new Date().toISOString(),
        data
      };
      localStorage.setItem(key, JSON.stringify(draft));
    } catch (e) {
      console.warn('Draft save warning (localStorage might be full or disabled):', e);
    }
  },

  /**
   * Retrieves an active draft if present and not expired
   */
  getDraft<T = any>(formType: 'destination' | 'business' | 'emergency', recordId: string = 'new'): FormDraft<T> | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = this.getStorageKey(formType, recordId);
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed: FormDraft<T> = JSON.parse(raw);
      if (!parsed || parsed.version !== DRAFT_VERSION || !parsed.data) {
        this.clearDraft(formType, recordId);
        return null;
      }

      // Check draft expiry
      const draftTime = new Date(parsed.savedAt).getTime();
      if (isNaN(draftTime) || (Date.now() - draftTime > MAX_DRAFT_AGE_MS)) {
        this.clearDraft(formType, recordId);
        return null;
      }

      return parsed;
    } catch (e) {
      console.warn('Error reading form draft:', e);
      return null;
    }
  },

  /**
   * Clears the draft upon confirmed successful database save or explicit discard
   */
  clearDraft(formType: 'destination' | 'business' | 'emergency', recordId: string = 'new'): void {
    if (typeof window === 'undefined') return;
    try {
      const key = this.getStorageKey(formType, recordId);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Error clearing form draft:', e);
    }
  },

  /**
   * Checks if an active draft exists
   */
  hasDraft(formType: 'destination' | 'business' | 'emergency', recordId: string = 'new'): boolean {
    return this.getDraft(formType, recordId) !== null;
  },

  /**
   * Formats ISO draft timestamp for display in UI
   */
  formatDraftTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' (' + date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return 'recent';
    }
  }
};
