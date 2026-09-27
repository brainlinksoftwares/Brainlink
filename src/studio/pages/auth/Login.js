import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import Modal from '../../components/ui/Modal';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to Brainlink Studio');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in successfully via Google');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      toast.success('Password reset link sent to your inbox');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm mb-3">
          BS
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Brainlink Studio
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enterprise Business Operating System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="st-card p-6 sm:p-8 bg-white dark:bg-slate-900">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                Or with credentials
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@brainlink.in"
                  className="st-input pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-600 dark:text-slate-300 font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="st-input pl-9 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="st-btn-primary w-full h-9 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Super Admin Quick Presets for Testing */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400 mb-2">
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Super Admin Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('vishnoiaaditya29@gmail.com');
                  setPassword('Brainlink@2026!');
                }}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 text-left truncate transition-colors"
                title="Fill Founder Account"
              >
                Aaditya (Founder)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('ceo.brainlink@gmail.com');
                  setPassword('Brainlink@2026!');
                }}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 text-left truncate transition-colors"
                title="Fill CEO Account"
              >
                CEO Brainlink
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setResetSent(false);
        }}
        title="Reset Password"
        subtitle="We will send a password reset link to your registered email"
      >
        {resetSent ? (
          <div className="py-4 text-center text-xs space-y-3">
            <p className="text-slate-600 dark:text-slate-300">
              Reset instructions have been sent to <strong>{resetEmail}</strong>.
            </p>
            <button
              onClick={() => {
                setResetModalOpen(false);
                setResetSent(false);
              }}
              className="st-btn-primary"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@brainlink.in"
                className="st-input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="st-btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="st-btn-primary">
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
