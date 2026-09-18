/**
 * AI-RailLink Backend API Gateway
 * Proxies requests between React frontend and Python FastAPI ML service.
 */

const path = require('path');
// Load environment variables from backend directory or project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const simulationRoutes = require('./routes/simulation.routes');
const trainingRoutes = require('./routes/training.routes');
const performanceRoutes = require('./routes/performance.routes');
const modelRoutes = require('./routes/model.routes');
const aiRoutes = require('./routes/ai.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production (Vercel) and development
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI-RailLink Node.js API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/simulation', simulationRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/model', modelRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚆 AI-RailLink API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Connected to ML Service at ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
});
