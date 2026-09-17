"""OFDM modulation, pilot insertion, IFFT/FFT, and cyclic prefix handling for AI-RailLink.

Parameters based on the research paper:
- N = 64 subcarriers
- 14 OFDM symbols per frame
- Cyclic prefix = 16 samples
- Configurable pilot modes: Full Pilot or Scattered Pilot (Zpilot in {1, 2, 3, 5, 10})
"""

from typing import Tuple, Dict, List, Optional
import numpy as np
from src.modulation import get_bits_per_symbol, modulate, demodulate, generate_bits


class OFDMConfig:
    """Configuration container for OFDM frame parameters."""
    
    def __init__(self,
                 num_subcarriers: int = 64,
                 num_symbols: int = 14,
                 cp_length: int = 16,
                 pilot_mode: str = "SCATTERED",  # "FULL" or "SCATTERED"
                 pilot_spacing: int = 4,         # Zpilot: 1, 2, 3, 5, 10
                 modulation: str = "QPSK",       # BPSK, QPSK, 16-QAM
                 subcarrier_spacing_hz: float = 15e3):
        self.N = int(num_subcarriers)
        self.num_symbols = int(num_symbols)
        self.Ncp = int(cp_length)
        self.pilot_mode = pilot_mode.upper()
        self.pilot_spacing = int(pilot_spacing)
        self.modulation = modulation.upper()
        self.delta_f = float(subcarrier_spacing_hz)
        
        # Determine pilot and data subcarrier indices
        if self.pilot_mode == "FULL":
            self.pilot_indices = np.arange(self.N, dtype=int)
            self.data_indices = np.array([], dtype=int)
        else:
            # Scattered pilot mode
            # Ensure spacing is at least 1
            step = max(1, self.pilot_spacing)
            pilots = list(range(0, self.N, step))
            # Ensure the upper boundary subcarrier is included for stable edge interpolation
            if (self.N - 1) not in pilots:
                pilots.append(self.N - 1)
            self.pilot_indices = np.array(sorted(pilots), dtype=int)
            all_indices = set(range(self.N))
            self.data_indices = np.array(sorted(list(all_indices - set(self.pilot_indices))), dtype=int)
            
        self.num_pilots = len(self.pilot_indices)
        self.num_data = len(self.data_indices)
        self.pilot_overhead_pct = (self.num_pilots / self.N) * 100.0
        
        # Pilot symbol value: Known deterministic QPSK pilot (normalized energy = 1)
        self.pilot_value = complex(1.0 / np.sqrt(2.0), 1.0 / np.sqrt(2.0))

    def get_pilot_metrics(self) -> Dict[str, float]:
        """Returns dictionary of pilot overhead and carrier counts."""
        return {
            "total_subcarriers": self.N,
            "pilot_subcarriers": self.num_pilots,
            "data_subcarriers": self.num_data,
            "pilot_overhead_pct": round(self.pilot_overhead_pct, 2)
        }


