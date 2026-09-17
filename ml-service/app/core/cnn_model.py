"""1D CNN Deep Learning Channel Estimator for High-Speed Railway OFDM Systems.

Architecture matches the lightweight, CPU-friendly specification:
    Input (64, 2)
    -> Conv1D (32 filters, kernel 5, ReLU)
    -> MaxPooling1D (pool 2)
    -> Conv1D (64 filters, kernel 3, ReLU)
    -> Flatten
    -> Dense (128, ReLU)
    -> Dense (128, Linear)
    -> Reshape (64, 2)

Input: Real and Imaginary components of LS estimate [Real(H_ls), Imag(H_ls)].
Output: Denoised Real and Imaginary true CFR [Real(H_hat), Imag(H_hat)].
"""

from typing import Tuple, Optional, Dict, Any
import os
import time
import numpy as np

# Lazy imports for TensorFlow to avoid startup overhead if only LS is run
_tf = None
_keras = None


def _get_tf():
    """Lazily loads TensorFlow and Keras."""
    global _tf, _keras
    if _tf is None:
        import tensorflow as tf
        import keras
        _tf = tf
        _keras = keras
    return _tf, _keras


# Search for models in ml-service/models or workspace root models
_CURR_DIR = os.path.dirname(os.path.abspath(__file__))
_ML_ROOT = os.path.dirname(os.path.dirname(_CURR_DIR))
MODEL_DIR = os.path.join(_ML_ROOT, "models")
DEFAULT_MODEL_PATH = os.path.join(MODEL_DIR, "channel_estimator.keras")
if not os.path.exists(DEFAULT_MODEL_PATH):
    # Check parent workspace
    alt_path = os.path.join(os.path.dirname(_ML_ROOT), "models", "channel_estimator.keras")
    if os.path.exists(alt_path):
        DEFAULT_MODEL_PATH = alt_path


def build_1d_cnn_model(input_shape: Tuple[int, int] = (64, 2)):
    """Builds and compiles the lightweight 1D CNN channel estimator.
    
    Args:
        input_shape: Tuple of (num_subcarriers, 2). Default: (64, 2).
        
    Returns:
        Compiled Keras Model.
    """
    tf, keras = _get_tf()
    layers = keras.layers
    
    inputs = layers.Input(shape=input_shape, name="input_ls_cfr")
    
    # 1. First Conv1D with ReLU
    x = layers.Conv1D(filters=32, kernel_size=5, padding="same", activation="relu", name="conv1d_1")(inputs)
    
    # 2. MaxPooling1D
    x = layers.MaxPooling1D(pool_size=2, name="maxpool_1")(x)
    
    # 3. Second Conv1D with ReLU
    x = layers.Conv1D(filters=64, kernel_size=3, padding="same", activation="relu", name="conv1d_2")(x)
    
    # 4. Flatten
    x = layers.Flatten(name="flatten")(x)
    
    # 5. Dense hidden layer
    x = layers.Dense(128, activation="relu", name="dense_hidden")(x)
    
    # 6. Dense output layer producing 128 values (64 real + 64 imag)
    x = layers.Dense(input_shape[0] * input_shape[1], activation="linear", name="dense_output")(x)
    
    # 7. Reshape back to (64, 2)
    outputs = layers.Reshape(target_shape=input_shape, name="output_cfr")(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="AI_RailLink_1D_CNN")
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="mean_squared_error",
        metrics=["mae", "mse"]
    )
    
    return model


def train_cnn_model(model,
                    X_train: np.ndarray,
                    Y_train: np.ndarray,
                    X_val: np.ndarray,
                    Y_val: np.ndarray,
                    epochs: int = 20,
                    batch_size: int = 32,
                    callbacks: Optional[list] = None) -> Any:
    """Trains the 1D CNN model and returns the training history."""
    history = model.fit(
        X_train, Y_train,
        validation_data=(X_val, Y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )
    return history


def save_trained_model(model, filepath: str = DEFAULT_MODEL_PATH) -> str:
    """Saves the trained model to disk in .keras format."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    model.save(filepath)
    return filepath


def load_trained_model(filepath: str = DEFAULT_MODEL_PATH):
    """Loads trained model from disk if it exists, otherwise returns None."""
    if not os.path.exists(filepath):
        return None
    try:
        tf, keras = _get_tf()
        model = keras.models.load_model(filepath)
        return model
    except Exception as e:
        print(f"Warning: Failed to load model from {filepath}: {e}")
        return None


def is_model_available(filepath: str = DEFAULT_MODEL_PATH) -> bool:
    """Checks if a trained model file exists on disk."""
    return os.path.isfile(filepath)


def predict_channel_cnn(model,
                        H_ls_grid: np.ndarray) -> Tuple[np.ndarray, float, bool]:
    """Runs 1D CNN inference to refine channel estimates across an OFDM frame.
    
    Args:
        model: Trained Keras model or None.
        H_ls_grid: 2D complex array of shape (num_symbols, 64) containing LS estimates.
        
    Returns:
        Tuple of (H_est_grid, inference_time_ms, used_fallback):
            H_est_grid: 2D complex array of shape (num_symbols, 64).
            inference_time_ms: Inference execution time in milliseconds.
            used_fallback: Boolean indicating whether LS fallback had to be used.
    """
    if model is None:
        # Fallback to LS if no model loaded
        return np.copy(H_ls_grid), 0.0, True
        
    num_symbols, N = H_ls_grid.shape
    
    # Construct input feature matrix (num_symbols, 64, 2)
    X_input = np.stack([np.real(H_ls_grid), np.imag(H_ls_grid)], axis=-1).astype(np.float32)
    
    t_start = time.perf_counter()
    try:
        preds = model.predict(X_input, verbose=0)
        t_end = time.perf_counter()
        inference_time_ms = (t_end - t_start) * 1000.0
        
        # Check for numerical instability or NaNs
        if np.isnan(preds).any() or np.isinf(preds).any():
            print("Warning: CNN prediction contained NaNs or Infs. Using LS fallback.")
            return np.copy(H_ls_grid), inference_time_ms, True
            
        # Convert [Real, Imag] back to complex array
        H_cnn_grid = preds[:, :, 0] + 1j * preds[:, :, 1]
        return H_cnn_grid, inference_time_ms, False
        
    except Exception as ex:
        print(f"CNN inference failed: {ex}. Using LS fallback.")
        return np.copy(H_ls_grid), 0.0, True
