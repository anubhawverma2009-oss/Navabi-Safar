import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AdminSession {
  isAuthenticated: boolean;
  userId: string;
  email: string;
  name: string;
  role: 'super_admin' | 'editor';
  token: string;
  loginTime: string;
}

const ADMIN_SESSION_KEY = 'nawabi_safar_admin_auth_v1';
const DEFAULT_ADMIN_EMAIL = 'admin@nawabisafar.in';

let inMemorySession: AdminSession | null = null;

export const AuthService = {
  /**
   * Administrator Login Handler
   * Strictly enforces Supabase Auth + public.admin_users verification.
   * Insecure client-side mock fallbacks are completely eliminated.
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    const cleanEmail = email.trim().toLowerCase();
    const formattedEmail = cleanEmail.includes('@') ? cleanEmail : DEFAULT_ADMIN_EMAIL;

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in environment variables.'
      };
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: password
      });

      if (error) {
        if (error.code === 'email_not_confirmed' || error.message.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email not confirmed in Supabase Auth. Please run the safe provisioning script (supabase_admin_provision.sql) in your Supabase SQL Editor to confirm admin@nawabisafar.in and activate admin privileges.'
          };
        }
        if (error.code === 'invalid_credentials' || error.message.toLowerCase().includes('invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid administrator credentials in Supabase Auth. Please verify your email and password.'
          };
        }
        return {
          success: false,
          error: `Supabase Authentication failed: ${error.message}`
        };
      }

      if (!data?.user || !data?.session) {
        return {
          success: false,
          error: 'Authentication failed: No user session returned from Supabase Auth.'
        };
      }

      // 2. Authorize against public.admin_users table
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (adminErr) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Failed to query public.admin_users: ${adminErr.message}. Ensure RLS policies and table exist.`
        };
      }

      if (!adminRecord || !adminRecord.is_active) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `User "${formattedEmail}" authenticated successfully, but is not authorized in public.admin_users (is_active = true). Run supabase_admin_provision.sql in Supabase SQL Editor to grant curator permissions.`
        };
      }

      // 3. Create verified admin session
      const session: AdminSession = {
        isAuthenticated: true,
        userId: data.user.id,
        email: data.user.email || formattedEmail,
        name: 'Nawabi Safar Verified Curator',
        role: (adminRecord.role as 'super_admin' | 'editor') || 'super_admin',
        token: data.session.access_token,
        loginTime: new Date().toISOString()
      };

      inMemorySession = session;
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch {
        // ignore storage errors
      }

      return { success: true, session };
    } catch (authEx: any) {
      return {
        success: false,
        error: `Supabase Auth connection exception: ${authEx.message || 'Unknown network error'}`
      };
    }
  },

  /**
   * Synchronizes and verifies current session with Supabase Auth
   */
  async verifySession(): Promise<AdminSession | null> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      this.clearSession();
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        this.clearSession();
        return null;
      }

      // Re-verify against public.admin_users
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (!adminRecord || !adminRecord.is_active) {
        await supabase.auth.signOut();
        this.clearSession();
        return null;
      }

      const session: AdminSession = {
        isAuthenticated: true,
        userId: data.session.user.id,
        email: data.session.user.email || DEFAULT_ADMIN_EMAIL,
        name: 'Nawabi Safar Verified Curator',
        role: (adminRecord.role as 'super_admin' | 'editor') || 'super_admin',
        token: data.session.access_token,
        loginTime: inMemorySession?.loginTime || new Date().toISOString()
      };

      inMemorySession = session;
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch {
      return this.getSession();
    }
  },

  clearSession(): void {
    inMemorySession = null;
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  },

  getSession(): AdminSession | null {
    if (inMemorySession && inMemorySession.isAuthenticated) {
      return inMemorySession;
    }

    try {
      const data = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!data) return null;
      const session: AdminSession = JSON.parse(data);
      if (session && session.isAuthenticated && session.token && !session.token.startsWith('token_')) {
        inMemorySession = session;
        return session;
      }
      // Invalidate any legacy demo/mock tokens
      this.clearSession();
      return null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  },

  getCurrentUser(): AdminSession | null {
    return this.getSession();
  },

  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Password update failed' };
    }
  },

  async logout(): Promise<void> {
    this.clearSession();
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
  }
};