class OFDMTransceiver:
    """Full OFDM physical layer transceiver implementation."""
    
    def __init__(self, config: OFDMConfig):
        self.cfg = config
        self.bps = get_bits_per_symbol(self.cfg.modulation)
        
    def generate_tx_frame(self, seed: Optional[int] = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generates random digital data, modulates, inserts pilots, performs IFFT, and adds CP.
        
        Returns:
            Tuple of (tx_time_signal, tx_grid, tx_bits):
                tx_time_signal: 1D complex array of time-domain signal ready for channel.
                tx_grid: 2D complex array (num_symbols, N) of transmitted frequency-domain symbols.
                tx_bits: 1D array of generated digital bits.
        """
        num_data_total = self.cfg.num_data * self.cfg.num_symbols
        total_bits_needed = num_data_total * self.bps
        
        if total_bits_needed > 0:
            tx_bits = generate_bits(total_bits_needed, seed=seed)
            data_symbols = modulate(tx_bits, self.cfg.modulation)
        else:
            # Full pilot mode has 0 data subcarriers
            tx_bits = np.array([], dtype=np.int8)
            data_symbols = np.array([], dtype=np.complex128)
            
        # Build 2D frequency grid (symbols x subcarriers)
        tx_grid = np.zeros((self.cfg.num_symbols, self.cfg.N), dtype=np.complex128)
        data_ptr = 0
        
        for m in range(self.cfg.num_symbols):
            # Insert pilots
            tx_grid[m, self.cfg.pilot_indices] = self.cfg.pilot_value
            # Insert data symbols
            if len(self.cfg.data_indices) > 0:
                chunk = data_symbols[data_ptr : data_ptr + self.cfg.num_data]
                tx_grid[m, self.cfg.data_indices] = chunk
                data_ptr += self.cfg.num_data
                
        # Perform IFFT symbol by symbol with unitary normalization (sqrt(N))
        # Add Cyclic Prefix (last Ncp samples prepended)
        symbol_time_len = self.cfg.N + self.cfg.Ncp
        tx_time_signal = np.zeros(self.cfg.num_symbols * symbol_time_len, dtype=np.complex128)
        
        for m in range(self.cfg.num_symbols):
            freq_sym = tx_grid[m, :]
            # ifft with sqrt(N) normalization ensures energy conservation
            time_sym = np.fft.ifft(freq_sym) * np.sqrt(self.cfg.N)
            
            # Cyclic prefix
            cp = time_sym[-self.cfg.Ncp:]
            ofdm_sym = np.concatenate([cp, time_sym])
            
            start_idx = m * symbol_time_len
            end_idx = start_idx + symbol_time_len
            tx_time_signal[start_idx:end_idx] = ofdm_sym
            
        return tx_time_signal, tx_grid, tx_bits

    def receive_rx_grid(self, rx_time_signal: np.ndarray) -> np.ndarray:
        """Removes cyclic prefix and applies FFT to extract received frequency-domain grid.
        
        Args:
            rx_time_signal: 1D complex array of received time-domain samples.
            
        Returns:
            2D complex array of shape (num_symbols, N) representing received frequency grid Y[m, k].
        """
        symbol_time_len = self.cfg.N + self.cfg.Ncp
        rx_grid = np.zeros((self.cfg.num_symbols, self.cfg.N), dtype=np.complex128)
        
        for m in range(self.cfg.num_symbols):
            start_idx = m * symbol_time_len
            end_idx = start_idx + symbol_time_len
            ofdm_sym = rx_time_signal[start_idx:end_idx]
            
            # Remove Cyclic Prefix
            time_sym = ofdm_sym[self.cfg.Ncp:]
            
            # Unitary FFT (divide by sqrt(N))
            freq_sym = np.fft.fft(time_sym) / np.sqrt(self.cfg.N)
            rx_grid[m, :] = freq_sym
            
        return rx_grid

    def equalize(self,
                 rx_grid: np.ndarray,
                 H_est: np.ndarray,
                 method: str = "ZF",
                 noise_var: float = 0.0) -> np.ndarray:
        """Equalizes received frequency symbols using estimated channel response.
        
        Args:
            rx_grid: 2D complex array (num_symbols, N) of received symbols.
            H_est: 2D complex array (num_symbols, N) of estimated channel response.
            method: 'ZF' (Zero Forcing) or 'MMSE' (Minimum Mean Square Error).
            noise_var: Noise variance (sigma^2) for MMSE.
            
        Returns:
            2D complex array of equalized symbols.
        """
        eps = 1e-12
        if method.upper() == "MMSE" and noise_var > 0:
            # MMSE Equalizer: W = H* / (|H|^2 + sigma^2)
            eq_weights = np.conj(H_est) / (np.abs(H_est) ** 2 + noise_var + eps)
            equalized_grid = rx_grid * eq_weights
        else:
            # ZF Equalizer: W = 1 / H
            # Guard against division by near-zero channel gains
            H_safe = np.where(np.abs(H_est) < 1e-6, 1e-6 * np.exp(1j * np.angle(H_est)), H_est)
            equalized_grid = rx_grid / H_safe
            
        return equalized_grid

    def extract_data_and_demodulate(self, equalized_grid: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Extracts data subcarriers from the equalized grid and demodulates into bits.
        
        Returns:
            Tuple of (detected_bits, recovered_data_symbols).
        """
        if len(self.cfg.data_indices) == 0:
            return np.array([], dtype=np.int8), np.array([], dtype=np.complex128)
            
        # Collect all equalized data symbols across symbols
        all_data_symbols = []
        for m in range(self.cfg.num_symbols):
            syms = equalized_grid[m, self.cfg.data_indices]
            all_data_symbols.append(syms)
            
        recovered_symbols = np.concatenate(all_data_symbols)
        detected_bits = demodulate(recovered_symbols, self.cfg.modulation)
        
        return detected_bits, recovered_symbols
