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

function AppRoutes() {
  const [modelStatus, setModelStatus] = useState(null);
  const [splashShown, setSplashShown] = useState(() => {
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
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout modelStatus={modelStatus}>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
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
