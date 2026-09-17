"""Simulation engine coordinating the complete end-to-end OFDM transmission, HSR channel,
channel estimation (LS and 1D CNN), equalization, demodulation, and performance evaluation.
"""

from typing import Dict, Any, List, Optional
import time
import numpy as np

try:
    from app.core.ofdm import OFDMConfig, OFDMTransceiver
    from app.core.channel import RailwayChannel
    from app.core.channel_estimation import estimate_ls_frame
    from app.core.cnn_model import predict_channel_cnn, load_trained_model, is_model_available
    from app.core.metrics import calculate_ber, calculate_nmse, nmse_to_db
    from app.core.doppler import calculate_max_doppler
except ImportError:
    from src.ofdm import OFDMConfig, OFDMTransceiver
    from src.channel import RailwayChannel
    from src.channel_estimation import estimate_ls_frame
    from src.cnn_model import predict_channel_cnn, load_trained_model, is_model_available
    from src.metrics import calculate_ber, calculate_nmse, nmse_to_db
    from src.doppler import calculate_max_doppler


def run_single_simulation(
    speed_kmh: float = 300.0,
    carrier_freq_hz: float = 2.6e9,
    snr_db: float = 15.0,
    modulation: str = "QPSK",
    pilot_mode: str = "SCATTERED",
    pilot_spacing: int = 4,
    num_symbols: int = 14,
    interp_method: str = "linear",
    equalizer_method: str = "ZF",
    cnn_model = None,
    seed: Optional[int] = 42
) -> Dict[str, Any]:
    """Runs a complete end-to-end OFDM transmission simulation.
    
    All values are strictly computed from mathematical functions and actual signal processing.
    """
    # 1. System Configuration
    config = OFDMConfig(
        num_subcarriers=64,
        num_symbols=num_symbols,
        cp_length=16,
        pilot_mode=pilot_mode,
        pilot_spacing=pilot_spacing,
        modulation=modulation
    )
    transceiver = OFDMTransceiver(config)
    
    # 2. Transmitter: Generate bits, modulate, add pilots, IFFT, add CP
    tx_time_signal, tx_grid, tx_bits = transceiver.generate_tx_frame(seed=seed)
    
    # 3. High-Speed Railway Wireless Channel
    channel = RailwayChannel(
        train_speed_kmh=speed_kmh,
        carrier_freq_hz=carrier_freq_hz,
        num_subcarriers=config.N,
        cp_length=config.Ncp,
        seed=seed
    )
    rx_time_signal, true_cfr = channel.apply_channel(tx_time_signal, config.num_symbols, snr_db=snr_db)
    
    # 4. Receiver: Remove CP and perform FFT
    rx_grid = transceiver.receive_rx_grid(rx_time_signal)
    
    # 5. LS Channel Estimation
    t_ls_start = time.perf_counter()
    H_ls_grid = estimate_ls_frame(rx_grid, config, interp_method=interp_method)
    t_ls_end = time.perf_counter()
    ls_time_ms = (t_ls_end - t_ls_start) * 1000.0
    
    # 6. 1D CNN Channel Estimation
    # If cnn_model not passed, try loading default
    if cnn_model is None and is_model_available():
        cnn_model = load_trained_model()
        
    H_cnn_grid, cnn_time_ms, used_fallback = predict_channel_cnn(cnn_model, H_ls_grid)
    
    # 7. Equalization
    noise_var = 10.0 ** (-snr_db / 10.0)
    
    eq_grid_ls = transceiver.equalize(rx_grid, H_ls_grid, method=equalizer_method, noise_var=noise_var)
    eq_grid_cnn = transceiver.equalize(rx_grid, H_cnn_grid, method=equalizer_method, noise_var=noise_var)
    
    # 8. Demodulation
    detected_bits_ls, eq_syms_ls = transceiver.extract_data_and_demodulate(eq_grid_ls)
    detected_bits_cnn, eq_syms_cnn = transceiver.extract_data_and_demodulate(eq_grid_cnn)
    
    # Extract transmitted data symbols for constellation comparison
    tx_syms_data = []
    rx_syms_data = []
    if len(config.data_indices) > 0:
        for m in range(config.num_symbols):
            tx_syms_data.append(tx_grid[m, config.data_indices])
            rx_syms_data.append(rx_grid[m, config.data_indices])
        tx_data_symbols = np.concatenate(tx_syms_data)
        rx_data_symbols = np.concatenate(rx_syms_data)
    else:
        tx_data_symbols = np.array([], dtype=np.complex128)
        rx_data_symbols = np.array([], dtype=np.complex128)
        
    # 9. Performance Metrics Calculation
    ber_ls, errs_ls, tot_bits_ls = calculate_ber(tx_bits, detected_bits_ls)
    ber_cnn, errs_cnn, tot_bits_cnn = calculate_ber(tx_bits, detected_bits_cnn)
    
    nmse_ls = calculate_nmse(true_cfr, H_ls_grid)
    nmse_cnn = calculate_nmse(true_cfr, H_cnn_grid)
    
    # 10. Doppler frequency
    calculated_doppler = calculate_max_doppler(speed_kmh, carrier_freq_hz)
    
    return {
        "speed_kmh": speed_kmh,
        "carrier_freq_hz": carrier_freq_hz,
        "snr_db": snr_db,
        "modulation": modulation,
        "pilot_mode": pilot_mode,
        "pilot_spacing": pilot_spacing,
        "pilot_metrics": config.get_pilot_metrics(),
        "doppler_hz": calculated_doppler,
        "total_bits": tot_bits_ls,
        "ber_ls": ber_ls,
        "bit_errors_ls": errs_ls,
        "nmse_ls": nmse_ls,
        "nmse_ls_db": nmse_to_db(nmse_ls),
        "ls_time_ms": ls_time_ms,
        "ber_cnn": ber_cnn,
        "bit_errors_cnn": errs_cnn,
        "nmse_cnn": nmse_cnn,
        "nmse_cnn_db": nmse_to_db(nmse_cnn),
        "cnn_time_ms": cnn_time_ms,
        "cnn_used_fallback": used_fallback,
        "cnn_available": (cnn_model is not None),
        # Real arrays for Plotly visualization
        "true_cfr": true_cfr,
        "H_ls_grid": H_ls_grid,
        "H_cnn_grid": H_cnn_grid,
        "tx_data_symbols": tx_data_symbols,
        "rx_data_symbols": rx_data_symbols,
        "eq_syms_ls": eq_syms_ls,
        "eq_syms_cnn": eq_syms_cnn,
    }


