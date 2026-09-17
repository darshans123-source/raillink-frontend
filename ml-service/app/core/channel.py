"""High-Speed Railway (HSR) Wireless Channel Model.

Simulation model inspired by the paper:
"Deep Learning-Based Channel Estimation With 1D CNN for OFDM Systems Under High-Speed Railway Environments"
(IEEE Access).

Note: This is a simulation model designed for education and research prototyping,
reflecting Rician fading, high Doppler shifts, discrete multipath delays, and AWGN.
"""

from typing import Tuple, List, Dict, Optional
import numpy as np
try:
    from app.core.doppler import calculate_max_doppler, calculate_tap_doppler
except ImportError:
    from src.doppler import calculate_max_doppler, calculate_tap_doppler


class RailwayMultipathProfile:
    """Pre-configured multipath delay and power profiles inspired by Winner-II HSR scenarios."""
    
    # Typical High-Speed Railway profile (Viaduct / Open cutting scenario)
    # Delays in sample indices (integer samples <= CP length of 16)
    DEFAULT_DELAYS: List[int] = [0, 2, 4, 7, 11]
    
    # Relative average power per tap in dB
    DEFAULT_POWERS_DB: List[float] = [0.0, -3.0, -7.0, -10.0, -15.0]
    
    # Angle of arrival for each path (in radians relative to train trajectory)
    DEFAULT_AOAS_RAD: List[float] = [
        0.0,                  # LOS direct path (aligned with track)
        np.pi / 4.0,          # 45 deg scattering
        np.pi / 2.0,          # 90 deg side reflection (catenary/pole)
        3.0 * np.pi / 4.0,    # 135 deg rear-side reflection
        np.pi                 # 180 deg rear reflection
    ]
    
    # Rician K-factor for tap 0 in dB (ratio of dominant LOS power to scattered power)
    DEFAULT_K_FACTOR_DB: float = 6.0


