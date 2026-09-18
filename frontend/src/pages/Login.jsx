import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/SplashScreen';
import { Train, Radio, Cpu, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, loading, session, authError } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 1. While Supabase session is loading, show SplashScreen
  if (loading) {
    return <SplashScreen />;
  }

  // 2. If already authenticated with a valid Supabase session, redirect to /dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsConnecting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('[Login] Google OAuth failed:', err);
      setLocalError(err.message || 'Google authentication failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative Railway Vector Contour in Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          <path d="M0,400 Q500,200 1000,350" stroke="#047857" strokeWidth="2" fill="none" />
          <path
            d="M0,430 Q500,230 1000,380"
            stroke="#047857"
            strokeWidth="2"
            strokeDasharray="10 10"
            fill="none"
          />
        </svg>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-100 shadow-2xl shadow-emerald-900/10 p-8 sm:p-10 relative z-10 animate-fadeIn">
        {/* Top Logo & Railway Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-600/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <Train className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow">
              <Radio className="w-2.5 h-2.5" />
            </div>
            <div className="absolute -bottom-1 -left-1 p-1 bg-teal-600 text-white rounded-full shadow">
              <Cpu className="w-2.5 h-2.5" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            AI-RailLink
          </h1>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            Smart Communication for Faster Railways
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Deep Learning-Based OFDM Channel Estimation
          </p>
        </div>

        {/* Error Notification */}
        {displayedError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <div className="font-medium">{displayedError}</div>
          </div>
        )}

        {/* Single Authentication Method: Continue with Google */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isConnecting}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-600 text-slate-800 font-bold text-sm flex items-center justify-center gap-3.5 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
            <span>{isConnecting ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="pt-4 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Secure access via Supabase Authentication &bull; Google OAuth 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
