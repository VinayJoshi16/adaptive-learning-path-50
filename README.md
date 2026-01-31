# PALM - Personalized Adaptive Learning with Multimodality

An intelligent learning platform that adapts to your engagement level and performance, delivering personalized content recommendations in real-time.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Auth:** JWT (custom)

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Setup

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure environment

**Server** (create `server/.env`):

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/palm
JWT_SECRET=your-secret-key-change-in-production
```

For MongoDB Atlas, use your connection string:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/palm
```

### 3. Run the app

**Option A: Run both frontend and backend together**

```bash
npm run dev
```

**Option B: Run separately (in two terminals)**

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001/api

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend together |
| `npm run dev:client` | Run frontend only |
| `npm run dev:server` | Run backend only |
| `npm run build` | Build frontend for production |
| `npm run server` | Start production server |

## Production Deployment

### Free: Deploy only on Vercel (recommended)

You can run **everything on Vercel for free** (no Railway or other paid backend):

1. **MongoDB Atlas (free tier)**  
   Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), get the connection string, and in **Network Access** allow access from anywhere (or add Vercel IPs if you prefer).

2. **Deploy to Vercel**  
   Connect your repo to Vercel and deploy. The `api/` folder is used as serverless API routes on the same domain.

3. **Environment variables in Vercel**  
   In your Vercel project → Settings → Environment Variables, add:
   - **`MONGODB_URI`** – your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/palm`)
   - **`JWT_SECRET`** – any long random string (e.g. `openssl rand -hex 32`)

4. **No `VITE_API_URL` needed** – The app uses `/api` on the same domain, so sign-in/sign-up work without a separate backend URL.

Redeploy after setting the env vars. Sign-in and sign-up will hit `/api/auth/signin` and `/api/auth/signup` on your Vercel URL.

### Alternative: Separate frontend + backend

1. **Deploy the backend** (`server/`) to a Node.js host (Railway, Render, etc.). Note the public URL.
2. **Set the API URL for the frontend:** In your frontend host (Vercel, Netlify, etc.), add **`VITE_API_URL`** = your backend URL including `/api` (e.g. `https://your-app.railway.app/api`).
3. **Redeploy the frontend** so the build includes `VITE_API_URL`.

If you see **"Failed to fetch"** or **"Request failed"**, either set `VITE_API_URL` (when using a separate backend) or ensure `MONGODB_URI` and `JWT_SECRET` are set on Vercel when using the built-in API.
