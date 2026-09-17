import React, { useState } from 'react';
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

export default function ChannelResponsePlot({ data }) {
  const [viewMode, setViewMode] = useState('magnitude'); // 'magnitude' or 'phase'

  if (!data || !data.subcarriers) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
        <p className="text-sm text-slate-400">
          No channel response data available. Run simulation to visualize.
        </p>
      </div>
    );
  }

  // Transform into array of objects for Recharts
  const chartData = data.subcarriers.map((sub, idx) => {
    return {
      subcarrier: sub,
      trueChannel:
        viewMode === 'magnitude'
          ? Number(data.true_magnitude[idx].toFixed(4))
          : Number(data.true_phase[idx].toFixed(3)),
      lsEstimate:
        viewMode === 'magnitude'
          ? Number(data.ls_magnitude[idx].toFixed(4))
          : Number(data.ls_phase[idx].toFixed(3)),
      cnnEstimate:
        viewMode === 'magnitude'
          ? Number(data.cnn_magnitude[idx].toFixed(4))
          : Number(data.cnn_phase[idx].toFixed(3)),
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Channel Frequency Response (CFR)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            True Channel vs. Traditional LS vs. AI 1D CNN across 64 OFDM Subcarriers
          </p>
        </div>

        {/* Magnitude vs Phase Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('magnitude')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'magnitude'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Magnitude |H(k)|
          </button>
          <button
            onClick={() => setViewMode('phase')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'phase'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unwrapped Phase (rad)
          </button>
        </div>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="subcarrier"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              label={{ value: 'Subcarrier Index (k)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              label={{
                value: viewMode === 'magnitude' ? '|H(k)|' : 'Phase (rad)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fontSize: 11,
                fill: '#64748b'
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Line
              type="monotone"
              dataKey="trueChannel"
              name="Ground Truth H(k)"
              stroke="#1d3557"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lsEstimate"
              name="Traditional LS"
              stroke="#e63946"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: '#e63946' }}
            />
            <Line
              type="monotone"
              dataKey="cnnEstimate"
              name="AI 1D CNN"
              stroke="#2d6a4f"
              strokeWidth={2.2}
              dot={{ r: 2, fill: '#2d6a4f' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
