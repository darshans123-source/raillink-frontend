"""Doppler effect calculation module for High-Speed Railway (HSR) environments.

Formula:
    f_d = (v / c) * f_c

Where:
    v   = train velocity in m/s (v_kmh / 3.6)
    c   = speed of light (3.0e8 m/s)
    f_c = carrier frequency in Hz (e.g., 2.6e9 Hz for 2.6 GHz)
"""

from typing import Dict, List, Tuple
import numpy as np

# Physical constants
SPEED_OF_LIGHT: float = 3.0e8  # meters per second


def kmh_to_mps(speed_kmh: float) -> float:
    """Converts train speed from kilometers per hour (km/h) to meters per second (m/s)."""
    return float(speed_kmh) / 3.6


def calculate_max_doppler(speed_kmh: float, carrier_freq_hz: float = 2.6e9) -> float:
    """Calculates the maximum Doppler shift in Hertz.
    
    Args:
        speed_kmh: Train speed in km/h (e.g., 50, 100, 200, 300, 500).
        carrier_freq_hz: Carrier frequency in Hz (default 2.6 GHz = 2.6e9 Hz).
        
    Returns:
        Maximum Doppler frequency in Hz.
    """
    v_mps = kmh_to_mps(speed_kmh)
    f_d = (v_mps / SPEED_OF_LIGHT) * carrier_freq_hz
    return float(f_d)


def calculate_tap_doppler(max_doppler_hz: float, angle_of_arrival_rad: float) -> float:
    """Calculates directional Doppler shift for a specific multipath component.
    
    Args:
        max_doppler_hz: Maximum Doppler frequency.
        angle_of_arrival_rad: Arrival angle theta in radians relative to direction of motion.
        
    Returns:
        Doppler frequency for this path: f_d * cos(theta).
    """
    return float(max_doppler_hz * np.cos(angle_of_arrival_rad))


def get_doppler_table(carrier_freq_hz: float = 2.6e9,
                      speeds_kmh: List[float] = None) -> List[Dict[str, float]]:
    """Generates a Doppler comparison table across various train speeds.
    
    Args:
        carrier_freq_hz: Carrier frequency in Hz.
        speeds_kmh: List of speeds to evaluate.
        
    Returns:
        List of dictionaries with speed (km/h), speed (m/s), and Doppler (Hz).
    """
    if speeds_kmh is None:
        speeds_kmh = [50.0, 100.0, 200.0, 300.0, 500.0]
        
    results = []
    for spd in speeds_kmh:
        v_mps = kmh_to_mps(spd)
        fd = calculate_max_doppler(spd, carrier_freq_hz)
        results.append({
            "speed_kmh": spd,
            "speed_mps": round(v_mps, 2),
            "carrier_freq_ghz": round(carrier_freq_hz / 1e9, 2),
            "doppler_hz": round(fd, 2)
        })
    return results


def get_jakes_doppler_spectrum(max_doppler_hz: float, num_points: int = 100) -> Tuple[np.ndarray, np.ndarray]:
    """Generates the theoretical Jakes Doppler Power Spectral Density (PSD).
    
    PSD(f) = 1.0 / (pi * f_d * sqrt(1 - (f / f_d)^2)) for |f| < f_d
    """
    if max_doppler_hz <= 0:
        return np.array([0.0]), np.array([1.0])
        
    freqs = np.linspace(-0.999 * max_doppler_hz, 0.999 * max_doppler_hz, num_points)
    psd = 1.0 / (np.pi * max_doppler_hz * np.sqrt(1.0 - (freqs / max_doppler_hz) ** 2))
    # Normalize for plotting
    psd = psd / np.max(psd)
    return freqs, psd
