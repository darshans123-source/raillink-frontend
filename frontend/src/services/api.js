/**
 * API Service Client for AI-RailLink
 * Communicates directly with Node.js Express API Gateway.
 */

import axios from 'axios';

// Normalize VITE_API_URL so it works with or without trailing /api or slash
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for long sweeps or training
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health & Status
  async getHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  async getModelStatus() {
    const response = await apiClient.get('/model/status');
    return response.data;
  },

  // Physical Layer Simulation
  async runSimulation(params = {}) {
    const response = await apiClient.post('/simulation/run', params);
    return response.data;
  },

  // 1D CNN AI Training
  async generateDataset(params = {}) {
    const response = await apiClient.post('/training/dataset', params);
    return response.data;
  },

  async trainModel(params = {}) {
    const response = await apiClient.post('/training/train', params);
    return response.data;
  },

  async evaluateModel() {
    const response = await apiClient.post('/training/evaluate');
    return response.data;
  },

  // Performance Analysis Sweeps
  async runSnrAnalysis(params = {}) {
    const response = await apiClient.post('/performance/snr', params);
    return response.data;
  },

  async runSpeedAnalysis(params = {}) {
    const response = await apiClient.post('/performance/speed', params);
    return response.data;
  },
};

export default api;
