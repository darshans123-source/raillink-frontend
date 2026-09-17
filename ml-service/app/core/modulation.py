"""Modulation and Demodulation module for AI-RailLink.

Supports BPSK, QPSK, and 16-QAM with Gray coding and normalized unit energy (Es = 1).
Includes exact minimum Euclidean distance symbol demapping for hard decisions.
"""

from typing import Tuple, Dict
import numpy as np


# Constellation mapping tables (Gray-coded, unit average energy)
def _build_constellation_tables() -> Tuple[Dict[str, Dict[str, complex]], Dict[str, Dict[complex, str]]]:
    """Builds bit-to-symbol and symbol-to-bit mapping dictionaries."""
    
    # 1. BPSK: 1 bit per symbol
    # 0 -> +1, 1 -> -1 (normalized energy = 1)
    bpsk_map = {
        (0,): complex(1.0, 0.0),
        (1,): complex(-1.0, 0.0)
    }
    
    # 2. QPSK: 2 bits per symbol (Gray coded)
    # (b0, b1): (0,0)->(1+j)/sqrt(2), (0,1)->(-1+j)/sqrt(2), (1,1)->(-1-j)/sqrt(2), (1,0)->(1-j)/sqrt(2)
    norm_qpsk = 1.0 / np.sqrt(2.0)
    qpsk_map = {
        (0, 0): complex(norm_qpsk, norm_qpsk),
        (0, 1): complex(-norm_qpsk, norm_qpsk),
        (1, 1): complex(-norm_qpsk, -norm_qpsk),
        (1, 0): complex(norm_qpsk, -norm_qpsk),
    }
    
    # 3. 16-QAM: 4 bits per symbol (Gray coded)
    # In-phase: (b0, b1) -> +3, +1, -1, -3
    # Quadrature: (b2, b3) -> +3, +1, -1, -3
    # Normalized by sqrt(10) to make average symbol power = 1.0
    norm_16qam = 1.0 / np.sqrt(10.0)
    pam4_map = {
        (0, 0): 3.0,
        (0, 1): 1.0,
        (1, 1): -1.0,
        (1, 0): -3.0
    }
    qam16_map = {}
    for (b0, b1), real_val in pam4_map.items():
        for (b2, b3), imag_val in pam4_map.items():
            bits = (b0, b1, b2, b3)
            qam16_map[bits] = complex(real_val * norm_16qam, imag_val * norm_16qam)
            
    mapping_dict = {
        "BPSK": bpsk_map,
        "QPSK": qpsk_map,
        "16-QAM": qam16_map
    }
    
    return mapping_dict


MAPPING_TABLES = _build_constellation_tables()
BITS_PER_SYMBOL = {
    "BPSK": 1,
    "QPSK": 2,
    "16-QAM": 4
}


def get_bits_per_symbol(mod_type: str) -> int:
    """Returns number of bits carried per modulated symbol."""
    if mod_type not in BITS_PER_SYMBOL:
        raise ValueError(f"Unsupported modulation: {mod_type}. Choose BPSK, QPSK, or 16-QAM.")
    return BITS_PER_SYMBOL[mod_type]


def get_constellation_points(mod_type: str) -> np.ndarray:
    """Returns an array of complex constellation points for the chosen modulation."""
    mapping = MAPPING_TABLES[mod_type]
    return np.array(list(mapping.values()), dtype=np.complex128)


def generate_bits(num_bits: int, seed: int = None) -> np.ndarray:
    """Generates random digital binary data (0s and 1s)."""
    rng = np.random.default_rng(seed)
    return rng.integers(0, 2, size=num_bits, dtype=np.int8)


def modulate(bits: np.ndarray, mod_type: str) -> np.ndarray:
    """Modulates a 1D binary numpy array into complex baseband symbols.
    
    Args:
        bits: 1D array of 0s and 1s. Length must be a multiple of bits_per_symbol.
        mod_type: 'BPSK', 'QPSK', or '16-QAM'.
        
    Returns:
        1D numpy array of complex symbols with unit average energy (Es = 1).
    """
    bps = get_bits_per_symbol(mod_type)
    if len(bits) % bps != 0:
        raise ValueError(f"Bit sequence length ({len(bits)}) must be a multiple of bits per symbol ({bps}).")
        
    mapping = MAPPING_TABLES[mod_type]
    grouped_bits = bits.reshape(-1, bps)
    
    symbols = np.zeros(len(grouped_bits), dtype=np.complex128)
    for idx, bit_tuple in enumerate(grouped_bits):
        symbols[idx] = mapping[tuple(bit_tuple)]
        
    return symbols


def demodulate(symbols: np.ndarray, mod_type: str) -> np.ndarray:
    """Demodulates received complex symbols back into bits using minimum Euclidean distance.
    
    Args:
        symbols: 1D numpy array of equalized complex symbols.
        mod_type: 'BPSK', 'QPSK', or '16-QAM'.
        
    Returns:
        1D numpy array of detected binary bits (0 or 1).
    """
    bps = get_bits_per_symbol(mod_type)
    mapping = MAPPING_TABLES[mod_type]
    
    constellation = np.array(list(mapping.values()), dtype=np.complex128)
    bit_patterns = np.array(list(mapping.keys()), dtype=np.int8)
    
    # Compute squared Euclidean distance between each received symbol and all constellation points
    # Shape of symbols: (M, 1), shape of constellation: (1, K)
    sym_col = symbols[:, np.newaxis]
    const_row = constellation[np.newaxis, :]
    
    distances = np.abs(sym_col - const_row) ** 2
    min_indices = np.argmin(distances, axis=1)
    
    detected_bits = bit_patterns[min_indices].reshape(-1)
    return detected_bits
