"""AI-RailLink: AI-Based OFDM Channel Estimation for High-Speed Railway Communication.

Main Streamlit Application.
Features:
- Professional light-mode railway monitoring dashboard.
- Full end-to-end mathematical simulation (no hardcoded/fake values).
- Least Squares (LS) vs. 1D CNN channel estimation.
- Real BER and NMSE calculation.
- Interactive Plotly visualizations.
- AI training & dataset generation.
- Batch performance benchmarking.
- Comprehensive educational & research reference.
"""

import os
import sys
import time
from typing import Dict, Any, Optional

import streamlit as st
import numpy as np
import pandas as pd

# Add project root to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.doppler import calculate_max_doppler, get_doppler_table, get_jakes_doppler_spectrum, kmh_to_mps
from src.ofdm import OFDMConfig, OFDMTransceiver
from src.channel import RailwayChannel, RailwayMultipathProfile
from src.channel_estimation import estimate_ls_frame
from src.cnn_model import (
    build_1d_cnn_model, train_cnn_model, save_trained_model,
    load_trained_model, is_model_available, DEFAULT_MODEL_PATH
)
from src.dataset import generate_channel_dataset, save_dataset, load_dataset, DATA_DIR
from src.metrics import calculate_ber, calculate_nmse, nmse_to_db, format_metrics_summary
from src.simulation import run_single_simulation, run_snr_performance_sweep, run_speed_performance_sweep
from src.plots import (
    plot_constellation, plot_channel_frequency_response,
    plot_ber_vs_snr, plot_nmse_vs_snr, plot_speed_comparison,
    plot_doppler_curve, plot_training_history, plot_multipath_profile
)


# --------------------------------------------------------------------------------------
# Page Configuration & Professional Railway CSS Styling
# --------------------------------------------------------------------------------------
st.set_page_config(
    page_title="AI-RailLink | OFDM Channel Estimation",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded"
)

