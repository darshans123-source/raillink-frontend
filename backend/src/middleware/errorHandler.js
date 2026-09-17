/**
 * Global API Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (err.response) {
    // Response received from Python FastAPI with error code
    return res.status(err.response.status).json({
      success: false,
      error: err.response.data?.detail || 'ML Service error',
      source: 'python-ml-service',
    });
  } else if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Python ML service is unavailable. Please ensure the Python service is running on port 8000.',
      source: 'api-gateway',
    });
  } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    return res.status(504).json({
      success: false,
      error: 'Python ML service request timed out.',
      source: 'api-gateway',
    });
  }

  return res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    source: 'api-gateway',
  });
}

module.exports = errorHandler;
