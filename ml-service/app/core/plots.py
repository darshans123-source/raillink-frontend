"""Plotly visualization utilities for AI-RailLink.

Provides clean, publication-grade interactive charts matching the light railway theme:
- Deep railway green (#1b4332, #2d6a4f)
- Mint / Emerald accent (#52b788, #74c69d)
- Coral / Crimson accent for LS / Errors (#e63946)
- Steel blue accent (#1d3557, #457b9d)
"""

from typing import Dict, List, Optional
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots


# Color constants for consistent styling
COLOR_TRUE = "#1d3557"    # Steel navy for Ground Truth
COLOR_LS = "#e63946"      # Coral crimson for Traditional LS
COLOR_CNN = "#2d6a4f"     # Deep emerald green for 1D CNN
COLOR_MINT = "#52b788"    # Mint green
COLOR_BG = "#ffffff"
COLOR_GRID = "#e9ecef"


def _base_layout(title: str, xlabel: str, ylabel: str) -> go.Layout:
    """Returns standard base layout styling."""
    return go.Layout(
        title=dict(text=title, font=dict(family="Inter, Roboto, sans-serif", size=16, color="#1b4332")),
        xaxis=dict(title=xlabel, showgrid=True, gridcolor=COLOR_GRID, linecolor="#adb5bd", zeroline=False),
        yaxis=dict(title=ylabel, showgrid=True, gridcolor=COLOR_GRID, linecolor="#adb5bd", zeroline=False),
        plot_bgcolor=COLOR_BG,
        paper_bgcolor=COLOR_BG,
        font=dict(family="Inter, Roboto, sans-serif", color="#2b2d42", size=12),
        margin=dict(l=50, r=30, t=50, b=50),
        legend=dict(
            bgcolor="rgba(255,255,255,0.9)",
            bordercolor="#e2e8f0",
            borderwidth=1,
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        )
    )


def plot_constellation(tx_symbols: np.ndarray,
                       rx_symbols: np.ndarray,
                       eq_ls_symbols: np.ndarray,
                       eq_cnn_symbols: np.ndarray,
                       max_points: int = 500) -> go.Figure:
    """Plots constellation scatter diagrams comparing Tx, Rx, Equalized (LS), and Equalized (CNN)."""
    fig = make_subplots(
        rows=1, cols=4,
        subplot_titles=("Transmitted (Tx)", "Received (Distorted + Noise)", "Equalized (LS)", "Equalized (1D CNN)"),
        horizontal_spacing=0.06
    )
    
    # Subsample if too many points for speed
    n_pts = min(len(tx_symbols), max_points) if len(tx_symbols) > 0 else 0
    indices = np.random.choice(len(tx_symbols), n_pts, replace=False) if n_pts > 0 else []
    
    if n_pts > 0:
        # 1. Transmitted
        fig.add_trace(go.Scatter(
            x=np.real(tx_symbols[indices]), y=np.imag(tx_symbols[indices]),
            mode="markers", marker=dict(size=6, color=COLOR_TRUE, symbol="circle"),
            name="Tx Ideal", showlegend=False
        ), row=1, col=1)
        
        # 2. Received
        fig.add_trace(go.Scatter(
            x=np.real(rx_symbols[indices]), y=np.imag(rx_symbols[indices]),
            mode="markers", marker=dict(size=4, color="#e76f51", opacity=0.6, symbol="x"),
            name="Rx Distorted", showlegend=False
        ), row=1, col=2)
        
        # 3. Equalized LS
        fig.add_trace(go.Scatter(
            x=np.real(eq_ls_symbols[indices]), y=np.imag(eq_ls_symbols[indices]),
            mode="markers", marker=dict(size=5, color=COLOR_LS, opacity=0.7, symbol="diamond"),
            name="Equalized LS", showlegend=False
        ), row=1, col=3)
        
        # 4. Equalized CNN
        fig.add_trace(go.Scatter(
            x=np.real(eq_cnn_symbols[indices]), y=np.imag(eq_cnn_symbols[indices]),
            mode="markers", marker=dict(size=5, color=COLOR_CNN, opacity=0.7, symbol="circle"),
            name="Equalized CNN", showlegend=False
        ), row=1, col=4)
        
    for c in range(1, 5):
        fig.update_xaxes(title_text="In-Phase (I)", range=[-2.2, 2.2], showgrid=True, gridcolor=COLOR_GRID, row=1, col=c)
        fig.update_yaxes(title_text="Quadrature (Q)", range=[-2.2, 2.2], showgrid=True, gridcolor=COLOR_GRID, row=1, col=c)
        
    fig.update_layout(
        title=dict(text="Constellation Diagram Comparison", font=dict(family="Inter", size=16, color="#1b4332")),
        plot_bgcolor=COLOR_BG,
        paper_bgcolor=COLOR_BG,
        height=380,
        margin=dict(l=40, r=40, t=60, b=40)
    )
    return fig