CUSTOM_CSS = """
<style>
    /* Main theme: Light, clean, deep forest green, mint accents, dark slate typography */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1e293b;
    }
    
    .stApp {
        background-color: #f8fafc;
    }
    
    /* Top Header Banner */
    .rail-header {
        background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
        padding: 24px 30px;
        border-radius: 12px;
        color: #ffffff;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(27, 67, 50, 0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .rail-header h1 {
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .rail-header p {
        color: #d8f3dc;
        font-size: 14px;
        margin: 4px 0 0 0;
    }
    
    /* Metric Cards */
    .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px 20px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        margin-bottom: 12px;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(27, 67, 50, 0.08);
        border-color: #74c69d;
    }
    .metric-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #64748b;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #1b4332;
        margin-bottom: 4px;
    }
    .metric-sub {
        font-size: 12px;
        color: #64748b;
    }
    
    /* Status Badges */
    .badge-trained {
        background-color: #d8f3dc;
        color: #1b4332;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        display: inline-block;
    }
    .badge-untrained {
        background-color: #fee2e2;
        color: #991b1b;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        display: inline-block;
    }
    .badge-fallback {
        background-color: #fef3c7;
        color: #92400e;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        display: inline-block;
    }
    
    /* Clean Cards for Sections */
    .content-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 22px;
        margin-bottom: 20px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }
    
    /* Buttons */
    .stButton>button {
        background-color: #2d6a4f;
        color: #ffffff;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        padding: 8px 18px;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background-color: #1b4332;
        color: #ffffff;
        border: none;
        box-shadow: 0 4px 10px rgba(27, 67, 50, 0.2);
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# --------------------------------------------------------------------------------------
# Session State Initialization
# --------------------------------------------------------------------------------------
if "sim_results" not in st.session_state:
    st.session_state.sim_results = None
if "bench_results" not in st.session_state:
    st.session_state.bench_results = None
if "training_history" not in st.session_state:
    st.session_state.training_history = None
if "model_cache" not in st.session_state:
    st.session_state.model_cache = None


def get_active_model():
    """Loads and caches model instance in session state."""
    if st.session_state.model_cache is None:
        if is_model_available():
            st.session_state.model_cache = load_trained_model()
    return st.session_state.model_cache


# --------------------------------------------------------------------------------------
# Sidebar Navigation & Operating Parameters
# --------------------------------------------------------------------------------------
with st.sidebar:
    # Logo and App Title
    if os.path.exists("assets/logo.png"):
        st.image("assets/logo.png", width=120)
    st.markdown("### 🚆 **AI-RailLink**")
    st.caption("OFDM Channel Estimation for High-Speed Railway")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["🏠 Dashboard", "🚆 Simulator", "🧠 AI Training", "📡 Channel Analysis", "📊 Performance", "ℹ️ About"],
        index=0
    )
    st.markdown("---")
    
    st.markdown("#### ⚙️ **Operating Parameters**")
    
    # Train Speed
    speed_kmh = st.select_slider(
        "Train Speed (km/h)",
        options=[50.0, 100.0, 200.0, 300.0, 500.0],
        value=300.0,
        help="Simulated train velocity in high-speed rail scenario."
    )
    
    # Carrier Frequency
    carrier_freq_ghz = st.number_input(
        "Carrier Frequency (GHz)",
        min_value=1.0, max_value=6.0, value=2.6, step=0.1,
        help="Carrier frequency f_c (standard LTE/HSR 2.6 GHz)."
    )
    carrier_freq_hz = carrier_freq_ghz * 1e9
    
    # Live mathematical Doppler calculation
    calculated_fd = calculate_max_doppler(speed_kmh, carrier_freq_hz)
    v_mps = kmh_to_mps(speed_kmh)
    
    st.info(f"**Doppler Shift (Calculated):**\n\n$f_d = {calculated_fd:.1f}$ Hz\n\nVelocity: {v_mps:.1f} m/s")
    
    # SNR
    snr_db = st.slider(
        "Operating SNR (dB)",
        min_value=0.0, max_value=30.0, value=15.0, step=1.0,
        help="Signal-to-Noise Ratio (dB) for AWGN channel."
    )
    
    # Modulation
    modulation = st.selectbox(
        "Modulation Scheme",
        ["BPSK", "QPSK", "16-QAM"],
        index=1
    )
    
    # Pilot Mode and Spacing
    pilot_mode = st.selectbox(
        "Pilot Mode",
        ["SCATTERED", "FULL"],
        index=0
    )
    
    if pilot_mode == "SCATTERED":
        pilot_spacing = st.selectbox(
            "Pilot Spacing (Zpilot)",
            [1, 2, 3, 4, 5, 10],
            index=3,
            help="Pilot subcarrier period Zpilot in frequency domain."
        )
    else:
        pilot_spacing = 1
        
    # OFDM Symbols
    num_symbols = st.slider("OFDM Symbols per Frame", min_value=7, max_value=14, value=14, step=1)
    
    # Seed
    seed_val = st.number_input("Random Seed", min_value=1, max_value=999999, value=42, step=1)
    
    st.markdown("---")
    # Quick model status in sidebar
    model_exists = is_model_available()
    if model_exists:
        st.markdown('Model: <span class="badge-trained">READY (.keras)</span>', unsafe_allow_html=True)
    else:
        st.markdown('Model: <span class="badge-untrained">NOT TRAINED</span>', unsafe_allow_html=True)


# --------------------------------------------------------------------------------------
# Helper Header Banner
# --------------------------------------------------------------------------------------
def render_header(title_suffix: str = ""):
    st.markdown(f"""
    <div class="rail-header">
        <div>
            <h1>AI-RailLink {title_suffix}</h1>
            <p>Intelligent OFDM Channel Estimation for High-Speed Railway Networks</p>
        </div>
        <div>
            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px;">
                N = 64 Subcarriers | 14 Symbols
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ======================================================================================
# PAGE 1: 🏠 DASHBOARD
# ======================================================================================
if page == "🏠 Dashboard":
    render_header("Overview")
    
    # Quick check if simulation results exist, otherwise run initial simulation
    if st.session_state.sim_results is None:
        with st.spinner("Initializing baseline simulation with current parameters..."):
            active_model = get_active_model()
            st.session_state.sim_results = run_single_simulation(
                speed_kmh=speed_kmh,
                carrier_freq_hz=carrier_freq_hz,
                snr_db=snr_db,
                modulation=modulation,
                pilot_mode=pilot_mode,
                pilot_spacing=pilot_spacing,
                num_symbols=num_symbols,
                cnn_model=active_model,
                seed=seed_val
            )
            
    res = st.session_state.sim_results
    
    # Top 6 KPI Metric Cards
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    with c1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">🚆 Train Speed</div>
            <div class="metric-value">{res['speed_kmh']:.0f} <span style="font-size: 14px;">km/h</span></div>
            <div class="metric-sub">{kmh_to_mps(res['speed_kmh']):.1f} m/s</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">📡 Max Doppler</div>
            <div class="metric-value">{res['doppler_hz']:.1f} <span style="font-size: 14px;">Hz</span></div>
            <div class="metric-sub">f_c = {res['carrier_freq_hz']/1e9:.1f} GHz</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">📶 Channel SNR</div>
            <div class="metric-value">{res['snr_db']:.0f} <span style="font-size: 14px;">dB</span></div>
            <div class="metric-sub">{res['modulation']} Modulation</div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        cnn_badge = "Active (1D CNN)" if not res['cnn_used_fallback'] else "LS Fallback"
        badge_cls = "badge-trained" if not res['cnn_used_fallback'] else "badge-fallback"
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">🧠 CNN Status</div>
            <div class="metric-value" style="font-size: 17px; margin-top: 4px;"><span class="{badge_cls}">{cnn_badge}</span></div>
            <div class="metric-sub">{res['cnn_time_ms']:.2f} ms latency</div>
        </div>
        """, unsafe_allow_html=True)
    with c5:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">📊 Bit Error Rate</div>
            <div class="metric-value">{res['ber_cnn']:.4f}</div>
            <div class="metric-sub">LS BER: {res['ber_ls']:.4f}</div>
        </div>
        """, unsafe_allow_html=True)
    with c6:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">📈 Channel NMSE</div>
            <div class="metric-value">{res['nmse_cnn_db']:.1f} <span style="font-size: 14px;">dB</span></div>
            <div class="metric-sub">LS NMSE: {res['nmse_ls_db']:.1f} dB</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Main action and live quick test
    col_btn, col_info = st.columns([1, 3])
    with col_btn:
        if st.button("🚀 Quick Transmission Test", use_container_width=True):
            with st.spinner("Running complete physical layer transmission..."):
                active_model = get_active_model()
                st.session_state.sim_results = run_single_simulation(
                    speed_kmh=speed_kmh,
                    carrier_freq_hz=carrier_freq_hz,
                    snr_db=snr_db,
                    modulation=modulation,
                    pilot_mode=pilot_mode,
                    pilot_spacing=pilot_spacing,
                    num_symbols=num_symbols,
                    cnn_model=active_model,
                    seed=None
                )
                st.rerun()
    with col_info:
        p_info = res["pilot_metrics"]
        st.caption(f"Grid: **{p_info['total_subcarriers']} subcarriers** ({p_info['pilot_subcarriers']} pilots, {p_info['data_subcarriers']} data) | Overhead: **{p_info['pilot_overhead_pct']}%** | Transmitted Bits: **{res['total_bits']}**")
        
    # Dual Columns: LS vs CNN Summary & Quick Channel Response
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        st.markdown("### ⚖️ **Channel Estimator Comparison**")
        comp_df = pd.DataFrame({
            "Metric": ["Bit Error Rate (BER)", "Bit Errors Count", "NMSE (Linear)", "NMSE (dB)", "Computation Latency"],
            "Traditional LS": [
                f"{res['ber_ls']:.5f}",
                f"{res['bit_errors_ls']} / {res['total_bits']}",
                f"{res['nmse_ls']:.6f}",
                f"{res['nmse_ls_db']:.2f} dB",
                f"{res['ls_time_ms']:.2f} ms"
            ],
            "AI 1D CNN": [
                f"{res['ber_cnn']:.5f}",
                f"{res['bit_errors_cnn']} / {res['total_bits']}",
                f"{res['nmse_cnn']:.6f}",
                f"{res['nmse_cnn_db']:.2f} dB",
                f"{res['cnn_time_ms']:.2f} ms"
            ]
        })
        st.dataframe(comp_df, use_container_width=True, hide_index=True)
        
        # Mathematical NMSE difference calculation
        nmse_diff = res['nmse_ls'] - res['nmse_cnn']
        if nmse_diff > 0:
            st.success(f"✅ **1D CNN reduced NMSE by {nmse_diff:.6f}** compared to traditional LS with linear interpolation under {res['speed_kmh']:.0f} km/h Doppler fading.")
        elif nmse_diff < 0:
            st.info(f"ℹ️ **Traditional LS performed with {abs(nmse_diff):.6f} lower NMSE** under this specific low-noise / static condition.")
        else:
            st.info("ℹ️ Both estimators achieved identical NMSE under current parameters.")
            
    with col_right:
        st.markdown("### 📡 **Channel Frequency Response (Symbol 0)**")
        # Extract symbol 0 frequency response
        fig_cfr = plot_channel_frequency_response(
            res["true_cfr"][0], res["H_ls_grid"][0], res["H_cnn_grid"][0],
            pilot_indices=np.array(range(0, 64, pilot_spacing)) if pilot_mode == "SCATTERED" else None
        )
        st.plotly_chart(fig_cfr, use_container_width=True)


