"""FastAPI router for Performance Analysis (SNR and Speed sweeps)."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.simulation import run_snr_performance_sweep, run_speed_performance_sweep
from app.core.cnn_model import is_model_available, load_trained_model

router = APIRouter(prefix="/performance", tags=["Performance"])


class SnrSweepRequest(BaseModel):
    snr_list: List[float] = Field(default=[0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0])
    speed: float = Field(default=300.0)
    carrier_frequency: float = Field(default=2.6e9)
    modulation: str = Field(default="QPSK")
    pilot_mode: str = Field(default="SCATTERED")
    pilot_spacing: int = Field(default=4)
    runs_per_snr: int = Field(default=2)


class SpeedSweepRequest(BaseModel):
    speeds: List[float] = Field(default=[50.0, 100.0, 200.0, 300.0, 500.0])
    snr: float = Field(default=15.0)
    carrier_frequency: float = Field(default=2.6e9)
    modulation: str = Field(default="QPSK")
    pilot_mode: str = Field(default="SCATTERED")
    pilot_spacing: int = Field(default=4)


@router.post("/snr")
async def perform_snr_sweep(req: SnrSweepRequest) -> Dict[str, Any]:
    try:
        active_model = load_trained_model() if is_model_available() else None
        
        results = run_snr_performance_sweep(
            snr_list=sorted(req.snr_list),
            speed_kmh=req.speed,
            carrier_freq_hz=req.carrier_frequency,
            modulation=req.modulation,
            pilot_mode=req.pilot_mode,
            pilot_spacing=req.pilot_spacing,
            num_runs_per_snr=req.runs_per_snr,
            cnn_model=active_model
        )
        
        return {
            "success": True,
            "parameters": {
                "speed_kmh": req.speed,
                "modulation": req.modulation,
                "runs_per_point": req.runs_per_snr
            },
            "data": {
                "snr_db": results["snr_db"],
                "ber_ls": results["ber_ls"],
                "ber_cnn": results["ber_cnn"],
                "nmse_ls_db": results["nmse_ls_db"],
                "nmse_cnn_db": results["nmse_cnn_db"],
                "nmse_ls_linear": results["nmse_ls"],
                "nmse_cnn_linear": results["nmse_cnn"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SNR sweep failed: {str(e)}")


@router.post("/speed")
async def perform_speed_sweep(req: SpeedSweepRequest) -> Dict[str, Any]:
    try:
        active_model = load_trained_model() if is_model_available() else None
        
        results = run_speed_performance_sweep(
            speeds_kmh=sorted(req.speeds),
            snr_db=req.snr,
            carrier_freq_hz=req.carrier_frequency,
            modulation=req.modulation,
            pilot_mode=req.pilot_mode,
            pilot_spacing=req.pilot_spacing,
            cnn_model=active_model
        )
        
        return {
            "success": True,
            "parameters": {
                "snr_db": req.snr,
                "carrier_frequency_ghz": round(req.carrier_frequency / 1e9, 2),
                "modulation": req.modulation
            },
            "data": {
                "speed_kmh": results["speed_kmh"],
                "doppler_hz": results["doppler_hz"],
                "ber_ls": results["ber_ls"],
                "ber_cnn": results["ber_cnn"],
                "nmse_ls": results["nmse_ls"],
                "nmse_cnn": results["nmse_cnn"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speed sweep failed: {str(e)}")
