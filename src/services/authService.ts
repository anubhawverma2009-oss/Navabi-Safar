export interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: 'super_admin' | 'editor';
  token: string;
  loginTime: string;
}

const ADMIN_SESSION_KEY = 'nawabi_safar_admin_auth_v1';

export const AuthService = {
  // Pre-configured secure admin demo credentials
  login(email: string, password: string): { success: boolean; error?: string; session?: AdminSession } {
    const cleanEmail = email.trim().toLowerCase();
    
    // Default admin credentials: admin@nawabisafar.in / lucknow@2026 or admin / password
    if ((cleanEmail === 'admin@nawabisafar.in' || cleanEmail === 'admin@nawabisafar.com' || cleanEmail === 'admin') && 
        (password === 'lucknow@2026' || password === 'admin123' || password === 'admin')) {
      const session: AdminSession = {
        isAuthenticated: true,
        email: cleanEmail.includes('@') ? cleanEmail : 'admin@nawabisafar.in',
        name: 'Nawabi Safar Lead Curator',
        role: 'super_admin',
        token: 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      return { success: true, session };
    }
    
    return {
      success: false,
      error: 'Invalid administrator credentials. Try admin@nawabisafar.in with password lucknow@2026'
    };
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
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};