# ======================================================================================
# PAGE 2: 🚆 SIMULATOR
# ======================================================================================
elif page == "🚆 Simulator":
    render_header("Railway Communication Simulator")
    st.markdown("Run the complete high-speed railway OFDM physical layer pipeline and observe all processing stages in real time.")
    
    sim_col1, sim_col2 = st.columns([1, 2])
    
    with sim_col1:
        st.markdown("#### ⚙️ **Simulation Setup**")
        eq_method = st.radio("Equalizer Scheme", ["ZF (Zero-Forcing)", "MMSE"], index=0)
        interp_method = st.radio("LS Pilot Interpolation", ["linear", "cubic"], index=0)
        
        run_btn = st.button("▶️ RUN REAL SIMULATION", use_container_width=True)
        
    with sim_col2:
        st.markdown("#### 📋 **Pipeline Status**")
        status_box = st.empty()
        status_box.info("Ready to execute. Click **RUN REAL SIMULATION** to begin.")
        
    if run_btn:
        progress_bar = st.progress(0)
        
        # 1. Pipeline Steps with live status
        status_box.markdown("⏳ **Step 1/10**: Generating random binary bits...")
        progress_bar.progress(10)
        time.sleep(0.05)
        
        status_box.markdown(f"⏳ **Step 2/10**: Modulating bits using {modulation} mapping...")
        progress_bar.progress(20)
        time.sleep(0.05)
        
        status_box.markdown(f"⏳ **Step 3/10**: Constructing OFDM grid with {pilot_mode} pilot arrangement...")
        progress_bar.progress(30)
        time.sleep(0.05)
        
        status_box.markdown("⏳ **Step 4/10**: Performing IFFT and appending 16-sample cyclic prefix...")
        progress_bar.progress(40)
        time.sleep(0.05)
        
        status_box.markdown(f"⏳ **Step 5/10**: Applying High-Speed Railway channel (Winner-II multipath, speed = {speed_kmh} km/h)...")
        progress_bar.progress(50)
        time.sleep(0.05)
        
        status_box.markdown(f"⏳ **Step 6/10**: Simulating Doppler phase rotation (f_d = {calculated_fd:.1f} Hz) and AWGN noise (SNR = {snr_db} dB)...")
        progress_bar.progress(60)
        time.sleep(0.05)
        
        status_box.markdown("⏳ **Step 7/10**: Removing cyclic prefix and executing receiver FFT...")
        progress_bar.progress(70)
        time.sleep(0.05)
        
        status_box.markdown("⏳ **Step 8/10**: Estimating channel via Traditional Least Squares (LS)...")
        progress_bar.progress(80)
        
        # Run actual computation
        active_model = get_active_model()
        sim_res = run_single_simulation(
            speed_kmh=speed_kmh,
            carrier_freq_hz=carrier_freq_hz,
            snr_db=snr_db,
            modulation=modulation,
            pilot_mode=pilot_mode,
            pilot_spacing=pilot_spacing,
            num_symbols=num_symbols,
            interp_method=interp_method,
            equalizer_method="ZF" if "ZF" in eq_method else "MMSE",
            cnn_model=active_model,
            seed=seed_val
        )
        st.session_state.sim_results = sim_res
        
        status_box.markdown("⏳ **Step 9/10**: Running 1D CNN channel prediction & equalization...")
        progress_bar.progress(90)
        time.sleep(0.05)
        
        status_box.markdown("✅ **Step 10/10**: Demodulating bits and computing exact BER & NMSE. Complete!")
        progress_bar.progress(100)
        time.sleep(0.1)
        
    if st.session_state.sim_results is not None:
        res = st.session_state.sim_results
        
        st.markdown("---")
        st.markdown("### 📊 **Simulation Results & Comparison**")
        
        mc1, mc2, mc3, mc4 = st.columns(4)
        with mc1:
            st.metric("Doppler Shift (f_d)", f"{res['doppler_hz']:.1f} Hz", f"Speed: {res['speed_kmh']} km/h")
        with mc2:
            st.metric("LS BER", f"{res['ber_ls']:.5f}", f"{res['bit_errors_ls']} errors")
        with mc3:
            st.metric("1D CNN BER", f"{res['ber_cnn']:.5f}", f"{res['bit_errors_cnn']} errors")
        with mc4:
            st.metric("CNN Inference Time", f"{res['cnn_time_ms']:.2f} ms", "CPU inference")
            
        # Tabs for detailed graphs
        tab1, tab2, tab3 = st.tabs(["🌌 Constellation Scatter", "📈 Channel Frequency Response", "📋 Subcarrier Allocation"])
        
        with tab1:
            fig_const = plot_constellation(
                res["tx_data_symbols"], res["rx_data_symbols"],
                res["eq_syms_ls"], res["eq_syms_cnn"]
            )
            st.plotly_chart(fig_const, use_container_width=True)
            st.caption("Comparison of transmitted constellation points, distorted received symbols (showing multipath rotation and noise), and the equalized constellations after LS vs 1D CNN channel compensation.")
            
        with tab2:
            cfr_col1, cfr_col2 = st.columns([3, 1])
            with cfr_col2:
                selected_sym = st.slider("OFDM Symbol Index", 0, res["true_cfr"].shape[0] - 1, 0)
                plot_phase_toggle = st.checkbox("Show Unwrapped Phase", value=False)
                
            with cfr_col1:
                fig_cfr_detail = plot_channel_frequency_response(
                    res["true_cfr"][selected_sym],
                    res["H_ls_grid"][selected_sym],
                    res["H_cnn_grid"][selected_sym],
                    pilot_indices=np.array(range(0, 64, pilot_spacing)) if pilot_mode == "SCATTERED" else None,
                    plot_phase=plot_phase_toggle
                )
                st.plotly_chart(fig_cfr_detail, use_container_width=True)
                
        with tab3:
            st.markdown("#### Pilot vs Data Subcarrier Configuration")
            p_metrics = res["pilot_metrics"]
            st.write(f"- **Total Subcarriers ($N$):** {p_metrics['total_subcarriers']}")
            st.write(f"- **Pilot Subcarriers ($N_p$):** {p_metrics['pilot_subcarriers']}")
            st.write(f"- **Data Subcarriers ($N_d$):** {p_metrics['data_subcarriers']}")
            st.write(f"- **Pilot Overhead:** {p_metrics['pilot_overhead_pct']}%")
            
            # Allocation table
            sub_types = ["Pilot" if k in range(0, 64, pilot_spacing) else "Data" for k in range(64)]
            sub_df = pd.DataFrame({
                "Subcarrier Index": list(range(64)),
                "Type": sub_types,
                "Frequency Offset (kHz)": [f"{(k - 32) * 15:.1f}" for k in range(64)]
            })
            st.dataframe(sub_df.T, use_container_width=True)


