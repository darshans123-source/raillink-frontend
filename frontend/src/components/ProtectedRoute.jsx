import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from './SplashScreen';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  // 1. While Supabase is verifying or restoring session, show SplashScreen
  if (loading) {
    return <SplashScreen />;
  }

  // 2. If session does not exist after loading completes, redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated session exists: render protected page
  return children ? children : <Outlet />;
}
