"""FastAPI Main Entry Point for AI-RailLink ML Service."""

import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.cnn_model import is_model_available, DEFAULT_MODEL_PATH
from app.routes.simulation import router as sim_router
from app.routes.training import router as train_router
from app.routes.performance import router as perf_router

app = FastAPI(
    title="AI-RailLink ML Service",
    description="Physical Layer OFDM Simulation and 1D CNN Channel Estimation Service",
    version="2.0.0"
)

# Enable CORS for Node.js API gateway and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-routers
app.include_router(sim_router)
app.include_router(train_router)
app.include_router(perf_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "AI-RailLink ML Service",
        "timestamp": time.time(),
        "model_loaded": is_model_available()
    }


@app.get("/model/status")
async def get_model_status():
    """Returns the current trained 1D CNN model status."""
    available = is_model_available()
    model_size_kb = 0.0
    if available and os.path.exists(DEFAULT_MODEL_PATH):
        model_size_kb = round(os.path.getsize(DEFAULT_MODEL_PATH) / 1024, 1)
        
    return {
        "model_name": "1D CNN Channel Estimator",
        "status": "TRAINED" if available else "NOT TRAINED",
        "is_available": available,
        "model_file": os.path.basename(DEFAULT_MODEL_PATH),
        "model_path": DEFAULT_MODEL_PATH,
        "model_size_kb": model_size_kb,
        "input_shape": [64, 2],
        "output_shape": [64, 2]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
