import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings2, BarChart2, BrainCircuit, Download } from 'lucide-react';

export default function QuickActions({ onQuickRun, onDownload, isLoading, hasResults }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Control Actions
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Physical Layer Execution
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Quick Transmission Test */}
        <button
          onClick={onQuickRun}
          disabled={isLoading}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 transition-all font-semibold text-left disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
        >
          <div className="p-2 rounded-lg bg-emerald-700 text-white group-hover:scale-105 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Quick Test</div>
            <div className="text-[10px] text-emerald-700 font-normal">Run simulation</div>
          </div>
        </button>

        {/* Open Simulator */}
        <button
          onClick={() => navigate('/simulator')}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-all font-medium text-left group shadow-sm"
        >
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
            <Settings2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Simulator</div>
            <div className="text-[10px] text-slate-500">Configure parameters</div>
          </div>
        </button>

        {/* View Performance */}
        <button
          onClick={() => navigate('/performance')}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-all font-medium text-left group shadow-sm"
        >
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Performance</div>
            <div className="text-[10px] text-slate-500">SNR &amp; Speed analysis</div>
          </div>
        </button>

        {/* Train Model */}
        <button
          onClick={() => navigate('/training')}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-all font-medium text-left group shadow-sm"
        >
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Train Model</div>
            <div className="text-[10px] text-slate-500">Train 1D CNN</div>
          </div>
        </button>

        {/* Download Results */}
        <button
          onClick={onDownload}
          disabled={!hasResults}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-all font-medium text-left disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm col-span-2 sm:col-span-1"
        >
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Export Data</div>
            <div className="text-[10px] text-slate-500">JSON metrics report</div>
          </div>
        </button>
      </div>
    </div>
  );
}