# ======================================================================================
# PAGE 3: 🧠 AI TRAINING
# ======================================================================================
elif page == "🧠 AI Training":
    render_header("AI Model Training")
    st.markdown("Generate synthetic High-Speed Railway channel datasets and train a real 1D Convolutional Neural Network (CNN) estimator.")
    
    # Model Status Banner
    model_exists = is_model_available()
    status_col1, status_col2 = st.columns([2, 1])
    
    with status_col1:
        if model_exists:
            m_size_kb = os.path.getsize(DEFAULT_MODEL_PATH) / 1024
            st.success(f"**Model Status: TRAINED** | File: `{DEFAULT_MODEL_PATH}` ({m_size_kb:.1f} KB)")
        else:
            st.warning("**Model Status: NOT TRAINED YET**. Generate a dataset and train the CNN below to activate AI channel estimation.")
            
    with status_col2:
        if model_exists and st.button("🔄 Retrain From Scratch"):
            st.session_state.model_cache = None
            if os.path.exists(DEFAULT_MODEL_PATH):
                os.remove(DEFAULT_MODEL_PATH)
            st.rerun()
            
    st.markdown("---")
    
    # Section 1: Dataset Generation
    st.markdown("### 1️⃣ **Generate Synthetic HSR Dataset**")
    d_col1, d_col2, d_col3 = st.columns(3)
    with d_col1:
        dataset_size = st.select_slider("Dataset Sample Size", options=[300, 500, 1000, 2000], value=500)
    with d_col2:
        snr_train_range = st.slider("SNR Range (dB)", min_value=0.0, max_value=30.0, value=(0.0, 30.0), step=5.0)
    with d_col3:
        speed_train_range = st.slider("Speed Range (km/h)", min_value=50.0, max_value=500.0, value=(50.0, 500.0), step=50.0)
        
    gen_btn = st.button("📦 Generate Dataset", use_container_width=False)
    
    if gen_btn:
        d_prog = st.progress(0)
        d_status = st.empty()
        
        def update_d_progress(pct, msg):
            d_prog.progress(int(pct * 100))
            d_status.text(msg)
            
        with st.spinner("Generating synthetic railway channel dataset..."):
            X_tr, Y_tr, X_v, Y_v, X_te, Y_te = generate_channel_dataset(
                num_samples=dataset_size,
                snr_range_db=snr_train_range,
                speed_range_kmh=speed_train_range,
                pilot_mode=pilot_mode,
                pilot_spacing=pilot_spacing,
                seed=seed_val,
                progress_callback=update_d_progress
            )
            saved_path = save_dataset(X_tr, Y_tr, X_v, Y_v, X_te, Y_te)
            d_status.success(f"✅ Generated and saved dataset with {len(X_tr)} train, {len(X_v)} validation, and {len(X_te)} test samples to `{saved_path}`.")
            
    # Section 2: Model Training
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("### 2️⃣ **Train 1D CNN Channel Estimator**")
    
    loaded_data = load_dataset()
    if loaded_data is None:
        st.info("ℹ️ Please generate a dataset above first to begin training.")
    else:
        X_train, Y_train, X_val, Y_val, X_test, Y_test = loaded_data
        st.caption(f"Loaded Dataset: Train = {X_train.shape[0]} samples | Val = {X_val.shape[0]} | Test = {X_test.shape[0]} | Input Shape: (64, 2)")
        
        t_col1, t_col2, t_col3 = st.columns(3)
        with t_col1:
            epochs = st.slider("Epochs", min_value=5, max_value=40, value=15, step=5)
        with t_col2:
            batch_size = st.select_slider("Batch Size", options=[16, 32, 64], value=32)
        with t_col3:
            st.write("")
            st.write("")
            train_btn = st.button("🔥 Train CNN Model", use_container_width=True)
            
        if train_btn:
            with st.spinner("Compiling and training 1D CNN on CPU..."):
                model = build_1d_cnn_model(input_shape=(64, 2))
                
                # Custom callback to stream epoch loss to Streamlit
                import keras
                loss_ph = st.empty()
                
                class StreamlitCallback(keras.callbacks.Callback):
                    def on_epoch_end(self, epoch, logs=None):
                        logs = logs or {}
                        loss_ph.info(f"Epoch {epoch+1}/{epochs} - Loss (MSE): {logs.get('loss', 0):.6f} | Val Loss: {logs.get('val_loss', 0):.6f} | MAE: {logs.get('mae', 0):.6f}")
                        
                history = train_cnn_model(
                    model, X_train, Y_train, X_val, Y_val,
                    epochs=epochs,
                    batch_size=batch_size,
                    callbacks=[StreamlitCallback()]
                )
                
                # Save trained model
                saved_model_path = save_trained_model(model)
                st.session_state.model_cache = model
                st.session_state.training_history = history.history
                
                # Evaluate on test set
                test_loss, test_mae, test_mse = model.evaluate(X_test, Y_test, verbose=0)
                
                st.success(f"🎉 Model successfully trained and saved to `{saved_model_path}`! Test MSE: **{test_mse:.6f}** | Test MAE: **{test_mae:.6f}**")
                
        # Display training loss curves if history exists
        if st.session_state.training_history is not None:
            fig_hist = plot_training_history(st.session_state.training_history)
            st.plotly_chart(fig_hist, use_container_width=True)


