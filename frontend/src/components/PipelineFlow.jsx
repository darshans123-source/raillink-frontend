import React from 'react';
import {
  Train,
  Zap,
  Radio,
  Wifi,
  RadioReceiver,
  BrainCircuit,
  SlidersHorizontal,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const STEPS = [
  { label: 'Train Speed', desc: '50-500 km/h', icon: Train },
  { label: 'Doppler Shift', desc: 'fd = (v/c)*fc', icon: Zap },
  { label: 'OFDM Tx', desc: 'Mod + IFFT + CP', icon: Radio },
  { label: 'Railway Channel', desc: 'Rician + Rayleigh', icon: Wifi },
  { label: 'Received Rx', desc: 'CP Removal + FFT', icon: RadioReceiver },
  { label: 'LS / 1D CNN', desc: 'Denoising & CFR', icon: BrainCircuit },
  { label: 'Equalization', desc: 'ZF / MMSE', icon: SlidersHorizontal },
  { label: 'BER & NMSE', desc: 'Calculated Metrics', icon: CheckCircle },
];

export default function PipelineFlow() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System Communication Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end physical layer signal propagation &amp; deep learning channel estimation flow
          </p>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          100% Real Pipeline
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={idx}>
              <div className="flex-1 min-w-[105px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-center transition-all hover:bg-emerald-50/60 hover:border-emerald-300 group">
                <div className="w-7 h-7 mx-auto mb-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-300 shadow-2xs transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {step.desc}
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="text-slate-300 px-0.5 flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
