"""Train a lightweight baseline 1D CNN channel estimator model and save to models/channel_estimator.keras."""

import os
import sys
import numpy as np

# Ensure project root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.dataset import generate_channel_dataset, save_dataset
from src.cnn_model import build_1d_cnn_model, train_cnn_model, save_trained_model, DEFAULT_MODEL_PATH


def main():
    print("=" * 60)
    print("AI-RailLink: Training Baseline 1D CNN Channel Estimator")
    print("=" * 60)
    
    # 1. Generate synthetic HSR channel dataset
    print("\n1. Generating synthetic dataset (500 samples)...")
    X_train, Y_train, X_val, Y_val, X_test, Y_test = generate_channel_dataset(
        num_samples=500,
        snr_range_db=(0.0, 30.0),
        speed_range_kmh=(50.0, 500.0),
        pilot_mode="SCATTERED",
        pilot_spacing=4,
        seed=42
    )
    save_dataset(X_train, Y_train, X_val, Y_val, X_test, Y_test)
    print(f"Dataset generated: Train={X_train.shape[0]}, Val={X_val.shape[0]}, Test={X_test.shape[0]}")
    
    # 2. Build 1D CNN
    print("\n2. Building lightweight 1D CNN model...")
    model = build_1d_cnn_model(input_shape=(64, 2))
    model.summary()
    
    # 3. Train model on CPU
    print("\n3. Training model (15 epochs)...")
    history = train_cnn_model(
        model,
        X_train, Y_train,
        X_val, Y_val,
        epochs=15,
        batch_size=32
    )
    
    # 4. Evaluate on test set
    test_loss, test_mae, test_mse = model.evaluate(X_test, Y_test, verbose=1)
    print(f"\nTest Results -> MSE: {test_mse:.6f}, MAE: {test_mae:.6f}")
    
    # 5. Save model
    saved_path = save_trained_model(model, DEFAULT_MODEL_PATH)
    file_size_kb = os.path.getsize(saved_path) / 1024
    print(f"\nSuccessfully saved trained model to: {saved_path} ({file_size_kb:.1f} KB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
