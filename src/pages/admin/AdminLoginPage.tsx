import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/authService';
import { getSupabase } from '../../lib/supabaseClient';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot_email' | 'forgot_reset'>('login');
  
  // Login State - Initialized empty on every visit
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Explicitly reset login form and wipe password state on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await AuthService.login(email, password);
      setLoading(false);
      if (res.success) {
        // Clear password in memory before redirect
        setPassword('');
        onLoginSuccess();
        onNavigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator email or password. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRecoveryEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    const clean = recoveryEmail.trim().toLowerCase();
    if (!clean.includes('@')) {
      setRecoveryError('Please provide a valid email address.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setRecoveryError('Supabase is not configured.');
      return;
    }

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(clean);
      if (resetErr) {
        setRecoveryError(`Reset error: ${resetErr.message}`);
        return;
      }

      setSuccessMsg(`Password reset instructions sent to ${clean}. Check your inbox or run supabase_admin_provision.sql in Supabase SQL Editor.`);
      setViewMode('login');
      setRecoveryEmail('');
    } catch (err: any) {
      setRecoveryError(err.message || 'Failed to send password reset request.');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (newPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords do not match. Please ensure both fields match.');
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
        if (updateErr) {
          setRecoveryError(`Update failed: ${updateErr.message}`);
          return;
        }
      } catch (err: any) {
        setRecoveryError(err.message || 'Failed to update password.');
        return;
      }
    }

    setSuccessMsg('Administrator password has been successfully updated. You can now sign in.');
    setViewMode('login');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryEmail('');
  };

  const handleSwitchToForgot = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setRecoveryEmail('');
    setRecoveryError(null);
    setViewMode('forgot_email');
  };

  const handleCancelForgot = () => {
    setRecoveryError(null);
    setRecoveryEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setPassword('');
    setViewMode('login');
  };

  return (
    <div className="min-h-screen bg-[#181512] flex items-center justify-center p-4 sm:p-6 lucknow-pattern" id="admin-login-page">
      <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-white space-y-6">
        {/* Back link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          id="admin-login-back-btn"
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
            {viewMode === 'login' ? 'Curator & Admin Portal' : 'Administrator Recovery'}
          </h1>
          <p className="text-xs text-stone-400">
            {viewMode === 'login'
              ? 'Sign in to manage Lucknow destinations, local artisans, emergency numbers, and platform parameters.'
              : 'Demonstration recovery workflow for authorized platform administrator.'}
          </p>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Standard Login View */}
        {viewMode === 'login' && (
          <>
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
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
                    placeholder="name@nawabisafar.in"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    id="admin-email-input"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleSwitchToForgot}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    id="admin-forgot-password-btn"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    id="admin-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
          </>
        )}

        {/* Forgot Password - Step 1: Email Identification */}
        {viewMode === 'forgot_email' && (
          <form onSubmit={handleRecoveryEmailSubmit} className="space-y-4" autoComplete="off">
            {recoveryError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{recoveryError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Registered Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  placeholder="name@nawabisafar.in"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  id="admin-recovery-email-input"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 leading-normal">
                Enter your authorized curator account email to verify administrator privileges.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForgot}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="admin-verify-email-btn"
              >
                <span>Verify Email</span>
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password - Step 2: Set New Password */}
        {viewMode === 'forgot_reset' && (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4" autoComplete="off">
            {recoveryError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{recoveryError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Identity verified for <strong>{recoveryEmail}</strong></span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                New Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  id="admin-new-password-input"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  id="admin-confirm-password-input"
                />
              </div>
            </div>

            <div className="p-2.5 bg-stone-950/60 border border-stone-800/80 rounded-xl flex items-start gap-2 text-[11px] text-stone-400">
              <Info className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
              <span>
                Demo mode: Password updates immediately for this session. Production builds utilize backend token verification.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForgot}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="admin-save-new-password-btn"
              >
                <span>Save Password</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


