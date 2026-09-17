import React from 'react';
import { BookOpen, Cpu, Radio, ShieldCheck, Layers, GitBranch } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          About AI-RailLink
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Deep Learning-Based OFDM Channel Estimation for High-Speed Railway Communication Systems.
        </p>
      </div>

      {/* Section 1: Research Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <h3>Research Basis &amp; Literature Reference</h3>
        </div>
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed font-medium">
          <p className="font-bold text-slate-900 mb-1">
            "Deep Learning-Based Channel Estimation With 1D CNN for OFDM Systems Under High-Speed Railway Environments"
          </p>
          <p className="text-emerald-800 text-[11px]">
            IEEE Access / High-Speed Railway Wireless Physical Layer Communications.
          </p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The paper establishes that train mobility between 300 km/h and 500 km/h produces extreme Doppler shifts that break OFDM subcarrier orthogonality, resulting in severe Inter-Carrier Interference (ICI). Traditional Least Squares (LS) estimators with scattered pilot interpolation fail under this rapid channel variation. The paper proposes a 1D Convolutional Neural Network (CNN) to exploit channel frequency correlations and denoise the channel frequency response.
        </p>
      </div>

      {/* Section 2: Research Transparency Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h3>Research Transparency: Paper Methodology vs. Our Student Implementation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Aspect</th>
                <th className="py-2.5 px-4">Published IEEE Paper</th>
                <th className="py-2.5 px-4 text-emerald-800">Our Student Implementation (AI-RailLink)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-800">Channel Model</td>
                <td className="py-2.5 px-4 text-slate-600">Complex proprietary ray-tracing / field measurements</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">Winner-II inspired Rician LOS (K = 6 dB) + Rayleigh multipath simulation</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-800">Pilot Configuration</td>
                <td className="py-2.5 px-4 text-slate-600">Scattered pilot scheme (Z_pilot)</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">Both Scattered (Z_pilot in 1, 2, 4, 8) and Full Pilot options</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-800">Deep Learning</td>
                <td className="py-2.5 px-4 text-slate-600">Offline trained 1D CNN on GPU cluster</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">Lightweight CPU-friendly 1D CNN with live browser training &amp; persistence</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-800">Calculation Authenticity</td>
                <td className="py-2.5 px-4 text-slate-600">Static paper plots &amp; tables</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">100% real mathematical simulation in Python (no fake or hardcoded values)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Architecture Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <GitBranch className="w-4 h-4 text-emerald-700" />
          <h3>System 3-Tier Production Architecture</h3>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed overflow-x-auto">
          <pre>{`[ React.js Frontend (Vite + Tailwind CSS + Recharts) ]
                         │
                         │ HTTP REST API Requests (Port 5000)
                         ▼
[ Node.js + Express.js API Gateway & Validation Controller ]
                         │
                         │ Internal Forwarding (Port 8000)
                         ▼
[ Python FastAPI ML & Signal Processing Service ]
  ├── OFDM Modulation / Demodulation (BPSK, QPSK, 16-QAM)
  ├── 64-Point IFFT & FFT with 16-sample Cyclic Prefix
  ├── Time-Varying HSR Multipath Fading (Winner-II Profile)
  ├── Doppler Shift Calculation: fd = (v / c) * fc
  ├── Traditional Least Squares (LS) Estimation & Interpolation
  ├── 1D CNN Denoising Channel Estimator (TensorFlow/Keras)
  └── Zero-Forcing (ZF) & MMSE Signal Equalization`}</pre>
        </div>
      </div>

      {/* Section 4: Key Formulas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Layers className="w-4 h-4 text-emerald-700" />
          <h3>Mathematical Formulations Implemented</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">1. Maximum Doppler Frequency</h4>
            <p className="font-mono text-emerald-800 font-semibold text-sm">f_d = (v / c) × f_c</p>
            <p className="text-slate-500">
              Where v is train velocity in m/s (v_kmh / 3.6), c = 3 × 10^8 m/s, and f_c is carrier frequency (2.6 GHz).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">2. Least Squares (LS) Estimation</h4>
            <p className="font-mono text-emerald-800 font-semibold text-sm">H_LS[p] = Y[p] / X_pilot[p]</p>
            <p className="text-slate-500">
              Computed directly at pilot subcarrier positions, followed by natural spline interpolation across data subcarriers.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">3. Normalized Mean Squared Error</h4>
            <p className="font-mono text-emerald-800 font-semibold text-sm">NMSE = ||H_true - H_est||² / ||H_true||²</p>
            <p className="text-slate-500">
              Evaluated across all 64 subcarriers and reported in both linear scale and decibels: 10 log10(NMSE).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">4. Bit Error Rate (BER)</h4>
            <p className="font-mono text-emerald-800 font-semibold text-sm">BER = (Bit Errors) / (Total Bits)</p>
            <p className="text-slate-500">
              Calculated by strictly counting bit mismatches between original generated bits and demodulated received bits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
