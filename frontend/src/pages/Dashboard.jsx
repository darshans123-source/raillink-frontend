import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MetricCard from '../components/MetricCard';
import QuickActions from '../components/QuickActions';
import ComparisonTable from '../components/ComparisonTable';
import ChannelResponsePlot from '../components/ChannelResponsePlot';
import PipelineFlow from '../components/PipelineFlow';
import LoadingOverlay from '../components/LoadingOverlay';
import { api } from '../services/api';
import {
  Train,
  Zap,
  Radio,
  Cpu,
  ShieldCheck,
  Activity,
  AlertCircle,
  Play,
  TrendingDown,
  BarChart2,
} from 'lucide-react';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Performance benchmark sweeps state
  const [snrSweepData, setSnrSweepData] = useState(null);
  const [speedSweepData, setSpeedSweepData] = useState(null);
  const [isSweeping, setIsSweeping] = useState(false);

  // Initial load: get model status
  useEffect(() => {
    async function init() {
      try {
        const status = await api.getModelStatus();
        setModelStatus(status);
      } catch (err) {
        console.warn('API Gateway offline or initializing:', err);
      }
    }
    init();
  }, []);

  // Quick Transmission Test handler
  const handleQuickRun = async () => {
    setIsLoading(true);
    setLoadingMsg('Running physical layer OFDM simulation with 1D CNN channel estimation...');
    setErrorMsg(null);

    try {
      const data = await api.runSimulation({
        speed: 300,
        carrierFrequency: 2.6e9,
        snr: 15,
        modulation: 'QPSK',
        pilotMode: 'SCATTERED',
        pilotSpacing: 4,
        estimator: 'COMPARE',
      });
      setResults(data);
    } catch (err) {
      console.error('Simulation error:', err);
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          'Failed to execute simulation. Ensure backend and ML services are running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Run multi-point benchmark sweep for additional charts
  const handleRunBenchmarks = async () => {
    setIsSweeping(true);
    setErrorMsg(null);
    try {
      // 1. Run SNR Sweep
      const snrRes = await api.runSnrAnalysis({
        snrList: [0, 5, 10, 15, 20, 25, 30],
        speed: 300,
        carrierFrequency: 2.6e9,
        modulation: 'QPSK',
        pilotMode: 'SCATTERED',
        pilotSpacing: 4,
        runsPerSnr: 2,
      });
      setSnrSweepData(snrRes.data);

      // 2. Run Speed Sweep
      const spdRes = await api.runSpeedAnalysis({
        speeds: [50, 100, 200, 300, 400, 500],
        snr: 15,
        carrierFrequency: 2.6e9,
        modulation: 'QPSK',
        pilotMode: 'SCATTERED',
        pilotSpacing: 4,
      });
      setSpeedSweepData(spdRes.data);
    } catch (err) {
      console.error('Benchmark sweep failed:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to generate benchmark curves.');
    } finally {
      setIsSweeping(false);
    }
  };

  // Download simulation JSON data
  const handleDownload = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI-RailLink-Simulation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data for sweeps
  const berSnrChart =
    snrSweepData?.snr_db?.map((snr, idx) => ({
      snr,
      berLs: snrSweepData.ber_ls[idx],
      berCnn: snrSweepData.ber_cnn[idx],
    })) || [];

  const nmseSnrChart =
    snrSweepData?.snr_db?.map((snr, idx) => ({
      snr,
      nmseLsDb: Number(snrSweepData.nmse_ls_db[idx].toFixed(2)),
      nmseCnnDb: Number(snrSweepData.nmse_cnn_db[idx].toFixed(2)),
    })) || [];

  const berSpeedChart =
    speedSweepData?.speed_kmh?.map((spd, idx) => ({
      speed: spd,
      berLs: speedSweepData.ber_ls[idx],
      berCnn: speedSweepData.ber_cnn[idx],
    })) || [];

  const nmseSpeedChart =
    speedSweepData?.speed_kmh?.map((spd, idx) => ({
      speed: spd,
      nmseLs: speedSweepData.nmse_ls[idx],
      nmseCnn: speedSweepData.nmse_cnn[idx],
    })) || [];

  const dopplerSpeedChart =
    speedSweepData?.speed_kmh?.map((spd, idx) => ({
      speed: spd,
      doppler: speedSweepData.doppler_hz[idx],
    })) || [];

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={isLoading} message={loadingMsg} />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Section 5: Metric Cards (Real backend values or '--') */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Train Speed */}
        <MetricCard
          title="TRAIN SPEED"
          value={results ? results.simulation_parameters?.speed_kmh : '--'}
          unit={results ? 'km/h' : ''}
          subtitle={
            results?.simulation_parameters?.speed_ms
              ? `${results.simulation_parameters.speed_ms.toFixed(2)} m/s`
              : '83.33 m/s nominal'
          }
          icon={Train}
          badgeText={results ? 'Real-Time' : null}
          badgeType="default"
        />

        {/* Card 2: Doppler Frequency */}
        <MetricCard
          title="DOPPLER FREQ"
          value={
            results?.channel_metrics?.max_doppler_hz !== undefined
              ? results.channel_metrics.max_doppler_hz.toFixed(1)
              : '--'
          }
          unit={results ? 'Hz' : ''}
          subtitle={
            results?.simulation_parameters?.carrier_frequency_ghz
              ? `f_c = ${results.simulation_parameters.carrier_frequency_ghz} GHz`
              : 'f_c = 2.6 GHz'
          }
          icon={Zap}
          badgeText={results ? 'f_d = (v/c)*fc' : null}
          badgeType="info"
        />

        {/* Card 3: Channel SNR */}
        <MetricCard
          title="CHANNEL SNR"
          value={
            results?.simulation_parameters?.snr_db !== undefined
              ? results.simulation_parameters.snr_db
              : '--'
          }
          unit={results ? 'dB' : ''}
          subtitle={
            results?.simulation_parameters?.modulation
              ? `${results.simulation_parameters.modulation} Modulation`
              : 'AWGN + Multipath'
          }
          icon={Radio}
          badgeText={results ? 'Ricean K=6dB' : null}
          badgeType="default"
        />

        {/* Card 4: CNN Status */}
        <MetricCard
          title="CNN STATUS"
          value={
            modelStatus?.status === 'TRAINED'
              ? 'Active (1D CNN)'
              : results?.estimator_used || (modelStatus ? 'Available' : '--')
          }
          unit=""
          subtitle={
            results?.cnn?.latency_ms !== undefined
              ? `${results.cnn.latency_ms.toFixed(2)} ms latency`
              : 'TensorFlow Engine'
          }
          icon={Cpu}
          badgeText={modelStatus?.status === 'TRAINED' ? 'Trained' : 'Untrained'}
          badgeType={modelStatus?.status === 'TRAINED' ? 'success' : 'warning'}
        />

        {/* Card 5: Bit Error Rate */}
        <MetricCard
          title="BIT ERROR RATE"
          value={
            results?.cnn?.ber !== undefined
              ? results.cnn.ber.toFixed(4)
              : results?.ls?.ber !== undefined
              ? results.ls.ber.toFixed(4)
              : '--'
          }
          unit=""
          subtitle={
            results?.ls?.ber !== undefined && results?.cnn?.ber !== undefined
              ? `LS: ${results.ls.ber.toFixed(4)}`
              : 'Demodulated Bits'
          }
          icon={ShieldCheck}
          badgeText={
            results?.comparison?.ber_reduction > 0 ? 'Improved' : null
          }
          badgeType="success"
        />

        {/* Card 6: Channel NMSE */}
        <MetricCard
          title="CHANNEL NMSE"
          value={
            results?.cnn?.nmse_db !== undefined
              ? `${results.cnn.nmse_db.toFixed(1)} dB`
              : results?.ls?.nmse_db !== undefined
              ? `${results.ls.nmse_db.toFixed(1)} dB`
              : '--'
          }
          unit=""
          subtitle={
            results?.ls?.nmse_db !== undefined && results?.cnn?.nmse_db !== undefined
              ? `LS: ${results.ls.nmse_db.toFixed(1)} dB`
              : 'CFR Distortion'
          }
          icon={Activity}
          badgeText={
            results?.comparison?.cnn_better_nmse ? '1D CNN Win' : null
          }
          badgeType="success"
        />
      </div>

      {/* Section 6: Quick Actions */}
      <QuickActions
        onQuickRun={handleQuickRun}
        onDownload={handleDownload}
        isLoading={isLoading}
        hasResults={!!results}
      />

      {/* Section 10: System Pipeline */}
      <PipelineFlow />

      {/* Section 7: LS vs 1D CNN Comparison */}
      <ComparisonTable results={results} />

      {/* Section 8: Channel Frequency Response Chart */}
      <ChannelResponsePlot data={results?.channel_frequency_response} />

      {/* Section 9: Additional Analysis Charts (Real Performance API Results) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Parametric Performance Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-point Monte Carlo sweeps across SNR (0-30 dB) and Train Speeds (50-500 km/h)
            </p>
          </div>
          <button
            onClick={handleRunBenchmarks}
            disabled={isSweeping}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>
              {isSweeping ? 'Computing Sweeps...' : 'Generate Live Analytics Curves'}
            </span>
          </button>
        </div>

        {isSweeping && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="font-medium">
              Executing real Monte Carlo physical layer simulations in Python across SNR and train speeds...
            </div>
          </div>
        )}

        {snrSweepData || speedSweepData ? (
          <div className="space-y-6">
            {/* Row 1: BER vs SNR and NMSE vs SNR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BER vs SNR */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  BER vs. SNR (0 - 30 dB @ 300 km/h)
                </h4>
                <div className="h-60 w-full mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={berSnrChart} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="snr" stroke="#94a3b8" fontSize={10} tickLine={false} label={{ value: 'SNR (dB)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} label={{ value: 'BER', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="berLs" name="Traditional LS" stroke="#e63946" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="berCnn" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.2} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* NMSE vs SNR */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  NMSE (dB) vs. SNR (0 - 30 dB @ 300 km/h)
                </h4>
                <div className="h-60 w-full mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nmseSnrChart} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="snr" stroke="#94a3b8" fontSize={10} tickLine={false} label={{ value: 'SNR (dB)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} label={{ value: 'NMSE (dB)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="nmseLsDb" name="Traditional LS" stroke="#e63946" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="nmseCnnDb" name="AI 1D CNN" stroke="#2d6a4f" strokeWidth={2.2} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: BER vs Speed, NMSE vs Speed, Doppler vs Speed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BER vs Speed */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  BER vs. Train Speed (km/h)
                </h4>
                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={berSpeedChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="speed" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="berLs" name="LS" stroke="#e63946" strokeWidth={1.8} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="berCnn" name="1D CNN" stroke="#2d6a4f" strokeWidth={2.2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* NMSE vs Speed */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  NMSE (Linear) vs. Speed (km/h)
                </h4>
                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nmseSpeedChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="speed" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="nmseLs" name="LS" stroke="#e63946" strokeWidth={1.8} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="nmseCnn" name="1D CNN" stroke="#2d6a4f" strokeWidth={2.2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Doppler vs Speed */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Max Doppler Shift vs. Speed (km/h)
                </h4>
                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dopplerSpeedChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="speed" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="doppler" name="fd (Hz)" stroke="#1d3557" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Click <strong>"Generate Live Analytics Curves"</strong> to trigger real Monte Carlo sweeps in Python and plot BER vs SNR, NMSE vs SNR, BER vs Speed, NMSE vs Speed, and Doppler vs Speed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
