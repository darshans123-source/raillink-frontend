import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export default function ComparisonTable({ results }) {
  if (!results) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
        <p className="text-sm text-slate-400">
          No simulation executed yet. Run a simulation to view the comparison table.
        </p>
      </div>
    );
  }

  const { ls, cnn, comparison } = results;

  const rows = [
    {
      metric: 'Bit Error Rate (BER)',
      lsVal: ls?.ber !== undefined ? ls.ber.toFixed(5) : '--',
      cnnVal: cnn?.ber !== undefined ? cnn.ber.toFixed(5) : '--',
      diff: comparison?.ber_reduction,
      isBetter: comparison?.ber_reduction > 0,
      formatDiff: (d) => `${Math.abs(d).toFixed(5)} reduction`,
    },
    {
      metric: 'Bit Errors Count',
      lsVal: ls?.bit_errors !== undefined ? `${ls.bit_errors} / ${ls.total_bits}` : '--',
      cnnVal: cnn?.bit_errors !== undefined ? `${cnn.bit_errors} / ${cnn.total_bits}` : '--',
      diff: ls && cnn ? ls.bit_errors - cnn.bit_errors : null,
      isBetter: ls && cnn ? ls.bit_errors > cnn.bit_errors : false,
      formatDiff: (d) => `${Math.abs(d)} fewer errors`,
    },
    {
      metric: 'NMSE (Linear)',
      lsVal: ls?.nmse !== undefined ? ls.nmse.toFixed(6) : '--',
      cnnVal: cnn?.nmse !== undefined ? cnn.nmse.toFixed(6) : '--',
      diff: comparison?.nmse_reduction_linear,
      isBetter: comparison?.nmse_reduction_linear > 0,
      formatDiff: (d) => `${Math.abs(d).toFixed(6)} reduction`,
    },
    {
      metric: 'NMSE (dB)',
      lsVal: ls?.nmse_db !== undefined ? `${ls.nmse_db.toFixed(2)} dB` : '--',
      cnnVal: cnn?.nmse_db !== undefined ? `${cnn.nmse_db.toFixed(2)} dB` : '--',
      diff: comparison?.nmse_reduction_db,
      isBetter: comparison?.nmse_reduction_db > 0,
      formatDiff: (d) => `${Math.abs(d).toFixed(2)} dB improvement`,
    },
    {
      metric: 'Computation Latency',
      lsVal: ls?.latency_ms !== undefined ? `${ls.latency_ms.toFixed(2)} ms` : '--',
      cnnVal: cnn?.latency_ms !== undefined ? `${cnn.latency_ms.toFixed(2)} ms` : '--',
      diff: null, // Latency is not claimed as an AI improvement
      isBetter: null,
      customNote: 'CPU execution time',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            LS vs 1D CNN Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated directly on the current physical layer OFDM transmission
          </p>
        </div>
        {comparison?.cnn_better_nmse && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
            1D CNN Outperforms LS
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-5">Metric</th>
              <th className="py-3 px-5 text-rose-700">Traditional LS</th>
              <th className="py-3 px-5 text-emerald-800">AI 1D CNN</th>
              <th className="py-3 px-5">Analytical Comparison</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  {row.metric}
                </td>
                <td className="py-3.5 px-5 text-slate-700 font-mono">
                  {row.lsVal}
                </td>
                <td className="py-3.5 px-5 font-bold text-emerald-800 font-mono">
                  {row.cnnVal}
                </td>
                <td className="py-3.5 px-5">
                  {row.isBetter !== null && row.diff !== null && row.diff !== 0 ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        row.isBetter
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {row.isBetter ? (
                        <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUp className="w-3 h-3" />
                      )}
                      {row.formatDiff(row.diff)}
                    </span>
                  ) : row.customNote ? (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {row.customNote}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Minus className="w-3 h-3" /> Identical
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
