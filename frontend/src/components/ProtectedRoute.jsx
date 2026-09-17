import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  console.log(
    '[ProtectedRoute] path:',
    location.pathname,
    'loading:',
    loading,
    'hasSession:',
    Boolean(session)
  );

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

  // 2. If no valid Supabase session exists, redirect directly to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render protected page or nested Outlet
  return children ? children : <Outlet />;
}
