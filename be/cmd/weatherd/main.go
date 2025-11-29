package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/jeffhieun/weatherdatadashboard/docs"
	"github.com/jeffhieun/weatherdatadashboard/internal/api"
	"github.com/jeffhieun/weatherdatadashboard/internal/config"
	"github.com/jeffhieun/weatherdatadashboard/internal/service"
	"github.com/jeffhieun/weatherdatadashboard/internal/store"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	cfg := config.Load()
	repo := store.NewInMemoryRepository()
	weatherSvc := service.NewDefaultWeatherService(repo, time.Duration(cfg.CacheTTL)*time.Second)
	geocodeSvc := service.NewGeocodeService(repo, time.Duration(cfg.CacheTTL)*time.Second)
	h := api.NewHandler(weatherSvc, geocodeSvc)

	r := gin.Default()

	r.GET("/api/weather/details", h.GetWeatherDetails)
	r.GET("/api/weather/current", h.GetWeatherDetails) // Backward compatibility
	r.GET("/api/weather/result", h.GetCachedResult)
	r.GET("/api/weather/results", h.ListCachedResults)
	r.GET("/api/cities/search", h.SearchCities)
	r.GET("/api/flood/risk", h.FloodRisk)
	r.GET("/api/flood/results", h.ListFloodResults)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Printf("starting weatherd on :%s", cfg.Port)
	if err := r.Run(fmt.Sprintf(":%s", cfg.Port)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
