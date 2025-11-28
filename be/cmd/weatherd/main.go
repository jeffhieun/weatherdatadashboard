package main

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/jeffhieun/weatherdatadashboard/docs"
	"github.com/jeffhieun/weatherdatadashboard/internal/api"
	"github.com/jeffhieun/weatherdatadashboard/internal/service"
	"github.com/jeffhieun/weatherdatadashboard/internal/store"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	repo := store.NewPostgresRepository()
	defer repo.Close()

	svc := service.NewDefaultWeatherService(repo)
	h := api.NewHandler(svc)

	r := gin.Default()

	r.GET("/api/weather/current", h.GetWeatherData)
	r.GET("/api/weather/details", h.GetWeatherDetails)
	r.GET("/api/weather/result", h.GetCachedResult)
	r.GET("/api/weather/results", h.ListCachedResults)
	r.GET("/api/cities/search", h.SearchCities)
	r.GET("/api/flood/risk", h.FloodRisk)
	r.GET("/api/flood/results", h.ListFloodResults)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Printf("starting weatherd on :%s", port)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

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
	cacheTTL  = 5 * time.Minute
)

func init() {
	cacheLock.Lock()
	cache["example"] = CacheEntry{
		Data: WeatherData{
			Temperature: 25.0,
			FetchedAt:   time.Now(),
		},
		ExpiresAt: time.Now().Add(cacheTTL),
	}
	cacheLock.Unlock()

	log.Println("Weatherd server initialized with caching layer.")
	log.Println("Swagger documentation available at /swagger/")
}