# ======================================================================================
# PAGE 4: 📡 CHANNEL ANALYSIS
# ======================================================================================
elif page == "📡 Channel Analysis":
    render_header("Wireless Channel Diagnostics")
    st.markdown("Detailed physical layer diagnostics of high-speed railway propagation: Doppler frequency shift, multipath fading profile, and time-frequency channel variations.")
    
    ca_col1, ca_col2 = st.columns([1, 1])
    
    with ca_col1:
        st.markdown("### 🚄 **Doppler Shift vs. Train Speed**")
        fig_dop = plot_doppler_curve(carrier_freq_ghz=carrier_freq_ghz, current_speed=speed_kmh)
        st.plotly_chart(fig_dop, use_container_width=True)
        
        # Doppler Table
        d_table = get_doppler_table(carrier_freq_hz)
        st.dataframe(pd.DataFrame(d_table), use_container_width=True, hide_index=True)
        
    with ca_col2:
        st.markdown("### 📶 **Multipath Power Delay Profile (PDP)**")
        fig_pdp = plot_multipath_profile(
            np.array(RailwayMultipathProfile.DEFAULT_DELAYS),
            np.array(RailwayMultipathProfile.DEFAULT_POWERS_DB)
        )
        st.plotly_chart(fig_pdp, use_container_width=True)
        
        st.markdown(r"""
        **Channel Profile Details (Winner-II Inspired):**
        - **Dominant Path (Tap 0):** Direct Line-of-Sight (LOS) with Rician $K$-factor = $6.0$ dB ($\theta_0 = 0^\circ$).
        - **Scattered Paths (Taps 1-4):** Rayleigh fading reflections from catenary poles, viaduct edges, and track ballast.
        - **Delay Spread:** Max delay = 11 samples ($< N_{cp} = 16$ to prevent Inter-Symbol Interference).
        """)
        
    st.markdown("---")
    st.markdown("### 🌊 **Theoretical Jakes Doppler Spectrum**")
    freqs, psd = get_jakes_doppler_spectrum(calculated_fd, num_points=200)
    
    import plotly.graph_objects as go
    fig_jakes = go.Figure()
    fig_jakes.add_trace(go.Scatter(
        x=freqs, y=psd, mode="lines",
        line=dict(color="#2d6a4f", width=2.5),
        name="Doppler PSD"
    ))
    fig_jakes.update_layout(
        title=dict(text=f"Jakes' Doppler Power Spectral Density (Max Doppler = {calculated_fd:.1f} Hz)", font=dict(family="Inter", size=15, color="#1b4332")),
        xaxis=dict(title="Doppler Frequency (Hz)", showgrid=True, gridcolor="#e9ecef"),
        yaxis=dict(title="Normalized PSD", showgrid=True, gridcolor="#e9ecef"),
        plot_bgcolor="#ffffff", paper_bgcolor="#ffffff", height=320
    )
    st.plotly_chart(fig_jakes, use_container_width=True)


