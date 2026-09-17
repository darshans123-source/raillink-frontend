"""Synthetic Dataset Generator for 1D CNN Railway Channel Estimation.

Generates pairs of (X, Y):
    X: Noisy LS channel estimates [Real(H_LS), Imag(H_LS)] across 64 subcarriers.
    Y: True Channel Frequency Response [Real(H_true), Imag(H_true)] across 64 subcarriers.

Follows the 70% train / 15% validation / 15% test split as in the research paper.
Caches dataset to data/generated/ to avoid regenerating each run.
"""

from typing import Tuple, Dict, Optional, List
import os
import numpy as np
from src.ofdm import OFDMConfig, OFDMTransceiver
from src.channel import RailwayChannel
from src.channel_estimation import estimate_ls_frame


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "generated")


def generate_channel_dataset(
    num_samples: int = 1000,
    snr_range_db: Tuple[float, float] = (0.0, 30.0),
    speed_range_kmh: Tuple[float, float] = (50.0, 500.0),
    pilot_mode: str = "SCATTERED",
    pilot_spacing: int = 4,
    modulation: str = "QPSK",
    carrier_freq_hz: float = 2.6e9,
    seed: int = 42,
    progress_callback = None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Generates synthetic channel training data under high-speed railway conditions.
    
    Returns:
        (X_train, Y_train, X_val, Y_val, X_test, Y_test)
        Shapes:
            X: (N, 64, 2)
            Y: (N, 64, 2)
    """
    rng = np.random.default_rng(seed)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    config = OFDMConfig(
        num_subcarriers=64,
        num_symbols=14,
        cp_length=16,
        pilot_mode=pilot_mode,
        pilot_spacing=pilot_spacing,
        modulation=modulation
    )
    transceiver = OFDMTransceiver(config)
    
    # We will generate frames and extract individual OFDM symbol channel slices
    # Each sample is a (64, 2) pair for one OFDM symbol
    X_samples = []
    Y_samples = []
    
    # Each frame has 14 symbols, so we need ceil(num_samples / 14) frames
    frames_needed = int(np.ceil(num_samples / config.num_symbols))
    
    for f in range(frames_needed):
        # Random speed and SNR within the specified ranges
        speed = rng.uniform(speed_range_kmh[0], speed_range_kmh[1])
        snr = rng.uniform(snr_range_db[0], snr_range_db[1])
        frame_seed = rng.integers(0, 1_000_000_000)
        
        # 1. Transmitter
        tx_time_signal, tx_grid, _ = transceiver.generate_tx_frame(seed=frame_seed)
        
        # 2. Wireless HSR Channel
        channel = RailwayChannel(
            train_speed_kmh=speed,
            carrier_freq_hz=carrier_freq_hz,
            num_subcarriers=config.N,
            cp_length=config.Ncp,
            seed=frame_seed
        )
        rx_time_signal, true_cfr = channel.apply_channel(tx_time_signal, config.num_symbols, snr_db=snr)
        
        # 3. Receiver FFT
        rx_grid = transceiver.receive_rx_grid(rx_time_signal)
        
        # 4. LS Channel Estimation
        H_ls_grid = estimate_ls_frame(rx_grid, config, interp_method="linear")
        
        # Store individual symbol pairs
        for m in range(config.num_symbols):
            if len(X_samples) >= num_samples:
                break
                
            h_ls_sym = H_ls_grid[m, :]       # Shape (64,) complex
            h_true_sym = true_cfr[m, :]      # Shape (64,) complex
            
            # Convert complex to [Real, Imag]
            x_feat = np.stack([np.real(h_ls_sym), np.imag(h_ls_sym)], axis=-1)   # (64, 2)
            y_feat = np.stack([np.real(h_true_sym), np.imag(h_true_sym)], axis=-1) # (64, 2)
            
            X_samples.append(x_feat)
            Y_samples.append(y_feat)
            
        if progress_callback is not None:
            pct = min(1.0, len(X_samples) / num_samples)
            progress_callback(pct, f"Generated {len(X_samples)} / {num_samples} channel samples...")
            
    X = np.array(X_samples, dtype=np.float32)
    Y = np.array(Y_samples, dtype=np.float32)
    
    # Dataset split: 70% Train, 15% Validation, 15% Test
    total = len(X)
    n_train = int(0.70 * total)
    n_val = int(0.15 * total)
    
    # Shuffle indices
    indices = np.arange(total)
    rng.shuffle(indices)
    
    train_idx = indices[:n_train]
    val_idx = indices[n_train:n_train + n_val]
    test_idx = indices[n_train + n_val:]
    
    X_train, Y_train = X[train_idx], Y[train_idx]
    X_val, Y_val = X[val_idx], Y[val_idx]
    X_test, Y_test = X[test_idx], Y[test_idx]
    
    return X_train, Y_train, X_val, Y_val, X_test, Y_test


def save_dataset(X_train: np.ndarray, Y_train: np.ndarray,
                 X_val: np.ndarray, Y_val: np.ndarray,
                 X_test: np.ndarray, Y_test: np.ndarray,
                 filename: str = "hsr_ofdm_dataset.npz") -> str:
    """Saves generated dataset to disk (.npz)."""
    os.makedirs(DATA_DIR, exist_ok=True)
    filepath = os.path.join(DATA_DIR, filename)
    np.savez_compressed(
        filepath,
        X_train=X_train, Y_train=Y_train,
        X_val=X_val, Y_val=Y_val,
        X_test=X_test, Y_test=Y_test
    )
    return filepath


def load_dataset(filename: str = "hsr_ofdm_dataset.npz") -> Optional[Tuple[np.ndarray, ...]]:
    """Loads dataset from disk if available, otherwise returns None."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    try:
        data = np.load(filepath)
        return (
            data["X_train"], data["Y_train"],
            data["X_val"], data["Y_val"],
            data["X_test"], data["Y_test"]
        )
    except Exception:
        return None
