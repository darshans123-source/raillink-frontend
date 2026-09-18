import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Radio,
  LineChart,
  Info,
  Layers,
  Train,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    sublabel: 'Overview & Insights',
    icon: LayoutDashboard,
  },
  {
    path: '/simulator',
    label: 'Simulator',
    sublabel: 'Run OFDM Simulation',
    icon: Cpu,
  },
  {
    path: '/training',
    label: 'AI Training',
    sublabel: 'Train 1D CNN Model',
    icon: Layers,
  },
  {
    path: '/channel-analysis',
    label: 'Channel Analysis',
    sublabel: 'Visualize Channel',
    icon: Radio,
  },
  {
    path: '/performance',
    label: 'Performance',
    sublabel: 'SNR & Speed Analysis',
    icon: LineChart,
  },
  {
    path: '/about',
    label: 'About',
    sublabel: 'Project Details',
    icon: Info,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/30">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                AI-RailLink
              </h1>
              <p className="text-[11px] font-medium text-emerald-700 leading-snug">
                Smart Communication <br />
                for Faster Railways
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 group ${
                    isActive
                      ? 'bg-emerald-50/80 text-emerald-900 font-semibold border-r-4 border-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm leading-snug">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal group-hover:text-slate-500">
                        {item.sublabel}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Railway Footer Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-xl p-4 text-white shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
              <Train className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="inline-block bg-emerald-500/30 text-emerald-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-1.5">
                Indian Railways R&amp;D
              </div>
              <h4 className="text-xs font-bold leading-tight">
                Connecting India's Tomorrow
              </h4>
              <p className="text-[11px] text-emerald-100 mt-1 leading-snug">
                Faster Trains, Smarter Communication.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