# ======================================================================================
# PAGE 5: 📊 PERFORMANCE BENCHMARK
# ======================================================================================
elif page == "📊 Performance":
    render_header("Performance Benchmark")
    st.markdown("Automated multi-condition simulation benchmark across SNR range (0–30 dB) and train speeds. Every point on the graph is computed from real Monte Carlo transmissions.")
    
    b_col1, b_col2, b_col3 = st.columns([1, 1, 1])
    with b_col1:
        test_snrs = st.multiselect("SNRs to Test (dB)", [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0], default=[0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0])
    with b_col2:
        runs_per_pt = st.select_slider("Runs per SNR point (Averaging)", options=[1, 2, 3, 5], value=2)
    with b_col3:
        st.write("")
        st.write("")
        bench_btn = st.button("🚀 Run Full Performance Benchmark", use_container_width=True)
        
    if bench_btn:
        active_model = get_active_model()
        b_prog = st.progress(0)
        b_status = st.empty()
        
        def update_bench_progress(pct, msg):
            b_prog.progress(int(pct * 100))
            b_status.text(msg)
            
        with st.spinner("Executing real physical layer simulations across SNR range..."):
            bench_results = run_snr_performance_sweep(
                snr_list=sorted(test_snrs),
                speed_kmh=speed_kmh,
                carrier_freq_hz=carrier_freq_hz,
                modulation=modulation,
                pilot_mode=pilot_mode,
                pilot_spacing=pilot_spacing,
                num_symbols=num_symbols,
                num_runs_per_snr=runs_per_pt,
                cnn_model=active_model,
                progress_callback=update_bench_progress
            )
            st.session_state.bench_results = bench_results
            b_status.success("✅ Performance benchmark completed successfully!")
            
    if st.session_state.bench_results is not None:
        bres = st.session_state.bench_results
        
        st.markdown("---")
        chart_c1, chart_c2 = st.columns(2)
        
        with chart_c1:
            fig_ber_snr = plot_ber_vs_snr(bres["snr_db"], bres["ber_ls"], bres["ber_cnn"])
            st.plotly_chart(fig_ber_snr, use_container_width=True)
            
        with chart_c2:
            fig_nmse_snr = plot_nmse_vs_snr(bres["snr_db"], bres["nmse_ls_db"], bres["nmse_cnn_db"])
            st.plotly_chart(fig_nmse_snr, use_container_width=True)
            
        st.markdown("### 📋 **Benchmark Numerical Data**")
        b_df = pd.DataFrame({
            "SNR (dB)": bres["snr_db"],
            "LS BER": [f"{b:.5f}" for b in bres["ber_ls"]],
            "1D CNN BER": [f"{b:.5f}" for b in bres["ber_cnn"]],
            "LS NMSE (dB)": [f"{n:.2f}" for n in bres["nmse_ls_db"]],
            "1D CNN NMSE (dB)": [f"{n:.2f}" for n in bres["nmse_cnn_db"]],
        })
        st.dataframe(b_df, use_container_width=True, hide_index=True)


