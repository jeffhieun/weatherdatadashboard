package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/jeffhieun/weatherdatadashboard/internal/store"
)

type GeocodeService struct {
	repo     store.WeatherRepository
	cacheTTL time.Duration
}

func NewGeocodeService(repo store.WeatherRepository, cacheTTL time.Duration) *GeocodeService {
	return &GeocodeService{repo: repo, cacheTTL: cacheTTL}
}

type CitySuggestion struct {
	Name    string  `json:"name"`
	Country string  `json:"country"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
}

func (g *GeocodeService) SearchCity(query string) ([]CitySuggestion, error) {
	// Optionally cache city search results
	geoURL := fmt.Sprintf("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=5&language=en&format=json", url.QueryEscape(query))
	resp, err := http.Get(geoURL)
	if err != nil {
		return nil, fmt.Errorf("failed to geocode city: %w", err)
	}
	defer resp.Body.Close()
	var geo struct {
		Results []struct {
			Name      string  `json:"name"`
			Country   string  `json:"country"`
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return nil, fmt.Errorf("invalid geocoding response: %w", err)
	}
	if len(geo.Results) == 0 {
		return nil, fmt.Errorf("no results found")
	}
	results := make([]CitySuggestion, 0, len(geo.Results))
	for _, r := range geo.Results {
		results = append(results, CitySuggestion{
			Name:    r.Name,
			Country: r.Country,
			Lat:     r.Latitude,
			Lon:     r.Longitude,
		})
	}
	return results, nil
}
