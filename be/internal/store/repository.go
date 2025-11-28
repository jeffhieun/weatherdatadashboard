package store

import (
	"fmt"
	"sync"
	"time"
)

// CacheRecord represents a cached weather value stored by the repository.
type CacheRecord struct {
	Temperature float64
	FetchedAt   time.Time
	ExpiresAt   time.Time
}

// WeatherRepository defines storage operations used by the service layer.
type WeatherRepository interface {
	FetchCachedData(city string) (CacheRecord, error)
	// SaveCachedData persists a cache record for a city.
	SaveCachedData(city string, rec CacheRecord) error
	// ListCached returns all cached records (city -> record).
	ListCached() map[string]CacheRecord
	Close()
}

// PostgresRepository is a placeholder concrete implementation that would
// connect to a Postgres database in a real application. This mock implementation
// returns a not-found error to indicate a cache miss.
type PostgresRepository struct {
	// In-memory placeholder storage for cached records.
	mu    sync.RWMutex
	store map[string]CacheRecord
}

// NewPostgresRepository creates a new PostgresRepository. Replace with real
// initialization (connection string, pooling, etc.).
func NewPostgresRepository() *PostgresRepository {
	return &PostgresRepository{store: make(map[string]CacheRecord)}
}

// FetchCachedData tries to retrieve cached data for the provided city.
// This placeholder always returns an error to indicate no cache entry.
func (p *PostgresRepository) FetchCachedData(city string) (CacheRecord, error) {
	p.mu.RLock()
	defer p.mu.RUnlock()
	rec, ok := p.store[city]
	if !ok {
		return CacheRecord{}, fmt.Errorf("cache miss for city=%s", city)
	}
	return rec, nil
}

// SaveCachedData stores a cache record in memory.
func (p *PostgresRepository) SaveCachedData(city string, rec CacheRecord) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.store[city] = rec
	return nil
}

// ListCached returns a copy of the in-memory cache map.
func (p *PostgresRepository) ListCached() map[string]CacheRecord {
	p.mu.RLock()
	defer p.mu.RUnlock()
	out := make(map[string]CacheRecord, len(p.store))
	for k, v := range p.store {
		out[k] = v
	}
	return out
}

// Close releases any resources held by the repository.
func (p *PostgresRepository) Close() {
	// Close connections if necessary. No-op in this placeholder.
	_ = time.Now()
}
