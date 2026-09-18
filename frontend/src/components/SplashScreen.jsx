import React from 'react';
import { Train, Radio, Cpu } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/60 text-slate-800 p-6 select-none">
      {/* Decorative Railway Vector Contour */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] overflow-hidden">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path d="M0,280 Q500,160 1000,240" stroke="#047857" strokeWidth="2.5" fill="none" />
          <path
            d="M0,305 Q500,185 1000,265"
            stroke="#047857"
            strokeWidth="2.5"
            strokeDasharray="12 12"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-fadeIn">
        {/* Modern AI-RailLink Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-xl shadow-emerald-600/20 flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <Train className="w-10 h-10 text-emerald-700" />
            </div>
          </div>
          {/* Subtle AI / Wireless satellite nodes */}
          <div className="absolute -top-1.5 -right-1.5 p-1.5 bg-emerald-600 text-white rounded-full shadow-md">
            <Radio className="w-3 h-3" />
          </div>
          <div className="absolute -bottom-1 -left-1.5 p-1.5 bg-teal-600 text-white rounded-full shadow-md">
            <Cpu className="w-3 h-3" />
          </div>
        </div>

        {/* Project Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          AI-RailLink
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-sm font-semibold text-emerald-700 tracking-wide">
          Smart Communication for Faster Railways
        </p>

        <p className="text-xs text-slate-500 mt-1 font-medium">
          Deep Learning-Based OFDM Channel Estimation
        </p>

        {/* Sleek Light-Green Progress Indicator */}
        <div className="w-48 h-1.5 bg-emerald-100 rounded-full mt-7 overflow-hidden border border-emerald-200/60 shadow-inner">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full animate-pulse" />
        </div>

        <span className="text-[11px] text-slate-400 font-mono mt-3.5">
          Initializing authentication session...
        </span>
      </div>
    </div>
  );
}