def run_snr_performance_sweep(
    snr_list: List[float] = None,
    speed_kmh: float = 300.0,
    carrier_freq_hz: float = 2.6e9,
    modulation: str = "QPSK",
    pilot_mode: str = "SCATTERED",
    pilot_spacing: int = 4,
    num_symbols: int = 14,
    num_runs_per_snr: int = 3,
    cnn_model = None,
    progress_callback = None
) -> Dict[str, Any]:
    """Runs simulation over a range of SNR values to generate real BER vs SNR and NMSE vs SNR curves."""
    if snr_list is None:
        snr_list = [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0]
        
    results = {
        "snr_db": [],
        "ber_ls": [],
        "ber_cnn": [],
        "nmse_ls": [],
        "nmse_cnn": [],
        "nmse_ls_db": [],
        "nmse_cnn_db": []
    }
    
    total_steps = len(snr_list) * num_runs_per_snr
    step_count = 0
    
    for snr in snr_list:
        run_ber_ls = []
        run_ber_cnn = []
        run_nmse_ls = []
        run_nmse_cnn = []
        
        for run_idx in range(num_runs_per_snr):
            sim_res = run_single_simulation(
                speed_kmh=speed_kmh,
                carrier_freq_hz=carrier_freq_hz,
                snr_db=snr,
                modulation=modulation,
                pilot_mode=pilot_mode,
                pilot_spacing=pilot_spacing,
                num_symbols=num_symbols,
                cnn_model=cnn_model,
                seed=None
            )
            run_ber_ls.append(sim_res["ber_ls"])
            run_ber_cnn.append(sim_res["ber_cnn"])
            run_nmse_ls.append(sim_res["nmse_ls"])
            run_nmse_cnn.append(sim_res["nmse_cnn"])
            
            step_count += 1
            if progress_callback is not None:
                pct = step_count / total_steps
                progress_callback(pct, f"Testing SNR = {snr} dB (run {run_idx+1}/{num_runs_per_snr})...")
                
        avg_ber_ls = float(np.mean(run_ber_ls))
        avg_ber_cnn = float(np.mean(run_ber_cnn))
        avg_nmse_ls = float(np.mean(run_nmse_ls))
        avg_nmse_cnn = float(np.mean(run_nmse_cnn))
        
        results["snr_db"].append(snr)
        results["ber_ls"].append(avg_ber_ls)
        results["ber_cnn"].append(avg_ber_cnn)
        results["nmse_ls"].append(avg_nmse_ls)
        results["nmse_cnn"].append(avg_nmse_cnn)
        results["nmse_ls_db"].append(nmse_to_db(avg_nmse_ls))
        results["nmse_cnn_db"].append(nmse_to_db(avg_nmse_cnn))
        
    return results


def run_speed_performance_sweep(
    speeds_kmh: List[float] = None,
    snr_db: float = 15.0,
    carrier_freq_hz: float = 2.6e9,
    modulation: str = "QPSK",
    pilot_mode: str = "SCATTERED",
    pilot_spacing: int = 4,
    cnn_model = None,
    progress_callback = None
) -> Dict[str, Any]:
    """Runs simulation across different train speeds to measure impact of Doppler on BER and NMSE."""
    if speeds_kmh is None:
        speeds_kmh = [50.0, 100.0, 200.0, 300.0, 500.0]
        
    results = {
        "speed_kmh": [],
        "doppler_hz": [],
        "ber_ls": [],
        "ber_cnn": [],
        "nmse_ls": [],
        "nmse_cnn": []
    }
    
    total = len(speeds_kmh)
    for idx, spd in enumerate(speeds_kmh):
        sim_res = run_single_simulation(
            speed_kmh=spd,
            carrier_freq_hz=carrier_freq_hz,
            snr_db=snr_db,
            modulation=modulation,
            pilot_mode=pilot_mode,
            pilot_spacing=pilot_spacing,
            cnn_model=cnn_model,
            seed=None
        )
        results["speed_kmh"].append(spd)
        results["doppler_hz"].append(sim_res["doppler_hz"])
        results["ber_ls"].append(sim_res["ber_ls"])
        results["ber_cnn"].append(sim_res["ber_cnn"])
        results["nmse_ls"].append(sim_res["nmse_ls"])
        results["nmse_cnn"].append(sim_res["nmse_cnn"])
        
        if progress_callback is not None:
            progress_callback((idx + 1) / total, f"Testing speed = {spd} km/h...")
            
    return results
