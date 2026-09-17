import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

import { Radio, Zap, Activity, Info, ShieldCheck } from 'lucide-react';

export default function ChannelAnalysis() {
  const [carrierFreq, setCarrierFreq] = useState(2.6);
  const [operatingSpeed, setOperatingSpeed] = useState(300);

  // Generate Doppler Curve points (speeds 0 to 600 km/h)
  const dopplerCurveData = [];
  for (let spd = 0; spd <= 600; spd += 50) {
    const fd = (spd / 3.6 / 3.0e8) * (carrierFreq * 1e9);
    dopplerCurveData.push({
      speed: spd,
      doppler: Number(fd.toFixed(1)),
    });
  }

  // Current Doppler
  const currentDoppler = ((operatingSpeed / 3.6 / 3.0e8) * (carrierFreq * 1e9)).toFixed(1);

  // Multipath Power Delay Profile (Winner-II HSR)
  const pdpData = [
    { tap: 'Tap 0 (LOS)', delay: 0, powerDb: 0.0, desc: 'Direct Line-of-Sight (K = 6.0 dB)' },
    { tap: 'Tap 1', delay: 2, powerDb: -3.0, desc: 'Catenary pole reflection' },
    { tap: 'Tap 2', delay: 4, powerDb: -7.0, desc: 'Track ballast scattering' },
    { tap: 'Tap 3', delay: 7, powerDb: -10.0, desc: 'Viaduct wall reflection' },
    { tap: 'Tap 4', delay: 11, powerDb: -15.0, desc: 'Rear cutting diffraction' },
  ];

  // Jakes' Doppler Power Spectral Density
  const jakesData = [];
  const maxFd = Number(currentDoppler);
  for (let f = -0.95 * maxFd; f <= 0.95 * maxFd; f += maxFd / 20) {
    const ratio = f / maxFd;
    const psd = 1.0 / Math.sqrt(Math.max(0.001, 1.0 - ratio * ratio));
    jakesData.push({
      freq: Number(f.toFixed(1)),
      psd: Number(Math.min(psd, 6.0).toFixed(2)),
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            High-Speed Railway Channel Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Examine Doppler spectrum broadening, Rician K-factor distribution, and Winner-II multipath power delay profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-600">
            Operating: <strong className="text-emerald-800">{operatingSpeed} km/h</strong> @{' '}
            <strong className="text-emerald-800">{carrierFreq} GHz</strong> ({currentDoppler} Hz)
          </div>
        </div>
      </div>

      {/* Grid: Doppler Curve vs Power Delay Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Doppler vs Speed Curve */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Max Doppler Shift vs. Train Speed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated strictly via f_d = (v / c) * f_c
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
              {currentDoppler} Hz @ {operatingSpeed} km/h
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dopplerCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="speed" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Train Speed (km/h)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Doppler Shift (Hz)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="doppler" name="Max Doppler fd (Hz)" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-5 text-center text-xs">
            {[50, 100, 200, 300, 500].map((spd) => (
              <div key={spd} className="p-1 cursor-pointer hover:bg-slate-50 rounded" onClick={() => setOperatingSpeed(spd)}>
                <div className="text-[10px] text-slate-400">{spd} km/h</div>
                <div className="font-bold text-slate-800 font-mono text-[11px]">
                  {((spd / 3.6 / 3.0e8) * (carrierFreq * 1e9)).toFixed(1)} Hz
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Multipath Power Delay Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Multipath Power Delay Profile (PDP)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Winner-II High-Speed Railway propagation model taps
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              5 Multipath Taps
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pdpData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="delay" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Delay (Sample Index)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[-18, 2]} label={{ value: 'Relative Power (dB)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="powerDb" name="Relative Power (dB)" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Dominant Tap (LOS):</span>
              <span>Tap 0 (Delay: 0, Power: 0 dB, Rician K = 6.0 dB)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Max Delay Spread:</span>
              <span>11 samples (&lt; CP length of 16 to prevent ISI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jakes Spectrum Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Theoretical Jakes Doppler Power Spectral Density
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Classic U-shaped Doppler spectrum model: S(f) = 1 / (π * f_d * √(1 - (f/f_d)²))
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
            Span: [-{currentDoppler} Hz, +{currentDoppler} Hz]
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={jakesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="freq" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Doppler Frequency Offset (Hz)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Normalized PSD', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="psd" name="Power Spectral Density" stroke="#2d6a4f" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
