package store

import (
	"sync"
	"time"

	"github.com/jeffhieun/weatherdatadashboard/internal/model"
)

type CacheRecord struct {
	Weather   model.WeatherDetails
	ExpiresAt time.Time
}

type WeatherRepository interface {
	Get(city string) (model.WeatherDetails, bool)
	Set(city string, data model.WeatherDetails, ttl time.Duration)
	List() map[string]model.WeatherDetails
	Close()
}

type InMemoryRepository struct {
	mu    sync.RWMutex
	store map[string]CacheRecord
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{store: make(map[string]CacheRecord)}
}

func (r *InMemoryRepository) Get(city string) (model.WeatherDetails, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	rec, ok := r.store[city]
	if !ok || time.Now().After(rec.ExpiresAt) {
		return model.WeatherDetails{}, false
	}
	return rec.Weather, true
}

func (r *InMemoryRepository) Set(city string, data model.WeatherDetails, ttl time.Duration) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.store[city] = CacheRecord{Weather: data, ExpiresAt: time.Now().Add(ttl)}
}

func (r *InMemoryRepository) List() map[string]model.WeatherDetails {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make(map[string]model.WeatherDetails)
	for k, v := range r.store {
		if time.Now().Before(v.ExpiresAt) {
			result[k] = v.Weather
		}
	}
	return result
}

func (r *InMemoryRepository) Close() {}
