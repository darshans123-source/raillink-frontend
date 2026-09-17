# AI-RailLink Frontend

The frontend for AI-RailLink is a modern React 18 single-page application built with Vite, Tailwind CSS, Lucide Icons, and Recharts.

---

## 🌟 Key Features

- **Dynamic Authentication**: Client-side registration and login using browser `localStorage` and SHA-256 hashing via the Web Crypto API.
- **Dynamic Profile Header**: Real-time display of the registered user's name, college/institution, generated avatar initials, and account management dropdown (Logout, Delete Local Account).
- **Silent Splash Screen**: 1.8-second CSS animated intro on first session load (100% silent, zero audio).
- **Physical Layer Dashboard**: Visualizes 64-subcarrier OFDM transmission, multipath Winner-II channel response, Doppler shifts ($f_d = (v/c)f_c$), constellation diagrams, and 1D CNN estimation.
- **Parametric Sweeps**: Real-time Monte Carlo analysis across SNR ($0-30\text{ dB}$) and train speeds ($50-500\text{ km/h}$).

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

The application will start at `http://localhost:3000`.

---

## ⚙️ Environment Configuration

Create a `.env` file in this directory:

```env
# Development (proxies to Node.js backend on port 5000)
VITE_API_URL=http://localhost:5000

# Production (Render backend URL)
# VITE_API_URL=https://your-raillink-backend.onrender.com
```

---

## ☁️ Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: URL of your deployed Render backend (e.g., `https://ai-raillink-backend.onrender.com`)
7. Deploy! SPA routing is configured automatically via `vercel.json`.
