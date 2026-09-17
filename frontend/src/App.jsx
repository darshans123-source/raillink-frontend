import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Training from './pages/Training';
import ChannelAnalysis from './pages/ChannelAnalysis';
import Performance from './pages/Performance';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { api } from './services/api';
import { Train } from 'lucide-react';

function MainLayout({ children, modelStatus }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <TopHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          modelStatus={modelStatus}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
          AI-RailLink &bull; Deep Learning-Based OFDM Channel Estimation for High-Speed Railway Networks
        </footer>
      </div>
    </div>
  );
}

// Root route redirects based on active Supabase authentication state
function RootRoute() {
  const { session, loading } = useAuth();

  console.log('[RootRoute] auth state: loading =', loading, 'hasSession =', Boolean(session));

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

  if (session) {
    console.log('[RootRoute] Authenticated session active, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[RootRoute] Unauthenticated, redirecting to /login');
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  const [modelStatus, setModelStatus] = useState(null);
  const [splashShown, setSplashShown] = useState(() => {
    // If returning from OAuth redirect callback, bypass splash to restore session immediately
    const isOAuthCallback =
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=');
    if (isOAuthCallback) {
      sessionStorage.setItem('aiRailLinkSplashShown', 'true');
      return false;
    }
    // Show splash screen on first load of browser session
    return !sessionStorage.getItem('aiRailLinkSplashShown');
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await api.getModelStatus();
        setModelStatus(data);
      } catch (err) {
        console.warn('Backend ML Service initializing or unreachable:', err);
      }
    }
    loadStatus();
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('aiRailLinkSplashShown', 'true');
    setSplashShown(false);
  };

  if (splashShown) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Routes>
      {/* Root Route based on Supabase session */}
      <Route path="/" element={<RootRoute />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/simulator"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <Simulation />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <Training />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel-analysis"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <ChannelAnalysis />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <Performance />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <About />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