# ======================================================================================
# PAGE 6: ℹ️ ABOUT & RESEARCH REFERENCE
# ======================================================================================
elif page == "ℹ️ About":
    render_header("Research & Theoretical Foundation")
    
    st.markdown("""
    ### 📖 **Research Reference**
    This project is inspired by the research paper:
    
    > **"Deep Learning-Based Channel Estimation With 1D CNN for OFDM Systems Under High-Speed Railway Environments"**  
    > *IEEE Access / High-Speed Railway Communication Systems.*
    
    ---
    
    ### 🚆 **High-Speed Railway Communication Challenges**
    High-Speed Railway (HSR) environments introduce extreme physical layer wireless challenges:
    1. **Severe Doppler Effect:** At speeds of $300 - 500$ km/h, the maximum Doppler shift reaches $700 - 1200$ Hz at $2.6$ GHz:
       $$f_d = \\frac{v}{c} \\cdot f_c$$
       This causes rapid time-variation within OFDM symbol blocks and breaks subcarrier orthogonality, resulting in **Inter-Carrier Interference (ICI)**.
    2. **Multipath Delay Spread:** Reflections from viaducts, cutting walls, catenary structures, and ballast produce frequency-selective fading.
    3. **Pilot Overhead Constraints:** Using full pilots at all subcarriers wastes bandwidth. Scattered pilots reduce overhead but suffer from interpolation errors under rapid fading.
    
    ---
    
    ### 🧠 **Why 1D CNN for Channel Estimation?**
    Traditional **Least Squares (LS)** channel estimation calculates:
    $$\\hat{H}_{LS}[p] = \\frac{Y[p]}{X_{pilot}[p]}$$
    For non-pilot subcarriers, linear or cubic interpolation is required. However:
    - LS amplifies noise at subcarriers with low channel gains.
    - Interpolation fails to capture high Doppler curvature and ICI distortion between distant pilots.
    
    **The 1D CNN Solution:**
    - The 1D CNN operates on the concatenated real and imaginary channel features: $[\\text{Re}(\\hat{H}_{LS}), \\text{Im}(\\hat{H}_{LS})]$.
    - 1D convolutional kernels learn spatial correlations across subcarriers, acting as a deep adaptive filter that denoises the channel response and reconstructs non-pilot subcarriers with significantly lower NMSE.
    
    ---
    
    ### 🔍 **Research Transparency: Paper vs. Student Implementation**
    In adherence to strict academic honesty, here is the clear distinction between the published research paper and this software implementation:
    
    | Aspect | IEEE Research Paper | Our Student Implementation (AI-RailLink) |
    | :--- | :--- | :--- |
    | **Channel Model** | Measured / Ray-tracing HSR channels | Winner-II inspired Rician multipath simulation with deterministic Doppler |
    | **Pilot Structure** | Scattered pilots with spacing $Z_{pilot}$ | Scattered pilots ($Z_{pilot} \\in \\{1, 2, 3, 5, 10\\}$) and Full pilot modes |
    | **Deep Learning** | 1D CNN regression architecture | Lightweight CPU-optimized 1D CNN (`Conv1D` + `Dense`) trained in real-time |
    | **Execution Environment** | High-performance GPU cluster | Single CPU-friendly laptop with Streamlit + TensorFlow |
    | **Calculations** | Research dataset metrics | 100% real-time Python math (no hardcoded/fake values) |
    
    ---
    
    ### 💻 **System Architecture**
    ```
    [ Random Bits ] 
           ↓
    [ Modulation (BPSK/QPSK/16-QAM) ]
           ↓
    [ Pilot Insertion (Full / Scattered) ]
           ↓
    [ 64-Point IFFT + 16-Sample CP ]
           ↓
    [ High-Speed Railway Channel (Winner-II Multipath + Doppler + AWGN) ]
           ↓
    [ CP Removal + 64-Point FFT ]
           ↓
    ┌──────────────────────┴──────────────────────┐
    ↓                                             ↓
    [ Traditional LS Estimation ]         [ 1D CNN AI Estimator ]
    [ + Spline Interpolation ]            [ Feature Denoising ]
    └──────────────────────┬──────────────────────┘
                           ↓
              [ Equalization (ZF / MMSE) ]
                           ↓
             [ Demodulation & BER / NMSE ]
    ```
    """)
