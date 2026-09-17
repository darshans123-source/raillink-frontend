import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // 1. While Supabase is verifying or restoring session, show clean loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Train className="w-6 h-6" />
          </div>
          <div className="text-xs font-semibold text-slate-500 font-mono tracking-wide">
            Verifying authentication session...
          </div>
        </div>
      </div>
    );
  }

  // 2. If Supabase session exists, render protected page
  if (session) {
    return children;
  }

  // 3. Otherwise, redirect unauthenticated user to /login preserving intended route
  return <Navigate to="/login" state={{ from: location }} replace />;
}
