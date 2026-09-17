"""FastAPI router for OFDM Physical Layer Simulation."""

from typing import Optional, Dict, Any, List
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.simulation import run_single_simulation
from app.core.doppler import calculate_max_doppler, get_doppler_table
from app.core.cnn_model import is_model_available, load_trained_model

router = APIRouter(prefix="/simulation", tags=["Simulation"])


class SimulationRequest(BaseModel):
    speed: float = Field(default=300.0, description="Train speed in km/h")
    snr: float = Field(default=15.0, description="Operating SNR in dB")
    carrier_frequency: float = Field(default=2.6e9, description="Carrier frequency in Hz")
    modulation: str = Field(default="QPSK", description="Modulation scheme: BPSK, QPSK, 16-QAM")
    pilot_mode: str = Field(default="SCATTERED", description="Pilot mode: FULL or SCATTERED")
    pilot_spacing: int = Field(default=4, description="Pilot spacing Zpilot")
    estimator: str = Field(default="compare", description="Estimator to run: ls, cnn, or compare")
    equalizer: str = Field(default="ZF", description="Equalization method: ZF or MMSE")
    num_symbols: int = Field(default=14, description="Number of OFDM symbols per frame")
    seed: Optional[int] = Field(default=42, description="Random seed for reproducibility")


@router.post("/run")
async def run_simulation(req: SimulationRequest) -> Dict[str, Any]:
    try:
        # Load trained CNN model if available
        active_model = load_trained_model() if is_model_available() else None
        
        sim_res = run_single_simulation(
            speed_kmh=req.speed,
            carrier_freq_hz=req.carrier_frequency,
            snr_db=req.snr,
            modulation=req.modulation,
            pilot_mode=req.pilot_mode,
            pilot_spacing=req.pilot_spacing,
            num_symbols=req.num_symbols,
            equalizer_method=req.equalizer,
            cnn_model=active_model,
            seed=req.seed
        )
        
        # Determine actual estimator status string
        if req.estimator.lower() == "ls":
            estimator_status = "LS"
        elif sim_res["cnn_used_fallback"]:
            estimator_status = "LS FALLBACK"
        else:
            estimator_status = "1D CNN"
            
        # Format Channel Frequency Response data for symbol 0
        true_cfr_sym = sim_res["true_cfr"][0]
        ls_cfr_sym = sim_res["H_ls_grid"][0]
        cnn_cfr_sym = sim_res["H_cnn_grid"][0]
        
        cfr_plot = {
            "subcarriers": list(range(64)),
            "true_magnitude": [float(val) for val in np.abs(true_cfr_sym)],
            "true_phase": [float(val) for val in np.unwrap(np.angle(true_cfr_sym))],
            "ls_magnitude": [float(val) for val in np.abs(ls_cfr_sym)],
            "ls_phase": [float(val) for val in np.unwrap(np.angle(ls_cfr_sym))],
            "cnn_magnitude": [float(val) for val in np.abs(cnn_cfr_sym)],
            "cnn_phase": [float(val) for val in np.unwrap(np.angle(cnn_cfr_sym))],
        }
        
        # Subsample constellation points for fast JSON transfer (max 300 points)
        n_syms = len(sim_res["tx_data_symbols"])
        n_pts = min(n_syms, 300)
        indices = np.random.choice(n_syms, n_pts, replace=False) if n_syms > 0 else []
        
        constellation_plot = {
            "tx_real": [float(np.real(sim_res["tx_data_symbols"][i])) for i in indices],
            "tx_imag": [float(np.imag(sim_res["tx_data_symbols"][i])) for i in indices],
            "rx_real": [float(np.real(sim_res["rx_data_symbols"][i])) for i in indices],
            "rx_imag": [float(np.imag(sim_res["rx_data_symbols"][i])) for i in indices],
            "eq_ls_real": [float(np.real(sim_res["eq_syms_ls"][i])) for i in indices],
            "eq_ls_imag": [float(np.imag(sim_res["eq_syms_ls"][i])) for i in indices],
            "eq_cnn_real": [float(np.real(sim_res["eq_syms_cnn"][i])) for i in indices],
            "eq_cnn_imag": [float(np.imag(sim_res["eq_syms_cnn"][i])) for i in indices],
        }
        
        # Calculate real mathematical difference/improvement
        nmse_diff = float(sim_res["nmse_ls"] - sim_res["nmse_cnn"])
        ber_diff = float(sim_res["ber_ls"] - sim_res["ber_cnn"])
        
        return {
            "success": True,
            "parameters": {
                "speed_kmh": sim_res["speed_kmh"],
                "speed_mps": round(sim_res["speed_kmh"] / 3.6, 2),
                "carrier_frequency_hz": sim_res["carrier_freq_hz"],
                "carrier_frequency_ghz": round(sim_res["carrier_freq_hz"] / 1e9, 2),
                "doppler_hz": round(sim_res["doppler_hz"], 2),
                "snr_db": sim_res["snr_db"],
                "modulation": sim_res["modulation"],
                "pilot_mode": sim_res["pilot_mode"],
                "pilot_spacing": sim_res["pilot_spacing"],
                "pilot_metrics": sim_res["pilot_metrics"],
                "total_bits": sim_res["total_bits"]
            },
            "estimator_used": estimator_status,
            "results": {
                "ls": {
                    "ber": round(sim_res["ber_ls"], 6),
                    "bit_errors": sim_res["bit_errors_ls"],
                    "total_bits": sim_res["total_bits"],
                    "nmse": round(sim_res["nmse_ls"], 6),
                    "nmse_db": round(sim_res["nmse_ls_db"], 2),
                    "latency_ms": round(sim_res["ls_time_ms"], 2)
                },
                "cnn": {
                    "ber": round(sim_res["ber_cnn"], 6),
                    "bit_errors": sim_res["bit_errors_cnn"],
                    "total_bits": sim_res["total_bits"],
                    "nmse": round(sim_res["nmse_cnn"], 6),
                    "nmse_db": round(sim_res["nmse_cnn_db"], 2),
                    "latency_ms": round(sim_res["cnn_time_ms"], 2),
                    "used_fallback": sim_res["cnn_used_fallback"]
                },
                "comparison": {
                    "nmse_reduction_linear": round(nmse_diff, 6),
                    "nmse_reduction_db": round(sim_res["nmse_ls_db"] - sim_res["nmse_cnn_db"], 2),
                    "ber_reduction": round(ber_diff, 6),
                    "cnn_better_nmse": bool(sim_res["nmse_cnn"] < sim_res["nmse_ls"])
                }
            },
            "plots": {
                "channel_response": cfr_plot,
                "constellation": constellation_plot
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
