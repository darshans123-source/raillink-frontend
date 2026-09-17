import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Train,
  Radio,
  Cpu,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  AlertTriangle,
} from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle, loading, session, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Target destination: if user was redirected from a protected route, preserve it; otherwise go to /dashboard
  const rawFrom = location.state?.from?.pathname;
  const targetRoute = rawFrom && rawFrom !== '/' && rawFrom !== '/login' ? rawFrom : '/dashboard';

  // If already authenticated by Supabase session, redirect to dashboard
  useEffect(() => {
    if (!loading && session) {
      navigate(targetRoute, { replace: true });
    }
  }, [session, loading, navigate, targetRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Branding & Railway Motif */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle SVG Track Waves */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              preserveAspectRatio="none"
            >
              <path d="M0,400 Q250,200 500,380" stroke="#ffffff" strokeWidth="2" fill="none" />
              <path
                d="M0,420 Q250,220 500,400"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="8 8"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-white shadow-sm">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight leading-tight text-white">
                  AI-RailLink
                </h1>
                <p className="text-[11px] text-emerald-200 font-medium">
                  Smart Communication for Faster Railways
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/50 border border-emerald-400/30 text-emerald-100">
                Next-Gen Railway Telecommunications
              </span>
              <h2 className="text-xl font-bold text-white leading-snug">
                Intelligent Communication for Faster Railways
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Experience real physical layer OFDM simulation, high Doppler mitigation, and 1D CNN
                channel estimation.
              </p>
            </div>
          </div>

          {/* Research badges */}
          <div className="relative z-10 pt-8 mt-6 border-t border-emerald-700/40 space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>64-Subcarrier OFDM Physical Layer</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>1D CNN Real-Time Channel Denoising</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Cloud Authentication &amp; RLS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access your AI-RailLink research console and simulation tools.
            </p>
          </div>

          {/* Missing Configuration Notice */}
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold">Supabase Configuration Required</div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  If you just added keys to <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">frontend/.env</code>, please <strong>restart your Vite dev server</strong> (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">Ctrl + C</code> then <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run dev</code>).
                </div>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="researcher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'AUTHENTICATING...' : 'LOGIN'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Social Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              OR
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{isGoogleSubmitting ? 'CONNECTING...' : 'Continue with Google'}</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Don't have an account?</span>
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
