import React from 'react';
import { Cpu, Radio, Zap, ShieldCheck, Train } from 'lucide-react';

export default function HeroBanner() {
  const chips = [
    { label: 'Deep Learning', icon: Cpu },
    { label: 'OFDM (N=64)', icon: Radio },
    { label: 'Doppler Shift', icon: Zap },
    { label: 'Reliable Connectivity', icon: ShieldCheck },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 md:p-8 text-white shadow-md mb-6 border border-emerald-700/50">
      {/* Background SVG Railway Track and Wave Ambient Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,250 C300,200 700,280 1000,220 L1000,300 L0,300 Z"
            fill="#ffffff"
          />
          <path
            d="M0,200 C300,150 700,230 1000,170"
            stroke="#ffffff"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,170 C300,120 700,200 1000,140"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8 8"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-sm border border-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-sm">
          <Train className="w-3.5 h-3.5 text-emerald-300" />
          <span>Next-Gen High-Speed Rail Physical Layer Communications</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
          AI-RailLink
        </h1>
        <p className="mt-2 text-sm sm:text-base text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
          Intelligent OFDM Channel Estimation for High-Speed Railway Networks
          under severe Doppler shifts, multipath Rayleigh fading, and Rician LOS
          propagation.
        </p>

        {/* Feature Badges */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {chips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-50 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-300" />
                <span>{chip.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