def plot_channel_frequency_response(true_cfr_sym: np.ndarray,
                                   ls_cfr_sym: np.ndarray,
                                   cnn_cfr_sym: np.ndarray,
                                   pilot_indices: Optional[np.ndarray] = None,
                                   plot_phase: bool = False) -> go.Figure:
    """Plots the Channel Frequency Response (CFR) across 64 subcarriers."""
    N = len(true_cfr_sym)
    subcarrier_indices = np.arange(N)
    
    if not plot_phase:
        # Magnitude
        y_true = np.abs(true_cfr_sym)
        y_ls = np.abs(ls_cfr_sym)
        y_cnn = np.abs(cnn_cfr_sym)
        ylabel = "Magnitude |H(k)|"
        title = "Channel Frequency Response Magnitude: True vs. LS vs. 1D CNN"
    else:
        # Phase
        y_true = np.unwrap(np.angle(true_cfr_sym))
        y_ls = np.unwrap(np.angle(ls_cfr_sym))
        y_cnn = np.unwrap(np.angle(cnn_cfr_sym))
        ylabel = "Unwrapped Phase (radians)"
        title = "Channel Frequency Response Phase: True vs. LS vs. 1D CNN"
        
    fig = go.Figure()
    
    # Ground Truth
    fig.add_trace(go.Scatter(
        x=subcarrier_indices, y=y_true,
        mode="lines", line=dict(color=COLOR_TRUE, width=3),
        name="Ground Truth H(k)"
    ))
    
    # Traditional LS
    fig.add_trace(go.Scatter(
        x=subcarrier_indices, y=y_ls,
        mode="lines+markers", line=dict(color=COLOR_LS, width=1.8, dash="dash"),
        marker=dict(size=5, symbol="x"),
        name="LS Estimate"
    ))
    
    # 1D CNN
    fig.add_trace(go.Scatter(
        x=subcarrier_indices, y=y_cnn,
        mode="lines+markers", line=dict(color=COLOR_CNN, width=2.5),
        marker=dict(size=4, symbol="circle"),
        name="1D CNN Estimate"
    ))
    
    # Highlight pilot subcarriers
    if pilot_indices is not None and len(pilot_indices) < N and not plot_phase:
        fig.add_trace(go.Scatter(
            x=pilot_indices, y=y_true[pilot_indices],
            mode="markers", marker=dict(size=8, color="#f59e0b", symbol="star"),
            name="Pilot Subcarriers"
        ))
        
    layout = _base_layout(title, "Subcarrier Index (k)", ylabel)
    fig.update_layout(layout)
    fig.update_layout(height=420)
    return fig


