package api

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jeffhieun/weatherdatadashboard/internal/service"
)

// ...existing code...

// Handler holds dependencies for HTTP handlers in this package.
type Handler struct {
	weatherSvc *service.DefaultWeatherService
	geocodeSvc *service.GeocodeService
}

// NewHandler constructs a new Handler with the provided services.
func NewHandler(weatherSvc *service.DefaultWeatherService, geocodeSvc *service.GeocodeService) *Handler {
	return &Handler{weatherSvc: weatherSvc, geocodeSvc: geocodeSvc}
}

// GetWeatherData godoc
// @Summary      Get current weather
// @Description  Returns the current weather for a city (live fetch, caches result)
// @Tags         weather
// @Param        city  query  string  true  "City name"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /api/weather/current [get]
func (h *Handler) GetWeatherDetails(c *gin.Context) {
	city := c.Query("city")
	if city == "" {
		c.JSON(400, gin.H{"error": "city is required"})
		return
	}
	details, err := h.weatherSvc.GetWeatherDetails(city)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, details)
}

// GetCachedResult godoc
// @Summary      Get cached weather result
// @Description  Returns the cached/latest weather result for a city (no live fetch)
// @Tags         weather
// @Param        city  query  string  true  "City name"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/weather/result [get]
func (h *Handler) GetCachedResult(c *gin.Context) {
	city := c.Query("city")
	if city == "" {
		c.JSON(400, gin.H{"error": "city is required"})
		return
	}

	if rec, ok := h.weatherSvc.GetCached(city); ok {
		c.JSON(200, gin.H{
			"city":        city,
			"temperature": rec.Temperature,
			"fetched_at":  rec.UpdatedAt,
		})
		return
	}
	c.JSON(404, gin.H{"error": "no cached result for city"})
}

// ListCachedResults godoc
// @Summary      List all cached weather results
// @Description  Returns all cached weather records (city, temperature, fetched_at)
// @Tags         weather
// @Success      200  {array}  map[string]interface{}
// @Router       /api/weather/results [get]
func (h *Handler) ListCachedResults(c *gin.Context) {
	m := h.weatherSvc.ListCached()
	out := make([]map[string]interface{}, 0, len(m))

	// Parse optional filters
	dayStr := c.Query("day")
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	var day, month, year int
	var err error
	if dayStr != "" {
		day, err = strconv.Atoi(dayStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid day"})
			return
		}
	}
	if monthStr != "" {
		month, err = strconv.Atoi(monthStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid month"})
			return
		}
	}
	if yearStr != "" {
		year, err = strconv.Atoi(yearStr)
		if err != nil {
			c.JSON(400, gin.H{"error": "invalid year"})
			return
		}
	}

	for city, rec := range m {
		t := rec.UpdatedAt
		if (day == 0 || t.Day() == day) && (month == 0 || int(t.Month()) == month) && (year == 0 || t.Year() == year) {
			out = append(out, map[string]interface{}{
				"city":        city,
				"temperature": rec.Temperature,
				"fetched_at":  rec.UpdatedAt,
			})
		}
	}
	c.JSON(200, out)
}

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

// SearchCities godoc
// @Summary Auto-suggest city search
// @Description Returns up to 5 city suggestions for the given query using Open-Meteo geocoding
// @Tags cities
// @Param query query string true "City name (min 2 chars)"
// @Success 200 {array} CitySuggestion
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/cities/search [get]
func (h *Handler) SearchCities(c *gin.Context) {
	query := c.Query("query")
	if len(query) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query must be at least 2 characters"})
		return
	}
	suggestions, err := h.geocodeSvc.SearchCity(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, suggestions)
}

// FloodRisk godoc
// @Summary      Get flood risk (dynamic demo)
// @Description  Returns a dynamic flood risk for given latitude and longitude
// @Tags         flood
// @Param        latitude  query  string  true  "Latitude"
// @Param        longitude query  string  true  "Longitude"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/flood/risk [get]
func (h *Handler) FloodRisk(c *gin.Context) {
	latStr := c.Query("latitude")
	lonStr := c.Query("longitude")
	var lat, lon float64
	var err error
	if lat, err = strconv.ParseFloat(latStr, 64); err != nil {
		c.JSON(400, gin.H{"error": "invalid latitude"})
		return
	}
	if lon, err = strconv.ParseFloat(lonStr, 64); err != nil {
		c.JSON(400, gin.H{"error": "invalid longitude"})
		return
	}

	// Demo logic: high risk for low-lying/coastal, medium for mid, low for highland
	risk := "low"
	prob := 0.15
	if lat > 8 && lat < 12 && lon > 104 && lon < 110 {
		risk = "high"
		prob = 0.85
	} else if lat > 16 && lat < 22 && lon > 105 && lon < 108 {
		risk = "medium"
		prob = 0.55
	}

	payload := map[string]interface{}{
		"flood_risk":  risk,
		"probability": prob,
		"coords":      map[string]float64{"lat": lat, "lon": lon},
	}
	c.JSON(200, payload)
}

// ListFloodResults godoc
// @Summary      List all cached flood results (stub)
// @Description  Returns all cached flood risk records (stubbed)
// @Tags         flood
// @Success      200  {array}  map[string]interface{}
// @Router       /api/flood/results [get]
func (h *Handler) ListFloodResults(c *gin.Context) {
	// Stub: return a static list for demonstration
	results := []map[string]interface{}{
		{
			"city":        "Hanoi",
			"risk":        "high",
			"probability": 0.82,
			"fetched_at":  time.Now(),
		},
		{
			"city":        "Ho Chi Minh City",
			"risk":        "medium",
			"probability": 0.55,
			"fetched_at":  time.Now(),
		},
	}
	c.JSON(200, results)
}
