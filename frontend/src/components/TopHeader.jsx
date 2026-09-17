import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/crypto';
import { api } from '../services/api';
import {
  Search,
  Menu,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

export default function TopHeader({ onToggleSidebar, modelStatus }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const dropdownRef = useRef(null);

  // Check health periodically to reflect real backend connection
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        await api.getHealth();
        if (isMounted) setIsBackendOnline(true);
      } catch (err) {
        if (isMounted) setIsBackendOnline(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallback to email prefix if full name is not set
  const displayName =
    currentUser?.name ||
    currentUser?.email?.split('@')[0] ||
    'Researcher';

  const initials = getInitials(displayName);
  const isTrained = modelStatus?.status === 'TRAINED';

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Hamburger (mobile) + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Explore simulation, training, and performance analytics..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
            readOnly
          />
        </div>
      </div>

      {/* Right side: Real Status + User profile dropdown */}
      <div className="flex items-center gap-3">
        {/* Real System Online Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isBackendOnline
              ? 'bg-emerald-50 border-emerald-200/70 text-emerald-800'
              : 'bg-rose-50 border-rose-200/70 text-rose-800'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isBackendOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            )}
          </span>
          <span className="hidden md:inline">
            {isBackendOnline ? 'System Online' : 'Backend Offline'}
          </span>
        </div>

        {/* Real Model Status Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isTrained
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {isTrained ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>1D CNN: Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>1D CNN: Not Trained</span>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors max-w-[140px] truncate">
                {displayName}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fadeIn">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email || 'No email registered'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1 space-y-0.5">
                <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Authenticated Session</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