def plot_ber_vs_snr(snr_list: List[float], ber_ls: List[float], ber_cnn: List[float]) -> go.Figure:
    """Plots Bit Error Rate (BER) vs SNR on a semi-logarithmic scale."""
    fig = go.Figure()
    
    # Use small floor value to avoid log(0)
    floor_ber = 1e-5
    ber_ls_plot = [max(b, floor_ber) for b in ber_ls]
    ber_cnn_plot = [max(b, floor_ber) for b in ber_cnn]
    
    fig.add_trace(go.Scatter(
        x=snr_list, y=ber_ls_plot,
        mode="lines+markers", line=dict(color=COLOR_LS, width=2.5, dash="dash"),
        marker=dict(size=8, symbol="diamond"),
        name="Traditional LS"
    ))
    
    fig.add_trace(go.Scatter(
        x=snr_list, y=ber_cnn_plot,
        mode="lines+markers", line=dict(color=COLOR_CNN, width=3),
        marker=dict(size=8, symbol="circle"),
        name="AI 1D CNN"
    ))
    
    layout = _base_layout("Bit Error Rate (BER) vs. SNR", "SNR (dB)", "Bit Error Rate (BER)")
    fig.update_layout(layout)
    fig.update_yaxes(type="log", range=[-5.1, 0.1], dtick=1)
    fig.update_layout(height=420)
    return fig


def plot_nmse_vs_snr(snr_list: List[float], nmse_ls_db: List[float], nmse_cnn_db: List[float]) -> go.Figure:
    """Plots Normalized Mean Squared Error (NMSE) in dB vs SNR."""
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=snr_list, y=nmse_ls_db,
        mode="lines+markers", line=dict(color=COLOR_LS, width=2.5, dash="dash"),
        marker=dict(size=8, symbol="diamond"),
        name="Traditional LS"
    ))
    
    fig.add_trace(go.Scatter(
        x=snr_list, y=nmse_cnn_db,
        mode="lines+markers", line=dict(color=COLOR_CNN, width=3),
        marker=dict(size=8, symbol="circle"),
        name="AI 1D CNN"
    ))
    
    layout = _base_layout("Normalized Mean Squared Error (NMSE) vs. SNR", "SNR (dB)", "NMSE (dB)")
    fig.update_layout(layout)
    fig.update_layout(height=420)
    return fig


def plot_speed_comparison(speeds: List[float],
                          ber_ls: List[float],
                          ber_cnn: List[float],
                          nmse_ls: List[float],
                          nmse_cnn: List[float]) -> go.Figure:
    """Dual-panel plot for BER vs Speed and NMSE vs Speed."""
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=("BER vs Train Speed (km/h)", "NMSE (Linear) vs Train Speed (km/h)"),
        horizontal_spacing=0.1
    )
    
    # 1. BER vs Speed
    fig.add_trace(go.Scatter(
        x=speeds, y=ber_ls, mode="lines+markers",
        line=dict(color=COLOR_LS, width=2.5, dash="dash"), marker=dict(size=7),
        name="LS - BER"
    ), row=1, col=1)
    
    fig.add_trace(go.Scatter(
        x=speeds, y=ber_cnn, mode="lines+markers",
        line=dict(color=COLOR_CNN, width=2.8), marker=dict(size=7),
        name="1D CNN - BER"
    ), row=1, col=1)
    
    # 2. NMSE vs Speed
    fig.add_trace(go.Scatter(
        x=speeds, y=nmse_ls, mode="lines+markers",
        line=dict(color=COLOR_LS, width=2.5, dash="dash"), marker=dict(size=7),
        name="LS - NMSE"
    ), row=1, col=2)
    
    fig.add_trace(go.Scatter(
        x=speeds, y=nmse_cnn, mode="lines+markers",
        line=dict(color=COLOR_CNN, width=2.8), marker=dict(size=7),
        name="1D CNN - NMSE"
    ), row=1, col=2)
    
    fig.update_xaxes(title_text="Train Speed (km/h)", showgrid=True, gridcolor=COLOR_GRID, row=1, col=1)
    fig.update_yaxes(title_text="Bit Error Rate (BER)", showgrid=True, gridcolor=COLOR_GRID, row=1, col=1)
    
    fig.update_xaxes(title_text="Train Speed (km/h)", showgrid=True, gridcolor=COLOR_GRID, row=1, col=2)
    fig.update_yaxes(title_text="NMSE (Linear)", showgrid=True, gridcolor=COLOR_GRID, row=1, col=2)
    
    fig.update_layout(
        title=dict(text="High-Speed Railway Mobility Impact on Channel Estimation", font=dict(family="Inter", size=16, color="#1b4332")),
        plot_bgcolor=COLOR_BG,
        paper_bgcolor=COLOR_BG,
        height=400,
        margin=dict(l=50, r=30, t=60, b=50),
        legend=dict(orientation="h", yanchor="bottom", y=1.05, xanchor="right", x=1)
    )
    return fig


