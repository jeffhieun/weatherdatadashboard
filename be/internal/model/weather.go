package model

import "time"

// WeatherDetails is the normalized structure for detailed weather info
// swagger:model
type WeatherDetails struct {
	City        string    `json:"city"`
	Temperature float64   `json:"temperature"`
	FeelsLike   float64   `json:"feelsLike"`
	Humidity    int       `json:"humidity"`
	WindSpeed   float64   `json:"windSpeed"`
	WindDir     string    `json:"windDir"`
	Visibility  float64   `json:"visibility"`
	Pressure    int       `json:"pressure"`
	UVIndex     int       `json:"uvIndex"`
	Sunrise     time.Time `json:"sunrise"`
	Sunset      time.Time `json:"sunset"`
	CloudCover  int       `json:"cloudCover"`
	PrecipProb  float64   `json:"precipProb"`
	Rain        float64   `json:"rain"`
	Snow        float64   `json:"snow"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
