"""FastAPI router for Dataset Generation and 1D CNN Model Training."""

from typing import Dict, Any, List, Optional
import os
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.dataset import generate_channel_dataset, save_dataset, load_dataset
from app.core.cnn_model import (
    build_1d_cnn_model, train_cnn_model, save_trained_model,
    load_trained_model, is_model_available, DEFAULT_MODEL_PATH
)

router = APIRouter(prefix="/training", tags=["Training"])


class DatasetRequest(BaseModel):
    num_samples: int = Field(default=500, description="Total channel samples to generate")
    snr_min: float = Field(default=0.0)
    snr_max: float = Field(default=30.0)
    speed_min: float = Field(default=50.0)
    speed_max: float = Field(default=500.0)
    pilot_mode: str = Field(default="SCATTERED")
    pilot_spacing: int = Field(default=4)
    seed: int = Field(default=42)


class TrainRequest(BaseModel):
    epochs: int = Field(default=15, description="Number of training epochs")
    batch_size: int = Field(default=32, description="Batch size for training")
    learning_rate: float = Field(default=0.001)


@router.post("/dataset")
async def create_dataset(req: DatasetRequest) -> Dict[str, Any]:
    try:
        t0 = time.perf_counter()
        X_tr, Y_tr, X_v, Y_v, X_te, Y_te = generate_channel_dataset(
            num_samples=req.num_samples,
            snr_range_db=(req.snr_min, req.snr_max),
            speed_range_kmh=(req.speed_min, req.speed_max),
            pilot_mode=req.pilot_mode,
            pilot_spacing=req.pilot_spacing,
            seed=req.seed
        )
        saved_path = save_dataset(X_tr, Y_tr, X_v, Y_v, X_te, Y_te)
        elapsed = time.perf_counter() - t0
        
        return {
            "success": True,
            "message": f"Generated {len(X_tr) + len(X_v) + len(X_te)} samples successfully.",
            "dataset_info": {
                "total_samples": int(len(X_tr) + len(X_v) + len(X_te)),
                "train_samples": int(len(X_tr)),
                "val_samples": int(len(X_v)),
                "test_samples": int(len(X_te)),
                "input_shape": list(X_tr.shape[1:]),
                "output_shape": list(Y_tr.shape[1:]),
                "file_path": saved_path,
                "generation_time_s": round(elapsed, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset generation failed: {str(e)}")


@router.post("/train")
async def train_model_endpoint(req: TrainRequest) -> Dict[str, Any]:
    try:
        loaded = load_dataset()
        if loaded is None:
            # Generate automatically if not present
            X_tr, Y_tr, X_v, Y_v, X_te, Y_te = generate_channel_dataset(num_samples=500)
            save_dataset(X_tr, Y_tr, X_v, Y_v, X_te, Y_te)
        else:
            X_tr, Y_tr, X_v, Y_v, X_te, Y_te = loaded
            
        t0 = time.perf_counter()
        model = build_1d_cnn_model(input_shape=(64, 2))
        
        history = train_cnn_model(
            model, X_tr, Y_tr, X_v, Y_v,
            epochs=req.epochs,
            batch_size=req.batch_size
        )
        
        saved_path = save_trained_model(model, DEFAULT_MODEL_PATH)
        elapsed = time.perf_counter() - t0
        
        # Test evaluation
        test_loss, test_mae, test_mse = model.evaluate(X_te, Y_te, verbose=0)
        file_size_kb = os.path.getsize(saved_path) / 1024
        
        # Format history metrics
        epochs_list = list(range(1, req.epochs + 1))
        train_loss = [float(val) for val in history.history.get("loss", [])]
        val_loss = [float(val) for val in history.history.get("val_loss", [])]
        train_mae = [float(val) for val in history.history.get("mae", [])]
        val_mae = [float(val) for val in history.history.get("val_mae", [])]
        
        return {
            "success": True,
            "message": "1D CNN Model successfully trained and saved.",
            "metrics": {
                "test_mse": round(float(test_mse), 6),
                "test_mae": round(float(test_mae), 6),
                "training_time_s": round(elapsed, 2),
                "model_size_kb": round(file_size_kb, 1),
                "model_path": saved_path,
                "epochs_trained": req.epochs
            },
            "history": {
                "epochs": epochs_list,
                "train_loss": train_loss,
                "val_loss": val_loss,
                "train_mae": train_mae,
                "val_mae": val_mae
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")


@router.post("/evaluate")
async def evaluate_current_model() -> Dict[str, Any]:
    if not is_model_available():
        raise HTTPException(status_code=404, detail="No trained model found. Please train first.")
        
    loaded = load_dataset()
    if loaded is None:
        raise HTTPException(status_code=404, detail="No dataset found to evaluate model against.")
        
    _, _, _, _, X_te, Y_te = loaded
    model = load_trained_model()
    test_loss, test_mae, test_mse = model.evaluate(X_te, Y_te, verbose=0)
    
    return {
        "success": True,
        "test_mse": round(float(test_mse), 6),
        "test_mae": round(float(test_mae), 6),
        "test_samples": int(len(X_te))
    }
