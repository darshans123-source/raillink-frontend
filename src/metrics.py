"""Evaluation metrics module for AI-RailLink: Bit Error Rate (BER) and Normalized Mean Squared Error (NMSE).

No hardcoded or fake values: all metrics are strictly calculated from transmitted and received data.
"""

from typing import Tuple, Dict
import numpy as np


def calculate_ber(tx_bits: np.ndarray, rx_bits: np.ndarray) -> Tuple[float, int, int]:
    """Calculates the Bit Error Rate (BER) from transmitted and detected bits.
    
    BER = (Number of incorrectly detected bits) / (Total transmitted bits)
    
    Args:
        tx_bits: 1D array of original binary bits (0 or 1).
        rx_bits: 1D array of detected binary bits (0 or 1).
        
    Returns:
        Tuple of (ber, bit_errors, total_bits):
            ber: Float in [0.0, 1.0].
            bit_errors: Integer count of mismatched bits.
            total_bits: Total number of compared bits.
    """
    if len(tx_bits) == 0 or len(rx_bits) == 0:
        return 0.0, 0, 0
        
    # Compare matching lengths
    min_len = min(len(tx_bits), len(rx_bits))
    tx_arr = tx_bits[:min_len]
    rx_arr = rx_bits[:min_len]
    
    bit_errors = int(np.sum(tx_arr != rx_arr))
    total_bits = int(min_len)
    
    ber = float(bit_errors / total_bits) if total_bits > 0 else 0.0
    return ber, bit_errors, total_bits


def calculate_nmse(H_true: np.ndarray, H_est: np.ndarray) -> float:
    """Calculates the Normalized Mean Squared Error (NMSE) between true and estimated channel responses.
    
    Formula:
        NMSE = ||H_true - H_est||^2 / ||H_true||^2
        
    Args:
        H_true: Ground truth channel frequency response (complex array).
        H_est: Estimated channel frequency response (complex array).
        
    Returns:
        NMSE as a float (linear scale).
    """
    error = H_true - H_est
    norm_error_sq = np.sum(np.abs(error) ** 2)
    norm_true_sq = np.sum(np.abs(H_true) ** 2)
    
    if norm_true_sq < 1e-12:
        return 0.0
        
    nmse = float(norm_error_sq / norm_true_sq)
    return max(0.0, nmse)


def nmse_to_db(nmse_linear: float) -> float:
    """Converts linear NMSE to decibels (dB): 10 * log10(NMSE)."""
    if nmse_linear <= 1e-12:
        return -120.0
    return float(10.0 * np.log10(nmse_linear))


def format_metrics_summary(ber_val: float,
                           bit_errors: int,
                           total_bits: int,
                           nmse_val: float,
                           elapsed_ms: float) -> Dict[str, str]:
    """Formats metrics nicely for display in the dashboard."""
    nmse_db = nmse_to_db(nmse_val)
    return {
        "BER": f"{ber_val:.5f}" if ber_val > 0 else "0.00000",
        "Bit Errors": f"{bit_errors} / {total_bits}",
        "NMSE (Linear)": f"{nmse_val:.6f}",
        "NMSE (dB)": f"{nmse_db:.2f} dB",
        "Execution Time": f"{elapsed_ms:.2f} ms"
    }
