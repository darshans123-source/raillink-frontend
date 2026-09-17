# AI-RailLink Frontend

The frontend for AI-RailLink is a modern React 18 single-page application built with Vite, Tailwind CSS, Lucide Icons, and Recharts, powered by **Supabase Authentication** with Google Sign-In and a secure `profiles` database.

---

## 🌟 Key Features

- **Supabase Authentication**: Enterprise-grade cloud authentication with email/password and official Google OAuth.
- **Minimal User Profiles**: Stored in Supabase `profiles` table (`id`, `full_name`, `avatar_url`, `created_at`, `updated_at`). Zero sensitive or unnecessary personal fields.
- **Row Level Security (RLS)**: Enforces strict data isolation with `auth.uid() = id`.
- **Dynamic Profile Header**: Real-time display of the authenticated researcher's full name, initials, or Google avatar image.
- **Silent Splash Screen**: 1.8-second CSS animated intro on first session load (100% silent, zero audio).
- **Physical Layer Dashboard**: Visualizes 64-subcarrier OFDM transmission, multipath Winner-II channel response, Doppler shifts ($f_d = (v/c)f_c$), constellation diagrams, and 1D CNN estimation.
- **Independent Backend Status**: Verifies Node.js & Python ML microservice health independently from auth.

---

## 🚀 Running Locally

```bash
cd frontend
npm install
npm run dev
```

The application will start at `http://localhost:3000`.

---

## ⚙️ Supabase Database & Auth Setup

### 1. Database Setup (SQL Script)
1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **New query**.
3. Copy and paste the contents of [`supabase_setup.sql`](./supabase_setup.sql):
   - Creates `profiles` table referencing `auth.users(id)`.
   - Enables Row Level Security (RLS) with policies for `SELECT`, `INSERT`, `UPDATE`.
   - Attaches `handle_new_user()` trigger to automatically synchronize new signups into `profiles`.
4. Click **Run**.

---

## 🔐 Google OAuth Configuration Guide

### 1. Supabase Google Provider
1. In the Supabase Dashboard, go to **Authentication** -> **Providers** -> **Google**.
2. Toggle Google to **Enabled**.
3. Note the **Callback URL (for OAuth)** provided by Supabase:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

### 2. Google Cloud Console Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** -> **Credentials**.
3. Create or select an **OAuth 2.0 Client ID** (Application type: *Web application*).
4. Under **Authorized JavaScript origins**, add:
   - Development: `http://localhost:3000`
   - Production: `https://<your-vercel-domain>.vercel.app`
5. Under **Authorized redirect URIs**, add the Supabase Callback URL:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Click **Save**.
7. Copy the **Client ID** and **Client Secret** into your Supabase Google Provider settings, and click **Save**.

> [!CAUTION]
> Never put the Google Client Secret or the Supabase `service_role` key inside React frontend code or `.env`. Only the Supabase Publishable / Anon Key is safe for the browser.

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in `frontend/` (see `.env.example` for reference):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key

# Backend API Gateway URL (Node.js Gateway on Port 5000)
VITE_API_URL=http://localhost:5000
```

---

## ☁️ Deploying to Vercel

1. Push your changes to your Git repository.
2. Import the repository into [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables in Vercel project settings:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon publishable key
   - `VITE_API_URL`: URL of your deployed Render backend (e.g. `https://ai-raillink-backend.onrender.com`)
7. Click **Deploy**. SPA routing is configured automatically via `vercel.json`.
