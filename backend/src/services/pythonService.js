/**
 * Service to communicate with Python FastAPI ML and Signal Processing Service.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 180000, // 3 minutes timeout for training or sweeps
  headers: {
    'Content-Type': 'application/json',
  },
});

const pythonService = {
  async checkHealth() {
    const response = await client.get('/health');
    return response.data;
  },

  async getModelStatus() {
    const response = await client.get('/model/status');
    return response.data;
  },

  async runSimulation(payload) {
    const response = await client.post('/simulation/run', payload);
    return response.data;
  },

  async generateDataset(payload) {
    const response = await client.post('/training/dataset', payload);
    return response.data;
  },

  async trainModel(payload) {
    const response = await client.post('/training/train', payload);
    return response.data;
  },

  async evaluateModel() {
    const response = await client.post('/training/evaluate');
    return response.data;
  },

  async runSnrSweep(payload) {
    const response = await client.post('/performance/snr', payload);
    return response.data;
  },

  async runSpeedSweep(payload) {
    const response = await client.post('/performance/speed', payload);
    return response.data;
  },
};

module.exports = pythonService;
