# Frontend (FE) — Vite + React + TypeScript

This folder contains a minimal React + Vite frontend that calls the backend endpoint `GET /api/weather/current`.

Quick start (macOS / zsh):

```bash
cd fe
npm install
npm run dev
```

The Vite dev server listens on port 5173 and is configured to proxy `/api` to `http://localhost:8080` (the backend). If your backend runs on a different port, edit `vite.config.ts`.

Build for production:

```bash
cd fe
npm run build
# serve the dist locally
npm run preview
```

Notes
- The app fetches `/api/weather/current` relative to the Vite server. During development the proxy will forward it to the backend.
- If you run the backend at a different origin in production, point the frontend to the backend URL or configure a proper reverse proxy.
