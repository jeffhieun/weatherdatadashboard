go build -o bin/weatherd
go test ./...
# Weather Data Dashboard

A full-stack project for weather data visualization and city search, featuring a Go backend (with Swagger/OpenAPI docs) and a React frontend.

---

## Project Structure

- **be/** — Go backend API server  
  - RESTful endpoints for weather, city search, and more  
  - In-memory caching  
  - Swagger UI at `/swagger/index.html`  
  - Prometheus metrics at `/metrics`
- **fe/** — React frontend  
  - Vite + React + TypeScript (recommended setup)

---

## Backend Endpoints

- `GET /api/weather/current?city={city}` — Get current weather for a city (live fetch, caches result)
- `GET /api/weather/details?city={city}` — (Alias, same as above)
- `GET /api/weather/result?city={city}` — Get cached weather result (no live fetch)
- `GET /api/weather/results` — List all cached weather records
- `GET /api/cities/search?query={name}` — City auto-suggest (min 2 chars)
- `GET /api/flood/risk` — (If implemented) Flood risk endpoint
- `GET /api/flood/results` — (If implemented) List flood risk results
- `GET /swagger/index.html` — Swagger UI (API docs)
- `GET /metrics` — Prometheus metrics

---

## Backend: Quickstart

### 1. Build

```bash
cd be
go build -o ../bin/weatherd ./cmd/weatherd
```

### 2. Run

```bash
cd ..
./bin/weatherd
```

### 3. Example Request

```bash
curl "http://localhost:8080/api/weather/current?city=London"
```

### 4. Swagger UI

Visit [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

---

## Frontend: Quickstart

### 1. Scaffold the App

```bash
npm create vite@latest fe -- --template react-ts
cd fe
npm install
```

### 2. Configure Proxy (optional, for local API calls)

In `fe/vite.config.ts`, add:

```ts
// ...existing code...
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
},
```

### 3. Start the Frontend

```bash
npm run dev
```

### 4. Example API Call (React)

```ts
fetch('/api/weather/current?city=London')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Environment Configuration

- `PORT` — Port to listen on (default: 8080)
- `CACHE_TTL` — Cache TTL (default: 300s, e.g. `2m`, `300s`)
- Example:  
  ```bash
  PORT=9090 CACHE_TTL=2m ./bin/weatherd
  ```

---

## Development

- Backend code: `be/`
- Run tests:
  ```bash
  cd be
  go test ./...
  ```
- Frontend code: `fe/`
  - Start dev server: `npm run dev`
  - Build for production: `npm run build`

---

## Notes

- Prometheus metrics available at `/metrics`
- API documentation at `/swagger/index.html`
- The backend is production-ready and modularized with clean architecture.
# weatherdatadashboard