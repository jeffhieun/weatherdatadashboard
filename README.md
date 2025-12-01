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
- `GET /api/weather/results?city={city}&day={day}&month={month}&year={year}` — List historical weather snapshots (optionally filter by city and/or date). A snapshot is recorded every time you fetch current weather or read from cache.
- `GET /api/cities/search?query={name}` — City auto-suggest (min 2 chars)
- `GET /api/flood/risk?latitude={lat}&longitude={lon}` — Get flood risk assessment for coordinates
- `GET /api/flood/results` — List cached flood risk results
- `GET /swagger/index.html` — Swagger UI (API docs)
- `GET /metrics` — Prometheus metrics

### Date Filtering

The `/api/weather/results` endpoint supports optional filtering across historical snapshots and will return entries for the recorded `UpdatedAt` timestamps:
- `day` — Filter by day (1-31)
- `month` — Filter by month (1-12)
- `year` — Filter by year (e.g., 2025)

Examples:
- `/api/weather/results?day=29&month=11&year=2025`
- `/api/weather/results?city=Hanoi&year=2025`
- Tip: Select a date for which you've previously fetched current weather to see stored snapshots. If you pick a date without any snapshots, the list will be empty.

### Flood Risk Assessment

The flood risk feature provides assessment based on geographic coordinates:
- Returns risk level: `high`, `medium`, or `low`
- Includes probability percentage
- Automatically fetched when selecting a city
- See [FLOOD_RISK_INTEGRATION.md](./FLOOD_RISK_INTEGRATION.md) for detailed documentation

### Cached Weather Data

The cached weather feature displays previously fetched weather data:
- View all cached weather records with `/api/weather/results`
- Lookup specific city cache with `/api/weather/result?city={city}`
- Filter by date (day, month, year)
- No live API calls - instant display from cache
- See [CACHED_WEATHER_INTEGRATION.md](./CACHED_WEATHER_INTEGRATION.md) for detailed documentation

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

### 5. Use the Date Filter Component

Import and use the `WeatherDateFilter` component:

```tsx
import WeatherDateFilter from './components/WeatherDateFilter';

function App() {
  return (
    <div>
      <WeatherDateFilter />
    </div>
  );
}
```

This component provides a calendar date picker to filter weather results by day, month, and year.

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