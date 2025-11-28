import React, { useEffect, useState } from 'react'
import { getCurrentWeather, getResults, getResult, getCurrentFlood, getFloodResults, getFloodResult } from './api'
import { fetchWeatherDetails, WeatherDetails } from './api/weather';
import { WeatherDetail } from './components/WeatherDetail';
import Skeleton from './Skeleton'
import { CityAutoSuggest, CitySuggestion } from "./CityAutoSuggest";
import axios from "axios";
import "./styles.css";
import { FaCloudSun, FaWater } from "react-icons/fa";

export default function App() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [floodResults, setFloodResults] = useState<any[]>([])
  const [city, setCity] = useState<string>('')
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingFloodResults, setLoadingFloodResults] = useState(false)
  const [flood, setFlood] = useState<any | null>(null);
  const [loadingFlood, setLoadingFlood] = useState(false);
  const [floodError, setFloodError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [weatherDetails, setWeatherDetails] = useState<WeatherDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  async function loadResults() {
    setLoadingResults(true)
    try {
      const r = await getResults()
      setResults(r)
    } catch (err: any) {
      // Non-fatal for UI — show a message in error box
      setError(err?.message || String(err))
    } finally {
      setLoadingResults(false)
    }
  }

  async function loadFloodResults() {
    setLoadingFloodResults(true)
    try {
      const r = await getFloodResults()
      setFloodResults(r)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoadingFloodResults(false)
    }
  }

  useEffect(() => {
    loadResults()
    loadFloodResults()
  }, [])

  useEffect(() => {
    try {
      const v = localStorage.getItem('weather_unit')
      if (v === 'F' || v === 'C') setUnit(v)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('weather_unit', unit) } catch (e) { }
  }, [unit])

  async function fetchWeather() {
    setLoading(true)
    setError(null)
    try {
      const res = await getCurrentWeather(city && city.trim() !== '' ? city.trim() : undefined)
      setData(res)
      // refresh cached results after a successful fetch
      await loadResults()
  await loadFloodResults()
    } catch (err: any) {
      setError(err?.message || String(err))
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadCityResult(city: string) {
    setError(null)
    try {
      const res = await getResult(city)
      setData(res)
    } catch (err: any) {
      setError(err?.message || String(err))
      setData(null)
    }
  }

  async function fetchFlood() {
    setLoadingFlood(true)
    setError(null)
    try {
      const res = await getCurrentFlood(city && city.trim() !== '' ? city.trim() : undefined)
      setFlood(res)
      await loadFloodResults()
    } catch (err: any) {
      setError(err?.message || String(err))
      setFlood(null)
    } finally {
      setLoadingFlood(false)
    }
  }

  async function loadCityFloodResult(city: string) {
    setError(null)
    try {
      const res = await getFloodResult(city)
      setFlood(res)
    } catch (err: any) {
      setError(err?.message || String(err))
      setFlood(null)
    }
  }

  function formatFetched(dateStr?: string | null) {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
    } catch (e) {
      return new Date(dateStr).toLocaleString()
    }
  }

  function cToF(c: number) {
    return (c * 9) / 5 + 32
  }

  function formatTempValue(v: any) {
    if (typeof v !== 'number') return String(v)
    if (unit === 'C') return `${v.toFixed(1)}°C`
    return `${cToF(v).toFixed(1)}°F`
  }

  const handleSelectCity = async (city: CitySuggestion) => {
    setSelectedCity(city);
    setData(null);
    setFlood(null);
    setWeatherDetails(null);
    setError(null);
    setFloodError(null);
    setDetailsError(null);
    setLoading(true);
    setLoadingFlood(true);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`/api/weather/current?city=${encodeURIComponent(city.name)}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
    try {
      const res = await axios.get(`/api/flood/risk?latitude=${city.lat}&longitude=${city.lon}`);
      setFlood(res.data);
    } catch (err: any) {
      setFloodError(err?.message || "Failed to fetch flood risk");
    } finally {
      setLoadingFlood(false);
    }
    try {
      const details = await fetchWeatherDetails(city.name);
      setWeatherDetails(details);
    } catch (err: any) {
      setDetailsError(err?.message || "Failed to fetch weather details");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="app" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="hero card">
          <div>
            <h1>Weather Data Dashboard</h1>
            <p>Enter a city to fetch current weather. Cached results appear on the right.</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="unit-toggle">
                <button className={unit === 'C' ? 'active' : ''} onClick={() => setUnit('C')}>°C</button>
                <button className={unit === 'F' ? 'active' : ''} onClick={() => setUnit('F')}>°F</button>
              </div>
              {loading ? <div className="spinner" /> : null}
            </div>
          </div>
        </div>

        <div className="grid">
          <div>
            <div className="card">
              <h2>Get current weather</h2>
              <div className="controls">
                <CityAutoSuggest onSelect={handleSelectCity} />
                <button className="secondary" onClick={loadResults}>Cache</button>
              </div>

              {error && (
                <div className="error">Error: {error}</div>
              )}

              {loading && !data ? (
                <div style={{ marginTop: 12 }}>
                  <h3>Result</h3>
                  <Skeleton lines={4} height={14} />
                </div>
              ) : data ? (
                <div style={{ marginTop: 12 }}>
                  <h3>Result</h3>
                  <div className="weather-card animated-fade-in">
                    <div className="weather-card-top">
                      <span className="weather-city"><FaCloudSun style={{marginRight:8, color:'#7ee8fa'}} />{data.city}</span>
                      <span className="weather-temp">
                        {formatTempValue(data.temperature)}
                      </span>
                    </div>
                    <div className="weather-meta">
                      <span>Fetched: {formatFetched(data.fetched_at)}</span>
                      <span className="weather-cached">{data.cached ? "Cached" : "Live"}</span>
                    </div>
                    {data.summary ? <div className="result-summary">{data.summary}</div> : null}
                  </div>
                  {/* Weather details card */}
                  <div style={{ marginTop: 12 }}>
                    <h3>Weather details</h3>
                    {loadingDetails && <Skeleton lines={6} height={16} />}
                    {detailsError && <div className="error">{detailsError}</div>}
                    {weatherDetails && <WeatherDetail data={weatherDetails} />}
                  </div>
                  {/* Flood risk card */}
                  <div style={{ marginTop: 12 }}>
                    <h3>Flood risk</h3>
                    {loadingFlood && <div className="spinner" style={{ margin: "18px 0" }} />}
                    {floodError && <p className="error">{floodError}</p>}
                    {flood && (
                      <div className="flood-card animated-slide-in">
                        <div className="flood-card-top">
                          <span className="flood-risk-label"><FaWater style={{marginRight:8, color:'#ffb347'}} />Flood Risk:</span>
                          <span className="flood-risk-value">{flood.flood_risk}</span>
                        </div>
                        <div className="flood-meta">
                          <span>Probability: {(flood.probability * 100).toFixed(0)}%</span>
                          <span>Coords: {flood.coords.lat}, {flood.coords.lon}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside>
            <div className="card cached">
              <h2>Cached results</h2>
              {loadingResults ? (
                <Skeleton lines={4} height={16} />
              ) : results.length === 0 ? (
                <div className="muted">No cached results yet.</div>
              ) : (
                <ul>
                  {results.map((r: any) => (
                    <li key={r.city}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong onClick={() => loadCityResult(r.city)} style={{ cursor: 'pointer' }}>{r.city}</strong>
                          <small style={{ color: 'var(--muted)' }}>{formatFetched(r.fetched_at)}</small>
                        </div>
                        <div style={{ color: 'var(--muted)' }}>{formatTempValue(r.temperature)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card cached" style={{ marginTop: 12 }}>
              <h2>Cached flood</h2>
              {loadingFloodResults ? (
                <Skeleton lines={4} height={16} />
              ) : floodResults.length === 0 ? (
                <div className="muted">No cached flood results yet.</div>
              ) : (
                <ul>
                  {floodResults.map((r: any) => (
                    <li key={r.city}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong onClick={() => loadCityFloodResult(r.city)} style={{ cursor: 'pointer' }}>{r.city}</strong>
                          <small style={{ color: 'var(--muted)' }}>{formatFetched(r.fetched_at)}</small>
                        </div>
                        <div style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{r.risk}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <div className="footer">Frontend proxy expects backend at http://localhost:8080</div>
      </div>
    </div>
  )
}
