import React, { useState } from 'react';

export default function ConstellationPlot({ data }) {
  const [activeTab, setActiveTab] = useState('compare'); // 'compare', 'tx', 'rx', 'ls', 'cnn'

  if (!data || !data.tx_real || data.tx_real.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
        <p className="text-sm text-slate-400">
          No constellation data available. Run simulation to observe constellation diagrams.
        </p>
      </div>
    );
  }

  const { tx_real, tx_imag, rx_real, rx_imag, eq_ls_real, eq_ls_imag, eq_cnn_real, eq_cnn_imag } = data;

  const panels = [
    { id: 'tx', title: 'Transmitted (Ideal)', color: '#1d3557', real: tx_real, imag: tx_imag },
    { id: 'rx', title: 'Received (Distorted + Noise)', color: '#e76f51', real: rx_real, imag: rx_imag },
    { id: 'ls', title: 'Equalized (LS)', color: '#e63946', real: eq_ls_real, imag: eq_ls_imag },
    { id: 'cnn', title: 'Equalized (1D CNN)', color: '#2d6a4f', real: eq_cnn_real, imag: eq_cnn_imag },
  ];

  // Helper to render an SVG constellation quadrant
  const renderScatter = (panel, width = 200, height = 200) => {
    const scale = 40; // pixels per unit
    const cx = width / 2;
    const cy = height / 2;

    return (
      <div className="flex flex-col items-center bg-slate-50/70 border border-slate-200 rounded-xl p-3">
        <span className="text-[11px] font-bold text-slate-700 mb-2">{panel.title}</span>
        <svg width={width} height={height} className="bg-white rounded-lg border border-slate-200 shadow-2xs">
          {/* Axis lines */}
          <line x1={0} y1={cy} x2={width} y2={cy} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={cx} y1={0} x2={cx} y2={height} stroke="#e2e8f0" strokeWidth="1" />
          {/* Grid circles */}
          <circle cx={cx} cy={cy} r={scale} fill="none" stroke="#f1f5f9" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={scale * 1.5} fill="none" stroke="#f1f5f9" strokeDasharray="3 3" />

          {/* Points */}
          {panel.real.map((r, i) => {
            const x = cx + r * scale;
            const y = cy - panel.imag[i] * scale;
            return (
              <circle
                key={i}
                cx={Math.max(4, Math.min(width - 4, x))}
                cy={Math.max(4, Math.min(height - 4, y))}
                r="3"
                fill={panel.color}
                opacity="0.75"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Constellation Diagram Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase and amplitude scatter representation before and after equalization
          </p>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
          In-Phase (I) vs Quadrature (Q)
        </span>
      </div>

      {/* Grid of 4 diagrams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {panels.map((p) => (
          <div key={p.id} className="w-full">
            {renderScatter(p)}
          </div>
        ))}
      </div>
    </div>
  );
}
