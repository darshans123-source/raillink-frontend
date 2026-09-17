import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/crypto';
import {
  Train,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle, loading, currentUser, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const initials = getInitials(name);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name,
        email,
        password,
      });

      if (result.emailConfirmationRequired) {
        setSuccessMsg(
          'Account created successfully! If email confirmation is enabled in your Supabase project, please check your inbox to verify your address.'
        );
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        {/* Left Side: Railway Information Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
              preserveAspectRatio="none"
            >
              <path d="M0,350 C200,280 400,450 500,320" stroke="#ffffff" strokeWidth="2" fill="none" />
              <path
                d="M0,370 C200,300 400,470 500,340"
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
                  Research Portal Registration
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/50 border border-emerald-400/30 text-emerald-100">
                JOIN RESEARCH PLATFORM
              </span>
              <h2 className="text-xl font-bold text-white leading-snug">
                Smart Communication for Faster Railways
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Create your personalized researcher profile to access live OFDM simulations, Doppler
                modeling, and 1D CNN channel estimators.
              </p>
            </div>
          </div>

          {/* Dynamic Initials Card - Only Name Displayed */}
          <div className="relative z-10 pt-6 mt-6 border-t border-emerald-700/40 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center border-2 border-emerald-400/50 shadow-inner">
              {initials}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {name.trim() || 'Your Name'}
              </div>
              <div className="text-[11px] text-emerald-200/80">
                {email.trim() || 'researcher@example.com'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create your AI-RailLink account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access intelligent railway communication analytics &amp; physical layer tools.
            </p>
          </div>

          {/* Missing Configuration Notice */}
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold">Supabase Configuration Required</div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Please set <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> in your environment.
                </div>
              </div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Password and Confirm Password in 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
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
            <span className="text-slate-500">Already have an account?</span>
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
