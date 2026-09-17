# AI-RailLink Backend & ML Service

This directory houses the Node.js Express API Gateway and the Python FastAPI ML Service for AI-RailLink.

---

## 🏛️ Architecture Overview

- **Node.js Express Gateway (`src/`)**: Validates simulation and training parameters, manages API timeouts, handles CORS for production and development, and proxies mathematical requests to the Python ML Service.
- **Python FastAPI ML Service (`ml-service/`)**: Houses the 64-subcarrier OFDM simulation, Winner-II multipath channel convolution, Doppler frequency shifts ($f_d = (v/c)f_c$), and the TensorFlow/Keras 1D CNN channel estimator.
- **Pretrained Weights (`models/`)**: Stores `channel_estimator.keras` for deep learning subcarrier denoising.

---

## 🚀 Running Locally

### 1. Python ML Service (Port 8000)
```bash
# From this directory or ml-service/
pip install -r requirements.txt
python -m uvicorn ml-service.app.main:app --host 0.0.0.0 --port 8000
```

### 2. Node.js API Gateway (Port 5000)
```bash
npm install
npm start
```

---

## ☁️ Deployment on Render

1. Create a **Web Service** on [Render](https://render.com).
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables:
   - `PORT`: Automatically assigned by Render
   - `FRONTEND_URL`: Your Vercel domain (e.g., `https://ai-raillink.vercel.app`)
   - `ML_SERVICE_URL`: URL of your Python ML Service (e.g., `https://ai-raillink-ml.onrender.com` or internal URL)
   - `NODE_ENV`: `production`

---

## 📡 REST API Endpoints

- `GET /api/health` - Check backend gateway health & status
- `GET /api/model/status` - Check 1D CNN model status (Active / LS Fallback)
- `POST /api/simulation/run` - Execute physical layer OFDM transmission test
- `POST /api/training/dataset` - Generate synthetic training dataset
- `POST /api/training/train` - Train 1D CNN regression model
- `POST /api/training/evaluate` - Evaluate model on held-out test split
- `POST /api/performance/snr` - Run Monte Carlo SNR sweep ($0-30\text{ dB}$)
- `POST /api/performance/speed` - Run train speed sweep ($50-500\text{ km/h}$)
