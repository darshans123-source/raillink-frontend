# AI-RailLink: Smart Communication for Faster Railways

**Deep Learning-Based OFDM Channel Estimation for High-Speed Railway Networks**

---

## 🚆 System Overview

**AI-RailLink** is a 3-tier research and engineering platform designed to investigate and mitigate extreme Doppler shift and multipath fading impairments in High-Speed Railway (HSR) wireless communications.

Operating trains between $300\text{ km/h}$ and $500\text{ km/h}$ creates Doppler shifts up to $1.2\text{ kHz}$ at $2.6\text{ GHz}$, severely violating OFDM subcarrier orthogonality and causing Inter-Carrier Interference (ICI). AI-RailLink implements a **1D Convolutional Neural Network (CNN)** that denoises Least Squares (LS) channel estimates across frequency subcarriers to dramatically lower Bit Error Rate (BER) and Normalized Mean Squared Error (NMSE).

---

## 🏛️ Project Directory Structure

```
AI-RailLink/
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI cards, plots, top header, splash
│   │   ├── context/         # AuthContext (localStorage + Web Crypto API)
│   │   ├── pages/           # Dashboard, Simulator, Training, Performance, Login, Register
│   │   ├── services/        # api.js (Axios client with VITE_API_URL normalization)
│   │   └── utils/           # crypto.js (SHA-256 password hashing, initials)
│   ├── public/              # Static assets & icons
│   ├── package.json         # React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
│   ├── vercel.json          # SPA rewrite rules for seamless routing
│   ├── .env                 # Local development variables
│   ├── .env.example         # Production environment template
│   └── README.md            # Frontend documentation
│
├── backend/
│   ├── src/                 # Node.js + Express.js API Gateway
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Python FastAPI HTTP client
│   │   └── server.js        # Express app with dynamic CORS
│   ├── ml-service/          # Python 3 + FastAPI ML Service
│   │   └── app/             # core math, OFDM, Winner-II channel, 1D CNN
│   ├── models/              # Saved Keras 1D CNN models (.keras)
│   ├── data/                # Generated channel datasets (.npz)
│   ├── package.json         # Node.js dependencies
│   ├── requirements.txt     # Python dependencies (TensorFlow, FastAPI, NumPy, SciPy)
│   ├── Dockerfile           # Backend containerization
│   ├── .env                 # Local gateway configuration
│   ├── .env.example         # Production gateway template
│   └── README.md            # Backend & ML documentation
│
├── docker-compose.yml       # Multi-container orchestration
├── README.md                # System documentation
└── .gitignore               # Ignored dependencies & build artifacts
```

---

## 🚀 Local Development Setup

### 1. Python ML Service (Port 8000)
```bash
cd backend/ml-service
pip install -r ../requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Node.js Express Gateway (Port 5000)
```bash
cd backend
npm install
npm start
```

### 3. React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🔐 Local Authentication Architecture

AI-RailLink includes a student-friendly client-side authentication system:
- **Registration (`/register`)**: Captures Full Name, Email, College/Institution, and Password.
- **Client-Side Hashing**: Hashes passwords using the **Web Crypto API** (`crypto.subtle.digest('SHA-256')`).
- **Dynamic Header Profile**: The TopHeader automatically displays the registered researcher's name, college, and generated avatar initials.
- **Protected Routes**: `/`, `/simulator`, `/training`, `/channel-analysis`, `/performance`, and `/about` require an active session, redirecting unauthenticated users to `/login`.
- **Silent Splash Screen**: Displays a 1.8-second CSS-animated intro when opening the app (100% silent, zero audio).
- **Session Management**: Allows logging out or deleting the local account directly from the header profile dropdown.

---

## ☁️ Production Deployment

### Frontend → Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: URL of your Render backend gateway (e.g., `https://ai-raillink-backend.onrender.com`).
7. Deploy! SPA routing is handled by `frontend/vercel.json`.

### Backend & ML Service → Render
1. Create a **Web Service** on [Render](https://render.com) for the Node.js Gateway:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT`: Automatically set by Render
     - `FRONTEND_URL`: `https://ai-raillink.vercel.app`
     - `ML_SERVICE_URL`: URL of your Python ML Service
     - `NODE_ENV`: `production`

2. Deploy the Python ML service as a background service or Docker container on Render using `backend/Dockerfile` or `ml-service/Dockerfile`.

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Gateway health check (powers the dynamic System Online status) |
| `GET` | `/api/model/status` | Model status check (Active 1D CNN vs. LS Fallback) |
| `POST` | `/api/simulation/run` | Execute physical layer OFDM transmission test |
| `POST` | `/api/training/dataset` | Generate synthetic training dataset |
| `POST` | `/api/training/train` | Train 1D CNN channel estimation regression model |
| `POST` | `/api/training/evaluate` | Evaluate 1D CNN model against held-out test split |
| `POST` | `/api/performance/snr` | Multi-point Monte Carlo sweep across SNR ($0-30\text{ dB}$) |
| `POST` | `/api/performance/speed` | Multi-point sweep across train mobility speeds ($50-500\text{ km/h}$) |

---

## 🔬 How to Train the 1D CNN Model

1. Navigate to **AI Training** in the sidebar.
2. Under **1. Synthetic HSR Dataset Generation**, select sample size (e.g. 500 samples) and click **GENERATE DATASET**.
3. Under **2. 1D CNN Architecture & Training**, configure epochs (e.g. 15 epochs, batch size 32) and click **TRAIN 1D CNN**.
4. The system compiles the regression model, executes Adam optimization in Python, plots the training/validation loss curves in real-time, and saves the trained model weights to `models/channel_estimator.keras`.
5. Click **EVALUATE MODEL** to compute test MSE and MAE on the held-out test split.

---

## 🧪 How to Run Simulations

1. Go to **Simulator** (or click Quick Test on the Dashboard).
2. Adjust parameters:
   - Train Speed ($50-500\text{ km/h}$)
   - Carrier Frequency ($2.6\text{ GHz}$)
   - Channel SNR ($0-30\text{ dB}$)
   - Modulation (BPSK, QPSK, 16-QAM)
   - Pilot Mode (Scattered, Full) and Spacing ($1, 2, 4, 8$)
3. Click **RUN SIMULATION**.
4. Observe real calculation results: Doppler frequency ($f_d = (v/c)f_c$), bit errors count, Bit Error Rate (BER), NMSE (dB), Channel Frequency Response (CFR) magnitude/phase plots, constellation diagrams, and received vs. equalized subcarrier waveforms.
5. Click **Export Data** to download the complete simulation output as a JSON report.

---

## 🛠️ Troubleshooting

- **Backend Offline in Header**: Verify the Node.js backend is running on port 5000 (`npm start` in `backend/`).
- **1D CNN: Not Trained Badge**: If the model has not been trained yet, the platform seamlessly uses Least Squares (LS) estimation with spline interpolation as fallback. Visit `/training` to train the model.
- **CORS Errors**: Ensure `FRONTEND_URL` in `backend/.env` contains your frontend domain.
- **Vercel 404 on Refresh**: Ensure `frontend/vercel.json` rewrite rule is present in the deployment.
#   r a i l l i n k - f r o n t e n d  
 