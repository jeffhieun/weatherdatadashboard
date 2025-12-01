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

type DefaultWeatherService struct {
	repo     store.WeatherRepository
	cacheTTL time.Duration
}

func NewDefaultWeatherService(repo store.WeatherRepository, cacheTTL time.Duration) *DefaultWeatherService {
	return &DefaultWeatherService{repo: repo, cacheTTL: cacheTTL}
}

// GetWeatherDetails fetches and normalizes detailed weather data for a city.
func (s *DefaultWeatherService) GetWeatherDetails(city string) (model.WeatherDetails, error) {
	if data, ok := s.repo.Get(city); ok {
		// Append a historical snapshot with refreshed timestamp to track views over time
		snap := data
		snap.UpdatedAt = time.Now()
		s.repo.AppendHistory(snap.City, snap)
		return data, nil
	}
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

	sunrise, _ := time.Parse(time.RFC3339, wres.Daily.Sunrise[0])
	sunset, _ := time.Parse(time.RFC3339, wres.Daily.Sunset[0])

	details := model.WeatherDetails{
		City:        cityName,
		Temperature: wres.CurrentWeather.Temperature,
		FeelsLike:   wres.Hourly.ApparentTemperature[idx],
		Humidity:    int(wres.Hourly.RelativeHumidity2m[idx]),
		WindSpeed:   wres.CurrentWeather.WindSpeed,
		WindDir:     fmt.Sprintf("%.0f°", wres.CurrentWeather.WindDir),
		Visibility:  wres.Hourly.Visibility[idx] / 1000.0,
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
	s.repo.Set(city, details, s.cacheTTL)
	// Also record in history under canonical city name
	s.repo.AppendHistory(details.City, details)
	return details, nil
}

// ...existing code...
// GetCached returns a cached value for a city if present (and not expired).
func (s *DefaultWeatherService) GetCached(city string) (model.WeatherDetails, bool) {
	if data, ok := s.repo.Get(city); ok {
		return data, true
	}
	return model.WeatherDetails{}, false
}

// ListCached returns all cached weather details as a map of city to WeatherDetails.
func (s *DefaultWeatherService) ListCached() map[string]model.WeatherDetails {
	return s.repo.List()
}

// ListHistory returns all historical snapshots for a specific city.
func (s *DefaultWeatherService) ListHistory(city string) []model.WeatherDetails {
	return s.repo.ListHistory(city)
}

// ListAllHistory returns historical snapshots grouped by city.
func (s *DefaultWeatherService) ListAllHistory() map[string][]model.WeatherDetails {
	return s.repo.ListAllHistory()
}
