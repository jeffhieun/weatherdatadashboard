# Backend (be)

This folder contains the Go backend for the Weather Data Dashboard. It is a standalone Go module that provides a RESTful API for weather data. The backend includes features such as an in-memory cache, Swagger API documentation, and Prometheus metrics.

---

## Quick Start (from Project Root)

### 1. Build the Backend Service
From the project root (`/Users/hieunguyen/Documents/_my-project/weatherdatadashboard`), run:
```bash
cd be/cmd/weatherd
GO111MODULE=on go build -o ../../bin/weatherd
cd ../../..
```

### 2. Start the Backend Service
From the project root, run:
```bash
cd be
./bin/weatherd
```
The server listens on port `8080` by default.

Alternatively, you can build and start the backend in one step from the project root:
```bash
cd be/cmd/weatherd && GO111MODULE=on go build -o ../../bin/weatherd && cd ../../ && ./bin/weatherd
```

---

## Configuration

You can override the default configuration using environment variables or command-line flags:

### Environment Variables
- `PORT`: Port to listen on (default: `8080`).
- `CACHE_TTL`: Cache time-to-live as a Go duration (default: `5m`).
- `GEOCODE_BASE`: Base URL for the geocoding API.
- `WEATHER_BASE`: Base URL for the weather API.

Example:
```bash
PORT=9090 CACHE_TTL=2m ./bin/weatherd
```

### Command-Line Flags
Flags override environment variables:
```bash
./bin/weatherd --port 9090 --cache-ttl 2m
```

---

## API Endpoints

### 1. **GET `/api/weather/current?city={city}`**
Fetches the current weather for a city. If a cached value exists, it is returned immediately; otherwise, the service fetches data from the weather provider.

**Response JSON**:
- `city`: Requested city.
- `temperature`: Current temperature.
- `cached`: Whether the value came from the cache.
- `fetched_at`: Timestamp when fetched.

Example:
```bash
curl -sS "http://localhost:8080/api/weather/current?city=London"
```

---

### 2. **GET `/api/weather/result?city={city}`**
Fetches the latest cached result for a city. If no cached entry exists, a `404` is returned.

Example:
```bash
curl -sS "http://localhost:8080/api/weather/result?city=London"
```

---

### 3. **GET `/api/weather/results`**
Lists all cached weather results.

Example:
```bash
curl -sS "http://localhost:8080/api/weather/results" | jq
```

---


## Swagger API Documentation

Swagger documentation is available at:  
[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

### How to Regenerate Swagger Docs

1. **Install the swag CLI tool** (if not already installed):

	```sh
	go install github.com/swaggo/swag/cmd/swag@latest
	```

	Make sure `$HOME/go/bin` is in your `PATH`:
	```sh
	export PATH=$HOME/go/bin:$PATH
	```

2. **Generate Swagger docs** (from the `be` directory):

	```sh
	swag init -g cmd/weatherd/main.go
	```

	This will update the `docs/` folder with the latest API documentation.

3. **Start the backend server** and visit:  
	[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)  
	to view the Swagger UI.

---

## Prometheus Metrics

Prometheus metrics are exposed at:
[http://localhost:8080/metrics](http://localhost:8080/metrics)

---

## Docker

The backend includes a `Dockerfile` for building and running the service.

### Build the Docker Image
```bash
cd be
docker build -t weatherd:latest .
```

### Run the Docker Container
```bash
docker run --rm -p 8080:8080 weatherd:latest
```

---

## CI/CD

The repository includes a GitHub Actions workflow for building and testing the backend. See `.github/workflows/ci.yml` for details.

---

## Notes
- The backend is a Go module named `github.com/jeffhieun/weatherdatadashboard`.
- Default cache TTL is `5 minutes`.
