import React, { useState } from 'react';
import { api } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';
import ChannelResponsePlot from '../components/ChannelResponsePlot';
import ConstellationPlot from '../components/ConstellationPlot';
import ComparisonTable from '../components/ComparisonTable';
import {
  Play,
  Settings,
  Train,
  Zap,
  Radio,
  Sliders,
  Cpu,
  ShieldCheck,
  Activity,
  AlertCircle,
  Clock,
  Waves,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function Simulation() {
  // Simulator input parameters
  const [speed, setSpeed] = useState(300);
  const [carrierFreqGhz, setCarrierFreqGhz] = useState(2.6);
  const [snr, setSnr] = useState(15);
  const [modulation, setModulation] = useState('QPSK');
  const [pilotMode, setPilotMode] = useState('SCATTERED');
  const [pilotSpacing, setPilotSpacing] = useState(4);
  const [estimator, setEstimator] = useState('COMPARE');

  // Simulation execution state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Run Simulation handler
  const handleRunSimulation = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.runSimulation({
        speed: Number(speed),
        carrierFrequency: Number(carrierFreqGhz) * 1e9,
        snr: Number(snr),
        modulation,
        pilotMode,
        pilotSpacing: Number(pilotSpacing),
        estimator,
      });
      setResults(data);
    } catch (err) {
      console.error('Simulation execution failed:', err);
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          'Simulation failed. Ensure Python FastAPI and Node.js gateway are active.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare time domain / subcarrier signal waveforms
  const receivedSignalChart =
    results?.signal_analysis?.received_magnitude?.map((mag, idx) => ({
      sample: idx,
      rxMagnitude: Number(mag.toFixed(4)),
      txMagnitude: results.signal_analysis?.transmitted_magnitude
        ? Number(results.signal_analysis.transmitted_magnitude[idx].toFixed(4))
        : null,
    })) || [];

  const equalizedSignalChart =
    results?.signal_analysis?.eq_cnn_magnitude?.map((cnnMag, idx) => ({
      subcarrier: idx,
      cnnMag: Number(cnnMag.toFixed(4)),
      lsMag: results.signal_analysis?.eq_ls_magnitude
        ? Number(results.signal_analysis.eq_ls_magnitude[idx].toFixed(4))
        : null,
      txMag: results.signal_analysis?.transmitted_magnitude
        ? Number(results.signal_analysis.transmitted_magnitude[idx].toFixed(4))
        : null,
    })) || [];

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isVisible={isLoading}
        message="Simulating OFDM transmission, multipath fading & 1D CNN channel estimation..."
      />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Interactive OFDM Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure physical layer parameters, simulate time-varying high-speed rail channels, and observe real-time LS vs 1D CNN reception.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
            Real Physical Layer Execution
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Main Grid: Parameters on Left, Live Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Simulation Parameters
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              64-Point OFDM
            </span>
          </div>

          {/* 1. Train Speed */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-slate-400" />
                Train Speed:
              </span>
              <span className="text-emerald-700 font-bold font-mono">
                {speed} km/h ({(speed / 3.6).toFixed(1)} m/s)
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>50 km/h (Commuter)</span>
              <span>300 km/h (HSR)</span>
              <span>500 km/h (Maglev/Bullet)</span>
            </div>
          </div>

          {/* 2. Carrier Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              Carrier Frequency (GHz)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.8"
              max="6.0"
              value={carrierFreqGhz}
              onChange={(e) => setCarrierFreqGhz(parseFloat(e.target.value) || 2.6)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-mono"
            />
            <span className="text-[10px] text-slate-400">
              Railway standard: 2.6 GHz (LTE-R / GSM-R band)
            </span>
          </div>

          {/* 3. SNR */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Channel SNR:
              </span>
              <span className="text-emerald-700 font-bold font-mono">
                {snr} dB
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={snr}
              onChange={(e) => setSnr(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0 dB (Very Noisy)</span>
              <span>15 dB</span>
              <span>30 dB (Clear Channel)</span>
            </div>
          </div>

          {/* 4. Modulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Constellation Modulation
            </label>
            <select
              value={modulation}
              onChange={(e) => setModulation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-medium"
            >
              <option value="BPSK">BPSK (1 bit/symbol - Robust)</option>
              <option value="QPSK">QPSK (2 bits/symbol - Standard)</option>
              <option value="16-QAM">16-QAM (4 bits/symbol - High Throughput)</option>
            </select>
          </div>

          {/* 5. Pilot Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilot Mode
              </label>
              <select
                value={pilotMode}
                onChange={(e) => setPilotMode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-medium"
              >
                <option value="SCATTERED">Scattered Pilots</option>
                <option value="FULL">Full Pilots</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilot Spacing (Z)
              </label>
              <select
                value={pilotSpacing}
                onChange={(e) => setPilotSpacing(Number(e.target.value))}
                disabled={pilotMode === 'FULL'}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-medium disabled:opacity-50"
              >
                <option value="1">1 (Every Subcarrier)</option>
                <option value="2">2 (Every 2nd Subcarrier)</option>
                <option value="4">4 (Every 4th Subcarrier)</option>
                <option value="8">8 (Sparse Pilots)</option>
              </select>
            </div>
          </div>

          {/* 6. Estimator Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Channel Estimator Algorithm
            </label>
            <select
              value={estimator}
              onChange={(e) => setEstimator(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-medium"
            >
              <option value="COMPARE">Compare Both (Traditional LS vs 1D CNN)</option>
              <option value="CNN">1D CNN Deep Learning Estimator</option>
              <option value="LS">Traditional Least Squares (LS)</option>
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RUN SIMULATION</span>
          </button>
        </div>

        {/* Right: Live Simulation Results (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Live Simulation Output
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  results
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {results ? 'Execution Completed' : 'Awaiting Run'}
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Doppler Frequency */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Max Doppler
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
                  {results?.channel_metrics?.max_doppler_hz !== undefined
                    ? `${results.channel_metrics.max_doppler_hz.toFixed(1)} Hz`
                    : '--'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  fd = (v/c) * fc
                </div>
              </div>

              {/* Bit Error Rate */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  BER (CNN)
                </div>
                <div className="mt-2 text-xl font-bold text-emerald-800 font-mono">
                  {results?.cnn?.ber !== undefined
                    ? results.cnn.ber.toFixed(5)
                    : '--'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {results?.ls?.ber !== undefined
                    ? `LS: ${results.ls.ber.toFixed(5)}`
                    : '--'}
                </div>
              </div>

              {/* Channel NMSE */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                  <Activity className="w-3 h-3 text-blue-600" />
                  NMSE (dB)
                </div>
                <div className="mt-2 text-xl font-bold text-emerald-800 font-mono">
                  {results?.cnn?.nmse_db !== undefined
                    ? `${results.cnn.nmse_db.toFixed(2)} dB`
                    : '--'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {results?.ls?.nmse_db !== undefined
                    ? `LS: ${results.ls.nmse_db.toFixed(2)} dB`
                    : '--'}
                </div>
              </div>

              {/* Latency */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Latency
                </div>
                <div className="mt-2 text-xl font-bold text-slate-800 font-mono">
                  {results?.cnn?.latency_ms !== undefined
                    ? `${results.cnn.latency_ms.toFixed(2)} ms`
                    : '--'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  1D CNN Inference
                </div>
              </div>

              {/* Estimator Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 col-span-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                  <Cpu className="w-3 h-3 text-emerald-700" />
                  Active Estimator Mode
                </div>
                <div className="mt-2 text-base font-bold text-slate-900">
                  {results?.estimator_used || 'Ready to execute'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {results?.comparison?.cnn_better_nmse
                    ? '1D CNN achieved lower NMSE than traditional LS'
                    : 'Awaiting simulation trigger'}
                </div>
              </div>
            </div>

            {/* Quick Summary Banner */}
            {results && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <span className="font-bold">Transmission Result: </span>
                  <span>
                    Transmitted {results.ls?.total_bits || results.cnn?.total_bits} bits across 64 subcarriers.
                  </span>
                </div>
                <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {results.simulation_parameters?.modulation}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Note: All calculations run through the physical layer Python simulation pipeline with genuine multipath fading and Doppler convolution.
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <ComparisonTable results={results} />

      {/* Channel Frequency Response */}
      <ChannelResponsePlot data={results?.channel_frequency_response} />

      {/* Constellation Diagram */}
      <ConstellationPlot data={results?.constellation} />

      {/* Received vs Equalized Waveforms Section */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waveform 1: Received Signal */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Received Signal Magnitude vs. Transmitted
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Time-Domain Samples
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={receivedSignalChart} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sample" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="txMagnitude" name="Tx Magnitude" stroke="#1d3557" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="rxMagnitude" name="Rx Magnitude (Faded + Noise)" stroke="#e76f51" strokeWidth={1.8} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Waveform 2: Equalized Signal Subcarrier Magnitudes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Equalized Subcarrier Constellation Magnitude
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Subcarrier (0 to 63)
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equalizedSignalChart} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="subcarrier" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="txMag" name="Ideal Tx" stroke="#1d3557" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="lsMag" name="LS Equalized" stroke="#e63946" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="cnnMag" name="1D CNN Equalized" stroke="#2d6a4f" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
