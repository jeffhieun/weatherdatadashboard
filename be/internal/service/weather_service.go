package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/jeffhieun/weatherdatadashboard/internal/model"
	"github.com/jeffhieun/weatherdatadashboard/internal/store"
)

// GetWeatherDetails fetches and normalizes detailed weather data for a city.
func (s *DefaultWeatherService) GetWeatherDetails(city string) (model.WeatherDetails, error) {
	// Try to fetch cached record from repository (reuse existing cache infra if possible)
	// For this example, we use a simple in-memory cache (could be improved for prod)
	// 1. Geocode city name to lat/lon using Open-Meteo
	geoURL := fmt.Sprintf("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=1&language=en&format=json", url.QueryEscape(city))
	resp, err := http.Get(geoURL)
	if err != nil {
		return model.WeatherDetails{}, fmt.Errorf("failed to geocode city: %w", err)
	}
	defer resp.Body.Close()
	var geo struct {
		Results []struct {
			Name      string  `json:"name"`
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
			Country   string  `json:"country"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return model.WeatherDetails{}, fmt.Errorf("invalid geocoding response: %w", err)
	}
	if len(geo.Results) == 0 {
		return model.WeatherDetails{}, fmt.Errorf("city not found")
	}
	lat := geo.Results[0].Latitude
	lon := geo.Results[0].Longitude
	cityName := geo.Results[0].Name

	// 2. Fetch weather for lat/lon using Open-Meteo (current + daily)
	weatherURL := fmt.Sprintf("https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current_weather=true&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,rain,snowfall,cloudcover,uv_index,visibility,surface_pressure,windspeed_10m,winddirection_10m&daily=sunrise,sunset&timezone=auto", lat, lon)
	respW, err := http.Get(weatherURL)
	if err != nil {
		return model.WeatherDetails{}, fmt.Errorf("failed to fetch weather: %w", err)
	}
	defer respW.Body.Close()
	var wres struct {
		CurrentWeather struct {
			Temperature float64 `json:"temperature"`
			WindSpeed   float64 `json:"windspeed"`
			WindDir     float64 `json:"winddirection"`
			WeatherCode int     `json:"weathercode"`
			Time        string  `json:"time"`
		} `json:"current_weather"`
		Hourly struct {
			Time                []string  `json:"time"`
			Temperature2m       []float64 `json:"temperature_2m"`
			ApparentTemperature []float64 `json:"apparent_temperature"`
			RelativeHumidity2m  []float64 `json:"relative_humidity_2m"`
			PrecipitationProb   []float64 `json:"precipitation_probability"`
			Rain                []float64 `json:"rain"`
			Snowfall            []float64 `json:"snowfall"`
			CloudCover          []float64 `json:"cloudcover"`
			UVIndex             []float64 `json:"uv_index"`
			Visibility          []float64 `json:"visibility"`
			SurfacePressure     []float64 `json:"surface_pressure"`
		} `json:"hourly"`
		Daily struct {
			Sunrise []string `json:"sunrise"`
			Sunset  []string `json:"sunset"`
		} `json:"daily"`
	}
	if err := json.NewDecoder(respW.Body).Decode(&wres); err != nil {
		return model.WeatherDetails{}, fmt.Errorf("invalid weather response: %w", err)
	}

	// Find the index for the current hour
	idx := 0
	for i, t := range wres.Hourly.Time {
		if t == wres.CurrentWeather.Time {
			idx = i
			break
		}
	}

	// Parse sunrise/sunset
	sunrise, _ := time.Parse(time.RFC3339, wres.Daily.Sunrise[0])
	sunset, _ := time.Parse(time.RFC3339, wres.Daily.Sunset[0])

	details := model.WeatherDetails{
		City:        cityName,
		Temperature: wres.CurrentWeather.Temperature,
		FeelsLike:   wres.Hourly.ApparentTemperature[idx],
		Humidity:    int(wres.Hourly.RelativeHumidity2m[idx]),
		WindSpeed:   wres.CurrentWeather.WindSpeed,
		WindDir:     fmt.Sprintf("%.0f°", wres.CurrentWeather.WindDir),
		Visibility:  wres.Hourly.Visibility[idx] / 1000.0, // meters to km
		Pressure:    int(wres.Hourly.SurfacePressure[idx]),
		UVIndex:     int(wres.Hourly.UVIndex[idx]),
		Sunrise:     sunrise,
		Sunset:      sunset,
		CloudCover:  int(wres.Hourly.CloudCover[idx]),
		PrecipProb:  wres.Hourly.PrecipitationProb[idx] / 100.0,
		Rain:        wres.Hourly.Rain[idx],
		Snow:        wres.Hourly.Snowfall[idx],
		UpdatedAt:   time.Now(),
	}
	return details, nil
}

// Weather represents the forecast returned by the service layer.
type Weather struct {
	Temperature float64   `json:"temperature"`
	FetchedAt   time.Time `json:"fetched_at"`
}

// WeatherService defines business methods exposed to handlers.
type WeatherService interface {
	GetForecast(city string) (Weather, error)
	// GetCached returns the cached weather for city if present (and not expired).
	GetCached(city string) (Weather, bool)
	// ListCached returns all cached records as a map city->Weather.
	ListCached() map[string]Weather
}

// DefaultWeatherService is a simple implementation of WeatherService.
type DefaultWeatherService struct {
	repo store.WeatherRepository
}

// NewDefaultWeatherService creates a new DefaultWeatherService.
func NewDefaultWeatherService(repo store.WeatherRepository) *DefaultWeatherService {
	return &DefaultWeatherService{repo: repo}
}

// GetForecast returns a forecast for the requested city. This placeholder
// implementation first checks the repository for cached data and otherwise
// returns mock data. Replace with real API calls in production.
func (s *DefaultWeatherService) GetForecast(city string) (Weather, error) {
	// Try to fetch cached record from repository
	rec, err := s.repo.FetchCachedData(city)
	if err == nil {
		if time.Now().Before(rec.ExpiresAt) {
			return Weather{Temperature: rec.Temperature, FetchedAt: rec.FetchedAt}, nil
		}
	}

	// 1. Geocode city name to lat/lon using Open-Meteo
	geoURL := fmt.Sprintf("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=1&language=en&format=json", url.QueryEscape(city))
	resp, err := http.Get(geoURL)
	if err != nil {
		return Weather{}, fmt.Errorf("failed to geocode city: %w", err)
	}
	defer resp.Body.Close()

	var geo struct {
		Results []struct {
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return Weather{}, fmt.Errorf("invalid geocoding response: %w", err)
	}
	if len(geo.Results) == 0 {
		return Weather{}, fmt.Errorf("city not found")
	}
	lat := geo.Results[0].Latitude
	lon := geo.Results[0].Longitude

	// 2. Fetch weather for lat/lon using Open-Meteo
	weatherURL := fmt.Sprintf("https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current_weather=true", lat, lon)
	respW, err := http.Get(weatherURL)
	if err != nil {
		return Weather{}, fmt.Errorf("failed to fetch weather: %w", err)
	}
	defer respW.Body.Close()

	var weatherRes struct {
		CurrentWeather struct {
			Temperature float64 `json:"temperature"`
		} `json:"current_weather"`
	}
	if err := json.NewDecoder(respW.Body).Decode(&weatherRes); err != nil {
		return Weather{}, fmt.Errorf("invalid weather response: %w", err)
	}

	w := Weather{Temperature: weatherRes.CurrentWeather.Temperature, FetchedAt: time.Now()}
	_ = s.repo.SaveCachedData(city, store.CacheRecord{Temperature: w.Temperature, FetchedAt: w.FetchedAt, ExpiresAt: time.Now().Add(5 * time.Minute)})
	return w, nil
}

// GetCached returns a cached value if present (and not expired).
func (s *DefaultWeatherService) GetCached(city string) (Weather, bool) {
	rec, err := s.repo.FetchCachedData(city)
	if err != nil {
		return Weather{}, false
	}
	if time.Now().After(rec.ExpiresAt) {
		return Weather{}, false
	}
	return Weather{Temperature: rec.Temperature, FetchedAt: rec.FetchedAt}, true
}

// ListCached returns all non-expired cached records as a map of city->Weather.
func (s *DefaultWeatherService) ListCached() map[string]Weather {
	out := make(map[string]Weather)
	m := s.repo.ListCached()
	for city, rec := range m {
		if time.Now().Before(rec.ExpiresAt) {
			out[city] = Weather{Temperature: rec.Temperature, FetchedAt: rec.FetchedAt}
		}
	}
	return out
}
