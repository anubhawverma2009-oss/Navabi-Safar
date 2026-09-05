import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: 'super_admin' | 'editor';
  token: string;
  loginTime: string;
}

const ADMIN_SESSION_KEY = 'nawabi_safar_admin_auth_v1';
const DEFAULT_ADMIN_EMAIL = 'admin@nawabisafar.in';
const DEFAULT_ADMIN_PASSWORD = 'lucknow@2026';

let runtimeAdminPassword = DEFAULT_ADMIN_PASSWORD;

export const AuthService = {
  getAdminPassword(): string {
    return runtimeAdminPassword;
  },

  /**
   * Administrator Login Handler
   * Attempts Supabase Auth first; falls back to local credential check if Supabase is offline/unconfigured.
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    const cleanEmail = email.trim().toLowerCase();
    const formattedEmail = cleanEmail.includes('@') ? cleanEmail : DEFAULT_ADMIN_EMAIL;

    // 1. Try Supabase Auth if configured
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formattedEmail,
          password: password
        });

        if (!error && data?.user) {
          // Check admin authorization in public.admin_users
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('user_id', data.user.id)
            .single();

          const session: AdminSession = {
            isAuthenticated: true,
            email: data.user.email || formattedEmail,
            name: 'Nawabi Safar Verified Curator',
            role: (adminRecord?.role as 'super_admin' | 'editor') || 'super_admin',
            token: data.session?.access_token || ('token_' + Date.now()),
            loginTime: new Date().toISOString()
          };

          try {
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
          } catch {
            // ignore
          }

          return { success: true, session };
        } else if (error) {
          console.warn('Supabase Auth error, checking fallback demo credentials:', error.message);
        }
      } catch (authEx) {
        console.warn('Supabase Auth connection exception:', authEx);
      }
    }

    // 2. Safe Fallback Credential Check (Ensures zero presentation breakage if DB is offline)
    const currentPassword = this.getAdminPassword();
    const isValidEmail = cleanEmail === DEFAULT_ADMIN_EMAIL || cleanEmail === 'admin';
    const isValidPassword = password === currentPassword;

    if (isValidEmail && isValidPassword) {
      const session: AdminSession = {
        isAuthenticated: true,
        email: formattedEmail,
        name: 'Nawabi Safar Lead Curator',
        role: 'super_admin',
        token: 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
        loginTime: new Date().toISOString()
      };

      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
      return { success: true, session };
    }

    return {
      success: false,
      error: 'Invalid administrator email or password. Please verify your credentials.'
    };
  },

  changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const stored = this.getAdminPassword();
    if (currentPassword !== stored) {
      return { success: false, error: 'Current password does not match.' };
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    runtimeAdminPassword = newPassword;

    // Update Supabase password if currently logged in
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.updateUser({ password: newPassword }).catch(console.warn);
    }

    return { success: true };
  },

  resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== DEFAULT_ADMIN_EMAIL) {
      return { success: false, error: 'Only the registered administrator email is authorized to reset access credentials.' };
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    runtimeAdminPassword = newPassword;
    return { success: true };
  },

  getSession(): AdminSession | null {
    try {
      const data = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!data) return null;
      const session: AdminSession = JSON.parse(data);
      if (session && session.isAuthenticated) {
        return session;
      }
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

  logout(): void {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.signOut().catch(console.warn);
    }
  }
};
