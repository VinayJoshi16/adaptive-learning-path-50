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

1. **Deploy the backend** (`server/`) to a Node.js host (Railway, Render, Fly.io, etc.). Note the public URL (e.g. `https://your-app.railway.app`).
2. **Set the API URL for the frontend:** In your **frontend** host (Vercel, Netlify, etc.), add an environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your backend URL **including** `/api`, e.g. `https://your-app.railway.app/api`
3. **Build the frontend** with that variable set (e.g. trigger a new deploy after adding `VITE_API_URL`). Vite bakes `VITE_API_URL` into the build, so sign-in/sign-up will call your deployed backend instead of failing with "Failed to fetch".
4. Serve the `dist` folder from your frontend host.

If you see **"Failed to fetch"** or **"Unable to connect"** on sign-in/sign-up after deploying, the frontend is still calling `/api` on the same domain (no backend there). Fix: set `VITE_API_URL` to your backend URL and redeploy the frontend.
