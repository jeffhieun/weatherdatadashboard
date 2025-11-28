package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// -----------------------------
// CACHING LAYER
// -----------------------------

type WeatherData struct {
	Temperature float64   `json:"temperature"`
	FetchedAt   time.Time `json:"fetched_at"`
}

type CacheEntry struct {
	Data      WeatherData
	ExpiresAt time.Time
}

var (
	cache     = make(map[string]CacheEntry)
	cacheLock sync.RWMutex
	// cacheTTL is defaulted but may be overridden by config at startup.
	cacheTTL = 5 * time.Minute
)

// CitySuggestion holds a city suggestion result
// and citySearchCacheEntry is used for caching

type CitySuggestion struct {
	Name    string  `json:"name"`
	Country string  `json:"country"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
}

type citySearchCacheEntry struct {
	Results   []CitySuggestion
	ExpiresAt time.Time
}

var (
	citySearchCache     = make(map[string]citySearchCacheEntry)
	citySearchCacheLock sync.RWMutex
)

// Config holds runtime configuration for the service.
type Config struct {
	Port           string
	CacheTTL       time.Duration
	GeocodeBaseURL string
	WeatherBaseURL string
}

var cfg = Config{
	Port:           "8080",
	CacheTTL:       5 * time.Minute,
	GeocodeBaseURL: "https://geocoding-api.open-meteo.com",
	WeatherBaseURL: "https://api.open-meteo.com",
}

// Metrics
var (
	metricRequests = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "weather_requests_total",
		Help: "Total number of weather API requests",
	}, []string{"handler"})
	metricCacheHits = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "weather_cache_hits_total",
		Help: "Total cache hits",
	})
	metricCacheMiss = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "weather_cache_miss_total",
		Help: "Total cache misses",
	})
)

func init() {
	prometheus.MustRegister(metricRequests, metricCacheHits, metricCacheMiss)
}

// httpClient is the client used for outgoing requests; allows test injection.
var httpClient *http.Client

// loadConfig reads environment variables and applies them. Supported:
// - PORT: port number the server listens on (default: 8080)
// - CACHE_TTL: cache TTL as a Go duration string (e.g. "5m", "300s").
// loadConfig reads flags and environment variables and populates `cfg`.
// Precedence: flags > env > defaults.
func loadConfig() {
	// flags (use empty defaults so we can detect whether user provided them)
	portFlag := flag.String("port", "", "port to listen on (overrides PORT env)")
	ttlFlag := flag.String("cache-ttl", "", "cache TTL as duration (e.g. 5m, 30s) (overrides CACHE_TTL env)")
	geocodeFlag := flag.String("geocode-base", "", "geocoding base URL (overrides GEOCODE_BASE env)")
	weatherFlag := flag.String("weather-base", "", "weather base URL (overrides WEATHER_BASE env)")
	flag.Parse()

	// PORT
	if *portFlag != "" {
		cfg.Port = *portFlag
	} else if v := os.Getenv("PORT"); v != "" {
		cfg.Port = v
	}

	// CACHE_TTL
	if *ttlFlag != "" {
		if d, err := time.ParseDuration(*ttlFlag); err == nil {
			cfg.CacheTTL = d
		} else {
			log.Printf("invalid flag cache-ttl %q, using %s", *ttlFlag, cfg.CacheTTL)
		}
	} else if v := os.Getenv("CACHE_TTL"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			cfg.CacheTTL = d
		} else {
			log.Printf("invalid CACHE_TTL %q, using %s", v, cfg.CacheTTL)
		}
	}

	// Geocode base
	if *geocodeFlag != "" {
		cfg.GeocodeBaseURL = *geocodeFlag
	} else if v := os.Getenv("GEOCODE_BASE"); v != "" {
		cfg.GeocodeBaseURL = v
	}

	// Weather base
	if *weatherFlag != "" {
		cfg.WeatherBaseURL = *weatherFlag
	} else if v := os.Getenv("WEATHER_BASE"); v != "" {
		cfg.WeatherBaseURL = v
	}

	// normalize port (strip leading colon if present)
	if len(cfg.Port) > 0 && cfg.Port[0] == ':' {
		cfg.Port = cfg.Port[1:]
	}

	// apply cacheTTL to global variable used by setCache
	cacheTTL = cfg.CacheTTL
	log.Printf("Config: port=%s cacheTTL=%s geocode=%s weather=%s", cfg.Port, cfg.CacheTTL, cfg.GeocodeBaseURL, cfg.WeatherBaseURL)
}

func getCache(city string) (WeatherData, bool) {
	cacheLock.RLock()
	defer cacheLock.RUnlock()

	entry, exists := cache[city]
	if !exists || time.Now().After(entry.ExpiresAt) {
		return WeatherData{}, false
	}
	return entry.Data, true
}

func setCache(city string, data WeatherData) {
	cacheLock.Lock()
	defer cacheLock.Unlock()
	cache[city] = CacheEntry{
		Data:      data,
		ExpiresAt: time.Now().Add(cacheTTL),
	}
}

// -----------------------------
// THIRD-PARTY WEATHER API CALL
// -----------------------------

// fetchWeather retrieves weather using the provided HTTP client and the configured
// base URLs (cfg.GeocodeBaseURL, cfg.WeatherBaseURL).
func fetchWeather(client *http.Client, city string) (WeatherData, error) {
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}

	// 1. Geocode the city
	geoURL := fmt.Sprintf("%s/v1/search?name=%s", cfg.GeocodeBaseURL, url.QueryEscape(city))

	resp, err := client.Get(geoURL)
	if err != nil {
		return WeatherData{}, err
	}
	defer resp.Body.Close()

	var geo struct {
		Results []struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return WeatherData{}, err
	}

	if len(geo.Results) == 0 {
		return WeatherData{}, fmt.Errorf("city not found")
	}

	lat := geo.Results[0].Latitude
	lon := geo.Results[0].Longitude

	// 2. Fetch weather
	weatherURL := fmt.Sprintf("%s/v1/forecast?latitude=%.4f&longitude=%.4f&current_weather=true", cfg.WeatherBaseURL, lat, lon)

	respWeather, err := client.Get(weatherURL)
	if err != nil {
		return WeatherData{}, err
	}
	defer respWeather.Body.Close()

	var weatherRes struct {
		CurrentWeather struct {
			Temperature float64 `json:"temperature"`
		} `json:"current_weather"`
	}

	if err := json.NewDecoder(respWeather.Body).Decode(&weatherRes); err != nil {
		return WeatherData{}, err
	}

	return WeatherData{
		Temperature: weatherRes.CurrentWeather.Temperature,
		FetchedAt:   time.Now(),
	}, nil
}

// -----------------------------
// HTTP HANDLER
// -----------------------------

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(v)
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
	metricRequests.WithLabelValues("weather_current").Inc()
	city := r.URL.Query().Get("city")
	if city == "" {
		http.Error(w, "city is required", http.StatusBadRequest)
		return
	}

	// 1. Check cache first
	if data, ok := getCache(city); ok {
		metricCacheHits.Inc()
		writeJSON(w, map[string]interface{}{
			"city":        city,
			"temperature": data.Temperature,
			"cached":      true,
			"fetched_at":  data.FetchedAt,
		})
		return
	}

	// 2. Fetch weather
	metricCacheMiss.Inc()
	data, err := fetchWeather(httpClient, city)
	if err != nil {
		log.Printf("error fetching weather for %s: %v", city, err)
		http.Error(w, "error fetching weather: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Store in cache
	setCache(city, data)

	writeJSON(w, map[string]interface{}{
		"city":        city,
		"temperature": data.Temperature,
		"cached":      false,
		"fetched_at":  data.FetchedAt,
	})
}

// citySearchHandler handles GET /api/cities/search?query=xxx with caching
func citySearchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if len(query) < 2 {
		http.Error(w, "query must be at least 2 characters", http.StatusBadRequest)
		return
	}

	// Check cache
	citySearchCacheLock.RLock()
	entry, found := citySearchCache[query]
	citySearchCacheLock.RUnlock()
	if found && time.Now().Before(entry.ExpiresAt) {
		writeJSON(w, entry.Results)
		return
	}

	// Not cached or expired, fetch from Open-Meteo
	url := fmt.Sprintf("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=5&language=en&format=json", url.QueryEscape(query))
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		http.Error(w, "geocoding service unavailable", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var geo struct {
		Results []struct {
			Name    string  `json:"name"`
			Country string  `json:"country"`
			Lat     float64 `json:"latitude"`
			Lon     float64 `json:"longitude"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		http.Error(w, "invalid geocoding response", http.StatusInternalServerError)
		return
	}

	suggestions := make([]CitySuggestion, 0, len(geo.Results))
	for _, r := range geo.Results {
		suggestions = append(suggestions, CitySuggestion{
			Name:    r.Name,
			Country: r.Country,
			Lat:     r.Lat,
			Lon:     r.Lon,
		})
	}

	// Cache the result
	citySearchCacheLock.Lock()
	citySearchCache[query] = citySearchCacheEntry{
		Results:   suggestions,
		ExpiresAt: time.Now().Add(cfg.CacheTTL),
	}
	citySearchCacheLock.Unlock()

	writeJSON(w, suggestions)
}

// -----------------------------
// MAIN SERVER
// -----------------------------

func main() {
	// load config from flags and environment
	loadConfig()

	// Initialize the HTTP client used for outgoing requests
	httpClient = &http.Client{Timeout: 10 * time.Second}

	// Register handlers
	http.HandleFunc("/api/weather/current", weatherHandler)
	http.HandleFunc("/api/cities/search", citySearchHandler)
	http.Handle("/metrics", promhttp.Handler())

	addr := cfg.Port
	if len(addr) > 0 && addr[0] != ':' {
		addr = ":" + addr
	}

	srv := &http.Server{
		Addr: addr,
	}

	// run server in a goroutine so we can gracefully shutdown
	go func() {
		fmt.Printf("Server running at http://localhost%s\n", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	// wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Printf("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Printf("Server exiting")
}
