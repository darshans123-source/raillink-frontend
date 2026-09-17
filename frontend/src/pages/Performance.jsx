import React, { useState } from 'react';
import { api } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

import { Play, LineChart as ChartIcon, BarChart2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Performance() {
  const [speed, setSpeed] = useState(300);
  const [modulation, setModulation] = useState('QPSK');
  const [runsPerPt, setRunsPerPt] = useState(2);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [snrResults, setSnrResults] = useState(null);
  const [speedResults, setSpeedResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Run SNR Sweep Benchmark
  const handleRunSnrSweep = async () => {
    setIsLoading(true);
    setLoadingMessage('Executing real Monte Carlo physical layer simulations across SNR range (0-30 dB)...');
    setErrorMessage(null);

    try {
      const data = await api.runSnrAnalysis({
        snrList: [0, 5, 10, 15, 20, 25, 30],
        speed: Number(speed),
        carrierFrequency: 2.6e9,
        modulation,
        pilotMode: 'SCATTERED',
        pilotSpacing: 4,
        runsPerSnr: Number(runsPerPt),
      });
      setSnrResults(data.data);
    } catch (err) {
      console.error('SNR sweep failed:', err);
      setErrorMessage(err.response?.data?.error || 'SNR performance sweep failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run Speed Sweep Benchmark
  const handleRunSpeedSweep = async () => {
    setIsLoading(true);
    setLoadingMessage('Executing simulation across train speeds (50-500 km/h) to evaluate mobility impacts...');
    setErrorMessage(null);

    try {
      const data = await api.runSpeedAnalysis({
        speeds: [50, 100, 200, 300, 500],
        snr: 15.0,
        carrierFrequency: 2.6e9,
        modulation,
        pilotMode: 'SCATTERED',
        pilotSpacing: 4,
      });
      setSpeedResults(data.data);
    } catch (err) {
      console.error('Speed sweep failed:', err);
      setErrorMessage(err.response?.data?.error || 'Speed sweep failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format Recharts data for BER vs SNR
  const berSnrData = snrResults?.snr_db?.map((snr, i) => ({
    snr: snr,
    berLs: Math.max(snrResults.ber_ls[i], 1e-5),
    berCnn: Math.max(snrResults.ber_cnn[i], 1e-5),
  })) || [];

  // Format Recharts data for NMSE (dB) vs SNR
  const nmseSnrData = snrResults?.snr_db?.map((snr, i) => ({
    snr: snr,
    nmseLsDb: Number(snrResults.nmse_ls_db[i].toFixed(2)),
    nmseCnnDb: Number(snrResults.nmse_cnn_db[i].toFixed(2)),
  })) || [];

  // Format Recharts data for BER vs Speed
  const berSpeedData = speedResults?.speed_kmh?.map((spd, i) => ({
    speed: spd,
    berLs: Number(speedResults.ber_ls[i].toFixed(5)),
    berCnn: Number(speedResults.ber_cnn[i].toFixed(5)),
  })) || [];

  // Format Recharts data for NMSE vs Speed
  const nmseSpeedData = speedResults?.speed_kmh?.map((spd, i) => ({
    speed: spd,
    nmseLs: Number(speedResults.nmse_ls[i].toFixed(5)),
    nmseCnn: Number(speedResults.nmse_cnn[i].toFixed(5)),
  })) || [];

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Performance Analysis &amp; Benchmarking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct multi-point Monte Carlo sweeps to analytically compare Bit Error Rate (BER) and NMSE curves between Traditional LS and 1D CNN.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleRunSnrSweep}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN SNR SWEEP (0-30 dB)</span>
          </button>
          <button
            onClick={handleRunSpeedSweep}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <ChartIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>RUN SPEED SWEEP</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Benchmark Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Parameters:</span>
          <span>Operating Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-xs font-medium"
          >
            <option value="100">100 km/h</option>
            <option value="200">200 km/h</option>
            <option value="300">300 km/h (Standard HSR)</option>
            <option value="500">500 km/h (Extreme Doppler)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Modulation:</span>
          <select
            value={modulation}
            onChange={(e) => setModulation(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-xs font-medium"
          >
            <option value="BPSK">BPSK</option>
            <option value="QPSK">QPSK</option>
            <option value="16-QAM">16-QAM</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Runs per point:</span>
          <select
            value={runsPerPt}
            onChange={(e) => setRunsPerPt(Number(e.target.value))}
            className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-xs font-medium"
          >
            <option value="1">1 (Fastest)</option>
            <option value="2">2 (Balanced)</option>
            <option value="3">3 (Averaged)</option>
          </select>
        </div>
      </div>

      {/* Dual Charts: BER vs SNR & NMSE vs SNR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: BER vs SNR */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bit Error Rate (BER) vs. SNR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated under {speed} km/h Doppler fading across 0 to 30 dB SNR
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {berSnrData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={berSnrData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="snr" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'SNR (dB)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'BER (Linear)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="berLs" name="Traditional LS" stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="berCnn" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Click "RUN SNR SWEEP" to generate real BER curves.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: NMSE (dB) vs SNR */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Channel NMSE (dB) vs. SNR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Channel estimation normalized MSE in decibels (10 log10(NMSE))
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {nmseSnrData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nmseSnrData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="snr" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'SNR (dB)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'NMSE (dB)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="nmseLsDb" name="Traditional LS" stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="nmseCnnDb" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Click "RUN SNR SWEEP" to generate real NMSE curves.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dual Charts: BER vs Speed & NMSE vs Speed */}
      {speedResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BER vs Speed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  BER vs. Train Speed (km/h)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demonstrating Doppler resilience across mobility spectrum
                </p>
              </div>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={berSpeedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="speed" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'BER', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="berLs" name="Traditional LS" stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="berCnn" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NMSE vs Speed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  NMSE (Linear) vs. Train Speed (km/h)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estimation distortion degradation with Doppler frequency increase
                </p>
              </div>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nmseSpeedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="speed" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'NMSE', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="nmseLs" name="Traditional LS" stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="nmseCnn" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Numerical Results Table */}
      {snrResults && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Analytical Benchmark Data
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">SNR (dB)</th>
                  <th className="py-2.5 px-4 text-rose-700">LS BER</th>
                  <th className="py-2.5 px-4 text-emerald-800">1D CNN BER</th>
                  <th className="py-2.5 px-4 text-rose-700">LS NMSE (dB)</th>
                  <th className="py-2.5 px-4 text-emerald-800">1D CNN NMSE (dB)</th>
                  <th className="py-2.5 px-4">NMSE Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {snrResults.snr_db.map((snr, idx) => {
                  const gain = (snrResults.nmse_ls_db[idx] - snrResults.nmse_cnn_db[idx]).toFixed(2);
                  return (
                    <tr key={snr} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{snr} dB</td>
                      <td className="py-2.5 px-4 text-slate-600">{snrResults.ber_ls[idx].toFixed(5)}</td>
                      <td className="py-2.5 px-4 text-emerald-800 font-bold">{snrResults.ber_cnn[idx].toFixed(5)}</td>
                      <td className="py-2.5 px-4 text-slate-600">{snrResults.nmse_ls_db[idx].toFixed(2)} dB</td>
                      <td className="py-2.5 px-4 text-emerald-800 font-bold">{snrResults.nmse_cnn_db[idx].toFixed(2)} dB</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-bold">+{gain} dB</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
