import React, { useEffect, useState } from 'react'
import { getCurrentWeather, getResults, getResult, getCurrentFlood, getFloodResults, getFloodResult } from './api'
import { fetchWeatherDetails, WeatherDetails } from './api/weather';
import { WeatherDetail } from './components/WeatherDetail';
import Skeleton from './Skeleton'
import { CityAutoSuggest, CitySuggestion } from "./CityAutoSuggest";
import WeatherDateFilter from "./components/WeatherDateFilter";
import CurrentWeather from "./components/CurrentWeather";
import { FloodResultsList } from "./components/FloodResultsList";
import { CachedWeatherResults } from "./components/CachedWeatherResults";
import { CachedWeatherLookup } from "./components/CachedWeatherLookup";
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
    <div className="app" style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(to bottom, #ffffff 0%, #f5f5f7 100%)"
    }}>
      <div className="container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        <div style={{ 
          marginBottom: "32px",
          textAlign: "center"
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "600",
            color: "#000000",
            margin: "0 0 12px 0",
            letterSpacing: "-0.03em",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Weather Data Dashboard
          </h1>
          <p style={{
            fontSize: "21px",
            color: "#6e6e73",
            margin: 0,
            fontWeight: "400",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Real-time weather information and historical data filtering
          </p>
        </div>

        {/* Date Filter Component */}
        <div style={{ marginBottom: "40px" }}>
          <WeatherDateFilter />
        </div>

        {/* Cached Weather Lookup */}
        <div style={{ marginBottom: "40px" }}>
          <CachedWeatherLookup />
        </div>

        {/* Cached Weather Results */}
        <div style={{ marginBottom: "40px" }}>
          <CachedWeatherResults />
        </div>

        {/* Flood Results List */}
        <div style={{ marginBottom: "40px" }}>
          <FloodResultsList />
        </div>

        <div style={{
          textAlign: "center",
          padding: "20px",
          color: "#86868b",
          fontSize: "13px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Frontend proxy expects backend at http://localhost:8080
        </div>
      </div>
    </div>
  )
}