def plot_doppler_curve(carrier_freq_ghz: float = 2.6, current_speed: float = 300.0) -> go.Figure:
    """Plots theoretical Doppler shift across train speeds from 0 to 600 km/h."""
    speeds = np.linspace(0, 600, 100)
    # f_d = (v / 3.6 / c) * fc
    carrier_hz = carrier_freq_ghz * 1e9
    dopplers = (speeds / 3.6 / 3.0e8) * carrier_hz
    
    current_doppler = (current_speed / 3.6 / 3.0e8) * carrier_hz
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=speeds, y=dopplers,
        mode="lines", line=dict(color="#2d6a4f", width=3),
        name=f"f_d = (v/c) * {carrier_freq_ghz} GHz"
    ))
    
    # Highlight current operating point
    fig.add_trace(go.Scatter(
        x=[current_speed], y=[current_doppler],
        mode="markers+text",
        marker=dict(size=12, color="#e63946", symbol="star"),
        text=[f"{current_speed} km/h: {current_doppler:.1f} Hz"],
        textposition="top left",
        name="Operating Point"
    ))
    
    layout = _base_layout(f"Maximum Doppler Shift vs. Train Speed (f_c = {carrier_freq_ghz} GHz)",
                          "Train Speed (km/h)", "Max Doppler Shift (Hz)")
    fig.update_layout(layout)
    fig.update_layout(height=380)
    return fig


def plot_training_history(history_dict: Dict[str, List[float]]) -> go.Figure:
    """Plots training and validation MSE / Loss across epochs."""
    fig = go.Figure()
    epochs = list(range(1, len(history_dict.get("loss", [])) + 1))
    
    if "loss" in history_dict:
        fig.add_trace(go.Scatter(
            x=epochs, y=history_dict["loss"],
            mode="lines+markers", line=dict(color="#2d6a4f", width=2.5),
            marker=dict(size=6), name="Training Loss (MSE)"
        ))
        
    if "val_loss" in history_dict:
        fig.add_trace(go.Scatter(
            x=epochs, y=history_dict["val_loss"],
            mode="lines+markers", line=dict(color="#e63946", width=2.5, dash="dash"),
            marker=dict(size=6), name="Validation Loss (MSE)"
        ))
        
    layout = _base_layout("1D CNN Training Convergence (Mean Squared Error)", "Epoch", "Loss (MSE)")
    fig.update_layout(layout)
    fig.update_layout(height=380)
    return fig


def plot_multipath_profile(delays: np.ndarray, powers_db: np.ndarray) -> go.Figure:
    """Plots the discrete multipath Power Delay Profile (PDP)."""
    fig = go.Figure()
    
    for tau, p in zip(delays, powers_db):
        fig.add_trace(go.Scatter(
            x=[tau, tau], y=[-20.0, p],
            mode="lines", line=dict(color="#2d6a4f", width=3),
            showlegend=False
        ))
        
    fig.add_trace(go.Scatter(
        x=delays, y=powers_db,
        mode="markers", marker=dict(size=10, color="#1b4332", symbol="circle"),
        name="Multipath Taps"
    ))
    
    layout = _base_layout("Railway Multipath Power Delay Profile (Winner-II HSR)", "Delay (Samples)", "Relative Power (dB)")
    fig.update_layout(layout)
    fig.update_yaxes(range=[-22, 2])
    fig.update_layout(height=350)
    return fig
