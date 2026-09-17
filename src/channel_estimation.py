"""Least Squares (LS) Channel Estimation with linear and cubic interpolation.

Estimates channel frequency response at pilot positions:
    H_LS[p] = Y[p] / X[p]

Then interpolates across data subcarriers for scattered pilot configurations.
"""

from typing import Tuple, Optional
import numpy as np
from scipy.interpolate import interp1d, CubicSpline
from src.ofdm import OFDMConfig


def estimate_ls_symbol(Y_sym: np.ndarray,
                       pilot_indices: np.ndarray,
                       pilot_value: complex,
                       num_subcarriers: int = 64,
                       interp_method: str = "linear") -> np.ndarray:
    """Estimates the channel frequency response for a single OFDM symbol using Least Squares.
    
    Args:
        Y_sym: 1D complex array of length N (received frequency-domain subcarriers).
        pilot_indices: 1D integer array of pilot subcarrier indices.
        pilot_value: Known complex value transmitted at pilot subcarriers.
        num_subcarriers: Total subcarriers N (default 64).
        interp_method: 'linear' or 'cubic'.
        
    Returns:
        1D complex array of length N containing the estimated CFR.
    """
    N = num_subcarriers
    # 1. LS estimation at pilot positions
    # H_LS[p] = Y[p] / X_pilot[p]
    Y_pilots = Y_sym[pilot_indices]
    H_pilots = Y_pilots / pilot_value
    
    # If full pilot mode, we already have all subcarriers
    if len(pilot_indices) >= N:
        return H_pilots
        
    all_indices = np.arange(N)
    
    # 2. Interpolate real and imaginary parts separately
    real_pilots = np.real(H_pilots)
    imag_pilots = np.imag(H_pilots)
    
    if interp_method.lower() == "cubic" and len(pilot_indices) >= 4:
        try:
            cs_real = CubicSpline(pilot_indices, real_pilots, bc_type='natural')
            cs_imag = CubicSpline(pilot_indices, imag_pilots, bc_type='natural')
            H_interp_real = cs_real(all_indices)
            H_interp_imag = cs_imag(all_indices)
        except Exception:
            # Fallback to linear if cubic spline encounters singular matrices
            H_interp_real = np.interp(all_indices, pilot_indices, real_pilots)
            H_interp_imag = np.interp(all_indices, pilot_indices, imag_pilots)
    else:
        # Linear interpolation with constant edge extrapolation
        H_interp_real = np.interp(all_indices, pilot_indices, real_pilots)
        H_interp_imag = np.interp(all_indices, pilot_indices, imag_pilots)
        
    H_est = H_interp_real + 1j * H_interp_imag
    
    # Clean any accidental NaNs or Infs
    H_est = np.nan_to_num(H_est, nan=1e-6, posinf=1.0, neginf=-1.0)
    return H_est


def estimate_ls_frame(Y_grid: np.ndarray,
                      config: OFDMConfig,
                      interp_method: str = "linear") -> np.ndarray:
    """Estimates the channel frequency response across all symbols in an OFDM frame using LS.
    
    Args:
        Y_grid: 2D complex array of shape (num_symbols, N) from the OFDM receiver.
        config: OFDMConfig instance containing pilot indices and pilot value.
        interp_method: 'linear' or 'cubic'.
        
    Returns:
        2D complex array of shape (num_symbols, N) representing estimated CFR grid.
    """
    num_symbols, N = Y_grid.shape
    H_ls_grid = np.zeros((num_symbols, N), dtype=np.complex128)
    
    for m in range(num_symbols):
        H_ls_grid[m, :] = estimate_ls_symbol(
            Y_sym=Y_grid[m, :],
            pilot_indices=config.pilot_indices,
            pilot_value=config.pilot_value,
            num_subcarriers=N,
            interp_method=interp_method
        )
        
    return H_ls_grid
