import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, Shield, Eye, EyeOff, Layers, Receipt, FolderGit2, Sparkles } from 'lucide-react';
import Modal from '../../components/ui/Modal';

import { useStudioBase } from '../../context/StudioBaseContext';

const HIGHLIGHTS = [
  { icon: Layers, title: 'Pipeline to payment', text: 'Leads, deals, proposals and invoices in one flow.' },
  { icon: FolderGit2, title: 'Delivery control', text: 'Milestones, tasks and time tracking per client.' },
  { icon: Receipt, title: 'GST-ready finance', text: 'Invoices, payments and an auditable ledger.' },
];

function BrandMark({ size = 'w-9 h-9 text-[13px]' }) {
  return (
    <div
      className={`${size} rounded-[11px] bg-gradient-to-br from-[#3B5BFF] via-[#6A5CFF] to-[#9A5CFF] flex items-center justify-center font-bold text-white shadow-[0_8px_24px_-6px_rgba(99,102,255,0.8)]`}
    >
      BL
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const { basePath } = useStudioBase();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const defaultDashboard = basePath ? `${basePath}/dashboard` : '/dashboard';
  const rawFrom = location.state?.from?.pathname;
  const from = (rawFrom && !rawFrom.includes('/login') && !rawFrom.includes('/dashboard/dashboard'))
    ? (rawFrom.startsWith('/studio') && !basePath ? (rawFrom.replace(/^\/studio/, '') || defaultDashboard) : rawFrom)
    : defaultDashboard;

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
    <div className="studio-shell st-themed min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="st-sidebar relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(600px 400px at 80% 110%, rgba(154,92,255,0.28), transparent 70%), radial-gradient(500px 300px at 10% 0%, rgba(59,91,255,0.25), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 30% 40%, #000 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, #000 10%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <BrandMark size="w-10 h-10 text-sm" />
          <div>
            <div className="font-bold text-white text-base leading-tight">Brainlink</div>
            <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#7F8DFF]">Studio</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold text-[#B7C3FF] bg-white/[0.06] border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Business operating system
          </span>
          <h1 className="mt-5 text-[40px] leading-[1.08] font-bold tracking-[-0.035em] text-white">
            Run the whole business from{' '}
            <span className="bg-gradient-to-r from-[#8FA2FF] to-[#C29BFF] bg-clip-text text-transparent">
              one studio.
            </span>
          </h1>
          <div className="mt-9 space-y-5">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="flex gap-4">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#A9B6FF]">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-white">{h.title}</div>
                    <div className="text-[13px] text-[#8A93A8] mt-0.5">{h.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative text-[12px] text-[#5F687D]">© {new Date().getFullYear()} Brainlink Softwares</div>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="st-ambient" aria-hidden="true" />
        <div className="relative w-full max-w-[400px]" style={{ animation: 'stRise 480ms var(--st-ease) both' }}>
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <BrandMark />
            <span className="font-bold text-[15px] text-[var(--st-text-primary)]">Brainlink Studio</span>
          </div>

          <h2 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--st-text-primary)] m-0">Welcome back</h2>
          <p className="mt-1.5 text-[13.5px] text-[var(--st-text-secondary)]">Sign in to continue to your workspace.</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="st-btn-secondary w-full h-11 mt-8 text-[13.5px]"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
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

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[var(--st-border)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--st-text-muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--st-border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[12.5px] font-medium text-[var(--st-text-secondary)] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--st-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@brainlink.in"
                  className="st-input h-11 pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[12.5px] font-medium text-[var(--st-text-secondary)]">
                  Password
                </label>
                <button type="button" onClick={() => setResetModalOpen(true)} className="st-link text-[12px]">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--st-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="st-input h-11 pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="st-icon-btn absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="st-btn-primary w-full h-11 text-[13.5px]">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Test-account quick fill: development builds only (dead-code eliminated from production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 rounded-xl border border-dashed border-[var(--st-border-strong)]">
              <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-semibold tracking-wider text-[var(--st-text-muted)] mb-2">
                <Shield className="w-3 h-3" />
                <span>Dev quick fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('vishnoiaaditya29@gmail.com');
                    setPassword('Brainlink@2026!');
                  }}
                  className="st-btn-secondary st-btn-sm"
                >
                  Founder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ceo.brainlink@gmail.com');
                    setPassword('Brainlink@2026!');
                  }}
                  className="st-btn-secondary st-btn-sm"
                >
                  CEO
                </button>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-[12px] text-[var(--st-text-muted)]">
            Protected workspace · Access is logged and audited
          </p>
        </div>
      </main>

      <Modal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setResetSent(false);
        }}
        title="Reset password"
        subtitle="We'll email a reset link to your registered address"
      >
        {resetSent ? (
          <div className="py-4 text-center text-[13px] space-y-4">
            <p className="text-[var(--st-text-secondary)]">
              Reset instructions have been sent to <strong className="text-[var(--st-text-primary)]">{resetEmail}</strong>.
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
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-[12.5px] text-[var(--st-text-secondary)] font-medium mb-1.5">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@brainlink.in"
                className="st-input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setResetModalOpen(false)} className="st-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="st-btn-primary">
                Send reset link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
