import React from 'react';
import { Loader2, Train } from 'lucide-react';

export default function LoadingOverlay({ isVisible, message = 'Processing...' }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl flex flex-col items-center text-center animate-in fade-in duration-200">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Train className="w-7 h-7 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-full text-white shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
          AI-RailLink Physical Layer
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          {message}
        </p>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
          <div className="bg-emerald-600 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
