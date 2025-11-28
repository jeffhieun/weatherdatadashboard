# Weather Data Dashboard

This repository contains the Weather Data Dashboard project. It is split into two top-level folders:

- `be/` — backend (Go)
  - Contains the API server, tests, Dockerfile, and a `be/README.md` with build/run/test instructions.
- `fe/` — frontend (React)
  - (Not created yet) Intended to hold the React UI (e.g., Vite + React + TypeScript).

Quick links
- Backend docs: `be/README.md`

How to work on the project
- Backend
  - cd into `be/` and follow the instructions in `be/README.md` to build, run, test, and run Docker.

- Frontend
  - Create a `fe/` directory (I recommend using Vite + React + TypeScript). Example starter:
    - `npm create vite@latest fe -- --template react-ts`

Notes
- The repository CI is configured to build and test the backend in `be/` (see `.github/workflows/ci.yml`).
- The backend exposes Prometheus metrics on `/metrics` and the main API at `/api/weather/current`.

If you want, I can scaffold the frontend (`fe/`) next using Vite + React + TypeScript and wire a minimal UI that calls the backend.
# Weather Data Dashboard — Go backend

This repository contains a simple Go backend that exposes a single endpoint to fetch the current temperature for a city using the Open-Meteo APIs. It includes an in-memory cache to avoid repeated external requests.

Endpoints
- GET /api/weather/current?city={city-name}

Responses (JSON)
- city: queried city
- temperature: current temperature (float)
- cached: boolean (true if served from cache)
- fetched_at: timestamp when the value was fetched

Build & run (macOS / zsh)

1. Build:

```bash
cd /Users/hieunguyen/Documents/_my-project/weatherdatadashboard
go build -o bin/weatherd
```

2. Run:

```bash
./bin/weatherd
```

3. Example request:

```bash
curl "http://localhost:8080/api/weather/current?city=London"
```

Run tests:

```bash
cd /Users/hieunguyen/Documents/_my-project/weatherdatadashboard
go test ./...

Environment configuration
- PORT: port number to listen on (default: 8080). Example: `PORT=9090` or `PORT=:9090`.
- CACHE_TTL: cache TTL as a Go duration string (default: 5m). Examples: `CACHE_TTL=2m`, `CACHE_TTL=300s`.

Example using env vars:

```bash
PORT=9090 CACHE_TTL=2m ./bin/weatherd
```
```
# weatherdatadashboard