import React, { useState, useEffect } from 'react';
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

import {
  BrainCircuit,
  Database,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';

export default function Training() {
  const [modelStatus, setModelStatus] = useState(null);
  const [datasetSize, setDatasetSize] = useState(500);
  const [epochs, setEpochs] = useState(15);
  const [batchSize, setBatchSize] = useState(32);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load model status
  const fetchStatus = async () => {
    try {
      const status = await api.getModelStatus();
      setModelStatus(status);
    } catch (err) {
      console.warn('Failed to fetch model status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 1. Generate Dataset Action
  const handleGenerateDataset = async () => {
    setIsLoading(true);
    setLoadingMessage(`Generating ${datasetSize} synthetic HSR channel realizations across train speeds and SNRs...`);
    setErrorMessage(null);

    try {
      const res = await api.generateDataset({
        numSamples: datasetSize,
        snrMin: 0.0,
        snrMax: 30.0,
        speedMin: 50.0,
        speedMax: 500.0,
      });
      setDatasetInfo(res.dataset_info);
    } catch (err) {
      console.error('Dataset generation failed:', err);
      setErrorMessage(err.response?.data?.error || 'Dataset generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Train Model Action
  const handleTrainModel = async () => {
    setIsLoading(true);
    setLoadingMessage(`Compiling 1D CNN and training for ${epochs} epochs on CPU...`);
    setErrorMessage(null);

    try {
      const res = await api.trainModel({
        epochs: Number(epochs),
        batchSize: Number(batchSize),
      });
      setTrainingResult(res);
      await fetchStatus();
    } catch (err) {
      console.error('Model training failed:', err);
      setErrorMessage(err.response?.data?.error || 'Model training failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Evaluate Model Action
  const handleEvaluate = async () => {
    setIsLoading(true);
    setLoadingMessage('Evaluating 1D CNN model against the held-out test split...');
    setErrorMessage(null);

    try {
      const res = await api.evaluateModel();
      setEvaluationResult(res);
    } catch (err) {
      console.error('Evaluation failed:', err);
      setErrorMessage(err.response?.data?.error || 'Model evaluation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format training history for Recharts
  const lossHistoryData = trainingResult?.history?.epochs?.map((ep, idx) => ({
    epoch: ep,
    trainLoss: Number(trainingResult.history.train_loss[idx].toFixed(5)),
    valLoss: Number(trainingResult.history.val_loss[idx].toFixed(5)),
  })) || [];

  const isTrained = modelStatus?.status === 'TRAINED';

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            1D CNN Model Training &amp; Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate synthetic high-speed railway channel datasets and train a regression 1D CNN for subcarrier denoising.
          </p>
        </div>

        {/* Model Status Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
            isTrained
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {isTrained ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Model Status: TRAINED ({modelStatus?.model_size_kb} KB)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Model Status: NOT TRAINED YET</span>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Two Column Layout: Dataset Gen vs Training Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Synthetic Dataset Generator */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Synthetic HSR Dataset Generation
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Generates paired [Re(H_LS), Im(H_LS)] &rarr; [Re(H_true), Im(H_true)] channel slices under randomized speeds (50-500 km/h) and SNRs (0-30 dB).
          </p>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Total Dataset Samples</span>
              <span className="text-emerald-700 font-bold">{datasetSize} samples</span>
            </div>
            <select
              value={datasetSize}
              onChange={(e) => setDatasetSize(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 font-medium"
            >
              <option value="300">300 Samples (Fastest ~5s)</option>
              <option value="500">500 Samples (Balanced ~10s)</option>
              <option value="1000">1000 Samples (High Accuracy ~20s)</option>
              <option value="2000">2000 Samples (Deep Learning Baseline)</option>
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700">Dataset Split (Paper Compliant):</div>
            <div className="flex justify-between text-[11px]">
              <span>70% Training:</span>
              <span className="font-mono font-semibold">{Math.round(datasetSize * 0.7)} samples</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>15% Validation:</span>
              <span className="font-mono font-semibold">{Math.round(datasetSize * 0.15)} samples</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>15% Testing:</span>
              <span className="font-mono font-semibold">{Math.round(datasetSize * 0.15)} samples</span>
            </div>
          </div>

          <button
            onClick={handleGenerateDataset}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>GENERATE DATASET</span>
          </button>

          {datasetInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dataset Ready</span>
              </div>
              <div className="text-[11px]">
                Created {datasetInfo.total_samples} samples in {datasetInfo.generation_time_s}s.
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Model Training Control */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BrainCircuit className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. 1D CNN Architecture &amp; Training
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Epochs
              </label>
              <select
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800"
              >
                <option value="5">5 Epochs (Quick Test)</option>
                <option value="10">10 Epochs</option>
                <option value="15">15 Epochs (Recommended)</option>
                <option value="25">25 Epochs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Size
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800"
              >
                <option value="16">16</option>
                <option value="32">32 (Default)</option>
                <option value="64">64</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono space-y-1">
            <div className="font-sans font-bold text-slate-700 text-xs">Lightweight 1D CNN Topology:</div>
            <div>• Input Layer: (None, 64, 2)</div>
            <div>• Conv1D(32, kernel=5, ReLU) + MaxPool(2)</div>
            <div>• Conv1D(64, kernel=3, ReLU) + Flatten(2048)</div>
            <div>• Dense(128, ReLU) + Dense(128, Linear)</div>
            <div>• Reshape -&gt; Output (None, 64, 2)</div>
            <div>• Loss: MSE | Optimizer: Adam (lr=0.001)</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTrainModel}
              disabled={isLoading}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>TRAIN 1D CNN</span>
            </button>

            <button
              onClick={handleEvaluate}
              disabled={isLoading || !isTrained}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>EVALUATE MODEL</span>
            </button>
          </div>

          {evaluationResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex justify-between items-center">
              <span className="font-semibold">Test Evaluation:</span>
              <span className="font-mono">
                MSE: <strong>{evaluationResult.test_mse}</strong> | MAE: <strong>{evaluationResult.test_mae}</strong> ({evaluationResult.test_samples} samples)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Training Convergence Loss Chart */}
      {trainingResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1D CNN Training Convergence (Loss vs Epoch)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Training Loss (MSE) and Validation Loss across {trainingResult.metrics?.epochs_trained} epochs
              </p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-slate-600">
                Test MSE: <strong className="text-emerald-800">{trainingResult.metrics?.test_mse}</strong>
              </span>
              <span className="text-slate-600">
                Time: <strong>{trainingResult.metrics?.training_time_s}s</strong>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossHistoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} label={{ value: 'Loss (MSE)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="trainLoss" name="Training Loss (MSE)" stroke="#2d6a4f" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="valLoss" name="Validation Loss (MSE)" stroke="#e63946" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
