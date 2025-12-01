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
	// History APIs
	AppendHistory(city string, data model.WeatherDetails)
	ListHistory(city string) []model.WeatherDetails
	ListAllHistory() map[string][]model.WeatherDetails
	Close()
}

type InMemoryRepository struct {
	mu      sync.RWMutex
	store   map[string]CacheRecord
	history map[string][]model.WeatherDetails
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{store: make(map[string]CacheRecord), history: make(map[string][]model.WeatherDetails)}
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
	// Also append to history for this city
	r.history[city] = append(r.history[city], data)
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

// AppendHistory appends a snapshot without affecting the cache TTL/value.
func (r *InMemoryRepository) AppendHistory(city string, data model.WeatherDetails) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.history[city] = append(r.history[city], data)
}

// ListHistory returns all historical records for a city.
func (r *InMemoryRepository) ListHistory(city string) []model.WeatherDetails {
	r.mu.RLock()
	defer r.mu.RUnlock()
	list := r.history[city]
	// return a copy to avoid external mutation
	out := make([]model.WeatherDetails, len(list))
	copy(out, list)
	return out
}

// ListAllHistory returns historical records grouped by city.
func (r *InMemoryRepository) ListAllHistory() map[string][]model.WeatherDetails {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make(map[string][]model.WeatherDetails, len(r.history))
	for city, list := range r.history {
		copyList := make([]model.WeatherDetails, len(list))
		copy(copyList, list)
		out[city] = copyList
	}
	return out
}
