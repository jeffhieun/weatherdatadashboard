package config

import (
	"os"
	"strconv"
)

type Config struct {
	WeatherAPIURL string
	GeocodeAPIURL string
	CacheTTL      int
	Port          string
	RedisURL      string
}

func Load() Config {
	return Config{
		WeatherAPIURL: getenv("WEATHER_API_URL", "https://api.open-meteo.com/v1/forecast"),
		GeocodeAPIURL: getenv("GEOCODE_API_URL", "https://geocoding-api.open-meteo.com/v1/search"),
		CacheTTL:      getenvInt("CACHE_TTL", 300),
		Port:          getenv("PORT", "8080"),
		RedisURL:      getenv("REDIS_URL", ""),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
