import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import { ShieldCheck, Lock, Mail, ArrowLeft, Key, Sparkles } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@nawabisafar.in');
  const [password, setPassword] = useState('lucknow@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const success = AuthService.login(email, password);
      setLoading(false);
      if (success) {
        onLoginSuccess();
        onNavigate('/admin/dashboard');
      } else {
        setError('Invalid administrator email or password. Please check your credentials.');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@nawabisafar.in');
    setPassword('lucknow@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#181512] flex items-center justify-center p-4 sm:p-6 lucknow-pattern" id="admin-login-page">
      <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-white space-y-6">
        {/* Back link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Nawabi Safar</span>
        </button>

        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-serif-heading text-white">
            Curator & Admin Portal
          </h1>
          <p className="text-xs text-stone-400">
            Sign in to manage Lucknow destinations, local artisans, emergency numbers, and platform parameters.
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="bg-amber-950/50 border border-amber-800/40 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Demo Admin Access
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] underline hover:text-amber-200"
            >
              Autofill
            </button>
          </div>
          <div className="text-stone-300 text-[11px]">
            Email: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">admin@nawabisafar.in</code>
          </div>
          <div className="text-stone-300 text-[11px]">
            Pass: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">lucknow@2026</code>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/40 border border-red-800 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@nawabisafar.in"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                id="admin-email-input"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                id="admin-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            id="admin-login-submit-btn"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