class RailwayChannel:
    """Simulates a time-varying multipath fading channel with Doppler shifts and AWGN."""
    
    def __init__(self,
                 train_speed_kmh: float = 300.0,
                 carrier_freq_hz: float = 2.6e9,
                 subcarrier_spacing_hz: float = 15e3,
                 num_subcarriers: int = 64,
                 cp_length: int = 16,
                 rician_k_db: float = RailwayMultipathProfile.DEFAULT_K_FACTOR_DB,
                 delays: Optional[List[int]] = None,
                 powers_db: Optional[List[float]] = None,
                 aoas_rad: Optional[List[float]] = None,
                 seed: Optional[int] = None):
        """Initializes the HSR channel parameters."""
        self.speed_kmh = float(train_speed_kmh)
        self.carrier_freq = float(carrier_freq_hz)
        self.delta_f = float(subcarrier_spacing_hz)
        self.N = int(num_subcarriers)
        self.Ncp = int(cp_length)
        self.rician_k_db = float(rician_k_db)
        self.rng = np.random.default_rng(seed)
        
        # Sampling rate and sample duration
        self.sampling_rate = self.N * self.delta_f  # e.g., 64 * 15 kHz = 960 kHz
        self.Ts = 1.0 / self.sampling_rate
        self.T_sym = (self.N + self.Ncp) * self.Ts  # Total OFDM symbol duration including CP
        
        # Multipath profile
        self.delays = np.array(delays if delays is not None else RailwayMultipathProfile.DEFAULT_DELAYS, dtype=int)
        self.powers_db = np.array(powers_db if powers_db is not None else RailwayMultipathProfile.DEFAULT_POWERS_DB, dtype=float)
        self.aoas_rad = np.array(aoas_rad if aoas_rad is not None else RailwayMultipathProfile.DEFAULT_AOAS_RAD, dtype=float)
        
        # Doppler calculations
        self.max_doppler = calculate_max_doppler(self.speed_kmh, self.carrier_freq)
        self.tap_dopplers = np.array([
            calculate_tap_doppler(self.max_doppler, theta) for theta in self.aoas_rad
        ], dtype=float)
        
        # Power normalization
        linear_powers = 10.0 ** (self.powers_db / 10.0)
        self.norm_powers = linear_powers / np.sum(linear_powers)
        
        # Generate random initial phases for multipath components
        self.initial_phases = self.rng.uniform(0.0, 2.0 * np.pi, size=len(self.delays))
        
        # Generate random diffuse fading coefficients for NLOS and diffuse LOS components
        self.diffuse_coefficients = (
            self.rng.standard_normal(len(self.delays)) + 1j * self.rng.standard_normal(len(self.delays))
        )
        
        # Rician K-factor linear ratio for tap 0
        self.K_linear = 10.0 ** (self.rician_k_db / 10.0)

    def _get_symbol_cir(self, m: int) -> Tuple[np.ndarray, np.ndarray]:
        """Calculates the Channel Impulse Response (CIR) and tap gains for symbol index m.
        
        Returns:
            Tuple of (cir_array, tap_gains) where cir_array is zero-padded to max_delay + 1.
        """
        t_m = (m + 0.5) * self.T_sym
        max_delay = int(np.max(self.delays))
        cir = np.zeros(max_delay + 1, dtype=np.complex128)
        tap_gains = np.zeros(len(self.delays), dtype=np.complex128)
        
        for l_idx, tau in enumerate(self.delays):
            p_l = self.norm_powers[l_idx]
            f_dl = self.tap_dopplers[l_idx]
            phi_l = self.initial_phases[l_idx]
            
            # Doppler phase rotation
            doppler_phase = 2.0 * np.pi * f_dl * t_m + phi_l
            diffuse = self.diffuse_coefficients[l_idx]
            
            if l_idx == 0:
                los_amp = np.sqrt(p_l * (self.K_linear / (self.K_linear + 1.0)))
                nlos_amp = np.sqrt(p_l / (2.0 * (self.K_linear + 1.0)))
                gain = los_amp * np.exp(1j * doppler_phase) + nlos_amp * diffuse * np.exp(1j * doppler_phase)
            else:
                rayleigh_amp = np.sqrt(p_l / 2.0)
                gain = rayleigh_amp * diffuse * np.exp(1j * doppler_phase)
                
            tap_gains[l_idx] = gain
            cir[tau] = gain
            
        return cir, tap_gains
        
    def get_channel_frequency_response(self, num_symbols: int) -> np.ndarray:
        """Computes the true Channel Frequency Response (CFR) H[k, m] across subcarriers and symbols.
        
        Args:
            num_symbols: Number of OFDM symbols (e.g., 14).
            
        Returns:
            2D numpy complex array of shape (num_symbols, num_subcarriers).
        """
        CFR = np.zeros((num_symbols, self.N), dtype=np.complex128)
        k_indices = np.arange(self.N)
        
        for m in range(num_symbols):
            _, tap_gains = self._get_symbol_cir(m)
            for l_idx, tau_l in enumerate(self.delays):
                phase_shift = np.exp(-1j * 2.0 * np.pi * k_indices * tau_l / self.N)
                CFR[m, :] += tap_gains[l_idx] * phase_shift
                
        return CFR

    def apply_channel(self,
                      tx_time_signal: np.ndarray,
                      num_symbols: int,
                      snr_db: float) -> Tuple[np.ndarray, np.ndarray]:
        """Applies multipath fading, Doppler shift, and AWGN noise to the time-domain signal.
        
        Args:
            tx_time_signal: 1D complex array of concatenated OFDM time symbols with CP.
                            Length = num_symbols * (N + Ncp).
            num_symbols: Number of OFDM symbols transmitted.
            snr_db: Signal-to-Noise Ratio in dB.
            
        Returns:
            Tuple of (rx_time_signal, true_cfr):
                rx_time_signal: 1D complex array with channel effects and AWGN.
                true_cfr: 2D complex array of shape (num_symbols, N) of the true channel.
        """
        symbol_len = self.N + self.Ncp
        rx_signal = np.zeros_like(tx_time_signal, dtype=np.complex128)
        true_cfr = self.get_channel_frequency_response(num_symbols)
        
        # Apply time-varying multipath convolution symbol by symbol
        for m in range(num_symbols):
            sym_start = m * symbol_len
            sym_end = sym_start + symbol_len
            tx_sym = tx_time_signal[sym_start:sym_end]
            
            cir, _ = self._get_symbol_cir(m)
            
            # Linear convolution with CIR over the OFDM block
            conv_sym = np.convolve(tx_sym, cir, mode='full')[:symbol_len]
            rx_signal[sym_start:sym_end] = conv_sym
            
        # Add Additive White Gaussian Noise (AWGN)
        sig_power = np.mean(np.abs(rx_signal) ** 2)
        snr_linear = 10.0 ** (snr_db / 10.0)
        noise_power = sig_power / snr_linear if snr_linear > 0 else 1e-6
        noise_std = np.sqrt(noise_power / 2.0)
        
        noise = noise_std * (self.rng.standard_normal(len(rx_signal)) + 1j * self.rng.standard_normal(len(rx_signal)))
        rx_signal_noisy = rx_signal + noise
        
        return rx_signal_noisy, true_cfr
