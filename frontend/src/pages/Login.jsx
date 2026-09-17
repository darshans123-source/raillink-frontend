import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Radio, Cpu, ShieldCheck, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
              <path d="M0,420 Q250,220 500,400" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 8" fill="none" />
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
                Experience real physical layer OFDM simulation, high Doppler mitigation, and 1D CNN channel estimation.
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
              <span>Client-Side Local Session Management</span>
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
              Enter your credentials to access your AI-RailLink research console.
            </p>
          </div>

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
                  placeholder="researcher@institution.edu"
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
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'LOGIN'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Don't have an account?</span>
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center">
            * Note: Account credentials are stored securely in browser localStorage hashed via SHA-256 for student demonstration.
          </div>
        </div>
      </div>
    </div>
  );
}
