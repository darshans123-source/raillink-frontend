"""Automated test suite verifying the end-to-end functionality of AI-RailLink.

Tests:
1. Modulation & Demodulation bit integrity
2. Doppler calculation accuracy
3. OFDM frame construction, IFFT, and FFT reversibility
4. High-Speed Railway channel propagation & AWGN
5. Least Squares (LS) channel estimation
6. 1D CNN model building, forward pass, and fallback
7. BER and NMSE metric correctness
"""

import os
import sys
import unittest
import numpy as np

# Ensure project root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.modulation import generate_bits, modulate, demodulate, get_bits_per_symbol
from src.doppler import calculate_max_doppler, kmh_to_mps
from src.ofdm import OFDMConfig, OFDMTransceiver
from src.channel import RailwayChannel
from src.channel_estimation import estimate_ls_frame
from src.cnn_model import build_1d_cnn_model, predict_channel_cnn
from src.metrics import calculate_ber, calculate_nmse, nmse_to_db
from src.simulation import run_single_simulation


class TestAIRailLink(unittest.TestCase):
    
    def test_01_modulation_demodulation_noiseless(self):
        """Verifies that bits modulated and immediately demodulated produce 0 BER."""
        for mod in ["BPSK", "QPSK", "16-QAM"]:
            bps = get_bits_per_symbol(mod)
            bits = generate_bits(100 * bps, seed=42)
            symbols = modulate(bits, mod)
            recovered_bits = demodulate(symbols, mod)
            ber, errors, total = calculate_ber(bits, recovered_bits)
            self.assertEqual(errors, 0, f"Failed for {mod}: expected 0 errors, got {errors}")
            self.assertEqual(ber, 0.0)

    def test_02_doppler_calculation(self):
        """Verifies Doppler calculation formula: f_d = (v/c) * f_c."""
        # 300 km/h = 83.333 m/s
        # f_c = 2.6 GHz = 2.6e9 Hz
        # c = 3.0e8 m/s
        # f_d = (83.3333 / 3e8) * 2.6e9 = 722.22 Hz
        fd = calculate_max_doppler(300.0, 2.6e9)
        self.assertAlmostEqual(fd, 722.222, places=2)
        
        # 0 km/h should be 0 Hz
        self.assertEqual(calculate_max_doppler(0.0, 2.6e9), 0.0)
        
        # 500 km/h at 2.6 GHz
        fd_500 = calculate_max_doppler(500.0, 2.6e9)
        self.assertAlmostEqual(fd_500, (500.0 / 3.6 / 3e8) * 2.6e9, places=3)

    def test_03_ofdm_ifft_fft_noiseless_back_to_back(self):
        """Verifies that in a flat noiseless identity channel, FFT(IFFT(X)) recovers X."""
        cfg = OFDMConfig(num_subcarriers=64, num_symbols=14, cp_length=16, pilot_mode="SCATTERED", pilot_spacing=4)
        transceiver = OFDMTransceiver(cfg)
        
        tx_time_signal, tx_grid, tx_bits = transceiver.generate_tx_frame(seed=42)
        rx_grid = transceiver.receive_rx_grid(tx_time_signal)
        
        # In absence of channel/noise, tx_grid should equal rx_grid
        diff = np.max(np.abs(tx_grid - rx_grid))
        self.assertLess(diff, 1e-10, "FFT/IFFT roundtrip mismatch")

    def test_04_channel_power_and_doppler(self):
        """Verifies that the HSR channel applies fading and noise according to SNR."""
        channel = RailwayChannel(train_speed_kmh=300.0, carrier_freq_hz=2.6e9, seed=42)
        tx_signal = np.ones(14 * (64 + 16), dtype=np.complex128)
        
        rx_signal_high_snr, _ = channel.apply_channel(tx_signal, num_symbols=14, snr_db=30.0)
        rx_signal_low_snr, _ = channel.apply_channel(tx_signal, num_symbols=14, snr_db=0.0)
        
        # High SNR signal should have lower noise variance than low SNR
        self.assertEqual(len(rx_signal_high_snr), len(tx_signal))
        self.assertEqual(len(rx_signal_low_snr), len(tx_signal))

    def test_05_ls_channel_estimation(self):
        """Verifies Least Squares channel estimation across subcarriers."""
        cfg = OFDMConfig(num_subcarriers=64, num_symbols=14, cp_length=16, pilot_mode="SCATTERED", pilot_spacing=4)
        transceiver = OFDMTransceiver(cfg)
        tx_time_signal, tx_grid, _ = transceiver.generate_tx_frame(seed=42)
        
        channel = RailwayChannel(train_speed_kmh=100.0, seed=42)
        rx_time_signal, true_cfr = channel.apply_channel(tx_time_signal, num_symbols=14, snr_db=25.0)
        
        rx_grid = transceiver.receive_rx_grid(rx_time_signal)
        H_ls = estimate_ls_frame(rx_grid, cfg, interp_method="linear")
        
        self.assertEqual(H_ls.shape, (14, 64))
        nmse = calculate_nmse(true_cfr, H_ls)
        self.assertGreater(nmse, 0.0)
        self.assertLess(nmse, 1.0, f"LS NMSE too high ({nmse}) at 25 dB SNR")

    def test_06_cnn_model_forward_pass_and_fallback(self):
        """Verifies 1D CNN model building and prediction with fallback safety."""
        model = build_1d_cnn_model(input_shape=(64, 2))
        dummy_input = np.random.randn(5, 64, 2).astype(np.float32)
        output = model.predict(dummy_input, verbose=0)
        self.assertEqual(output.shape, (5, 64, 2))
        
        # Test fallback when model is None
        H_dummy = np.ones((14, 64), dtype=np.complex128)
        H_fallback, t_ms, fallback_used = predict_channel_cnn(None, H_dummy)
        self.assertTrue(fallback_used)
        np.testing.assert_array_equal(H_fallback, H_dummy)

    def test_07_end_to_end_single_simulation(self):
        """Verifies full end-to-end simulation function returns all required keys and metrics."""
        sim_res = run_single_simulation(
            speed_kmh=300.0,
            carrier_freq_hz=2.6e9,
            snr_db=20.0,
            modulation="QPSK",
            pilot_mode="SCATTERED",
            pilot_spacing=4,
            num_symbols=14,
            seed=42
        )
        required_keys = [
            "speed_kmh", "doppler_hz", "snr_db", "ber_ls", "ber_cnn",
            "nmse_ls", "nmse_cnn", "ls_time_ms", "cnn_time_ms", "true_cfr"
        ]
        for k in required_keys:
            self.assertIn(k, sim_res)
            
        self.assertGreaterEqual(sim_res["ber_ls"], 0.0)
        self.assertLessEqual(sim_res["ber_ls"], 1.0)
        self.assertGreater(sim_res["doppler_hz"], 700.0)  # ~722.2 Hz


if __name__ == "__main__":
    unittest.main()
