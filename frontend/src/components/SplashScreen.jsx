import React, { useEffect, useState } from 'react';
import { Train, Radio, Cpu } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 1.5 seconds splash display, then 400ms fade transition
    const timer = setTimeout(() => {
      setFading(true);
    }, 1500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1900);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative Railway Track Background SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path d="M0,320 Q500,240 1000,300" stroke="#ffffff" strokeWidth="2" fill="none" />
          <path d="M0,340 Q500,260 1000,320" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 10" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md animate-fadeIn">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-xl shadow-emerald-900/50 flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-slate-950/70 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
              <Train className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          {/* Subtle orbiting indicators */}
          <div className="absolute -top-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full shadow">
            <Radio className="w-3 h-3" />
          </div>
          <div className="absolute -bottom-1 -left-1 p-1 bg-teal-400 text-slate-950 rounded-full shadow">
            <Cpu className="w-3 h-3" />
          </div>
        </div>

        {/* Project Title */}
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <span>AI-RailLink</span>
        </h1>

        <p className="mt-2 text-sm font-semibold text-emerald-300 tracking-wide uppercase">
          Intelligent OFDM Channel Estimation
        </p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          for High-Speed Railway Networks
        </p>

        {/* Minimal Progress Bar Indicator */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full animate-progress" />
        </div>

        <span className="text-[10px] text-slate-500 font-mono mt-3">
          Initializing physical layer engine &amp; research console...
        </span>
      </div>
    </div>
  );
}
