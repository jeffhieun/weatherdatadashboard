import React, { useState } from "react";
import { CityAutoSuggest, CitySuggestion } from "../CityAutoSuggest";
import axios from "axios";
import { FaCloudSun, FaWater, FaThermometerHalf, FaWind, FaTint, FaEye } from "react-icons/fa";
import { fetchWeatherDetails, WeatherDetails } from "../api/weather";
import { WeatherDetail } from "./WeatherDetail";

export default function CurrentWeather() {
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [weatherDetails, setWeatherDetails] = useState<WeatherDetails | null>(null);
  const [flood, setFlood] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingFlood, setLoadingFlood] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [floodError, setFloodError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const formatTemp = (temp: number) => {
    if (unit === 'F') {
      return `${(temp * 9/5 + 32).toFixed(1)}°F`;
    }
    return `${temp.toFixed(1)}°C`;
  };

  const handleSelectCity = async (city: CitySuggestion) => {
    setSelectedCity(city);
    setData(null);
    setFlood(null);
    setWeatherDetails(null);
    setError(null);
    setFloodError(null);
    setDetailsError(null);
    
    // Fetch weather
    setLoading(true);
    try {
      const res = await axios.get(`/api/weather/current?city=${encodeURIComponent(city.name)}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }

    // Fetch flood risk
    setLoadingFlood(true);
    try {
      const res = await axios.get(`/api/flood/risk?latitude=${city.lat}&longitude=${city.lon}`);
      setFlood(res.data);
    } catch (err: any) {
      setFloodError(err?.message || "Failed to fetch flood risk");
    } finally {
      setLoadingFlood(false);
    }

    // Fetch weather details
    setLoadingDetails(true);
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
    <div style={{
      padding: "32px",
      maxWidth: "1000px",
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "20px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px"
      }}>
        <h2 style={{
          color: "#000000",
          fontSize: "32px",
          fontWeight: "600",
          margin: 0,
          letterSpacing: "-0.02em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Get Current Weather
        </h2>
        <div style={{
          display: "flex",
          gap: "0",
          background: "rgba(209, 213, 219, 0.3)",
          padding: "3px",
          borderRadius: "10px"
        }}>
          <button
            onClick={() => setUnit('C')}
            style={{
              padding: "8px 16px",
              background: unit === 'C' ? "white" : "transparent",
              color: unit === 'C' ? "#007aff" : "#6e6e73",
              border: "none",
              borderRadius: "7px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              boxShadow: unit === 'C' ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none"
            }}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('F')}
            style={{
              padding: "8px 16px",
              background: unit === 'F' ? "white" : "transparent",
              color: unit === 'F' ? "#007aff" : "#6e6e73",
              border: "none",
              borderRadius: "7px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              boxShadow: unit === 'F' ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none"
            }}
          >
            °F
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
      }}>
        <label style={{
          display: "block",
          marginBottom: "12px",
          fontWeight: "600",
          color: "#000000",
          fontSize: "15px",
          letterSpacing: "-0.01em",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Search City
        </label>
        <CityAutoSuggest onSelect={handleSelectCity} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "18px",
          background: "rgba(255, 59, 48, 0.1)",
          border: "1px solid rgba(255, 59, 48, 0.2)",
          borderRadius: "12px",
          color: "#d70015",
          fontWeight: "500",
          fontSize: "15px",
          marginBottom: "24px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          padding: "40px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          color: "#007aff",
          fontSize: "17px",
          fontWeight: "500",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Loading weather data...
        </div>
      )}

      {/* Weather Data */}
      {!loading && data && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px"
        }}>
          {/* Main Weather Card */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "32px",
            borderRadius: "20px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            gridColumn: "1 / -1",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px"
            }}>
              <div>
                <h3 style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#000000",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  letterSpacing: "-0.02em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  <FaCloudSun color="#007aff" size={32} /> {data.city}
                </h3>
                <div style={{
                  fontSize: "15px",
                  color: "#6e6e73",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {data.fetched_at ? (
                    new Date(data.fetched_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  ) : (
                    new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "72px",
                  fontWeight: "200",
                  color: "#000000",
                  lineHeight: "1",
                  letterSpacing: "-0.03em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  marginBottom: "12px"
                }}>
                  {formatTemp(data.temperature)}
                </div>
                <div style={{
                  marginTop: "12px",
                  display: "inline-block",
                  padding: "6px 12px",
                  background: data.cached ? "rgba(0, 122, 255, 0.1)" : "rgba(52, 199, 89, 0.1)",
                  color: data.cached ? "#007aff" : "#34c759",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: `1px solid ${data.cached ? "rgba(0, 122, 255, 0.2)" : "rgba(52, 199, 89, 0.2)"}`,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {data.cached ? "Cached" : "Live"}
                </div>
              </div>
            </div>
            {data.summary && (
              <div style={{
                padding: "20px",
                background: "rgba(0, 122, 255, 0.08)",
                borderRadius: "14px",
                color: "#000000",
                fontSize: "17px",
                lineHeight: "1.6",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                border: "1px solid rgba(0, 122, 255, 0.15)"
              }}>
                {data.summary}
              </div>
            )}
          </div>

          {/* Weather Details */}
          {weatherDetails && (
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "28px",
              borderRadius: "20px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)"
            }}>
              <h4 style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#000000",
                marginTop: 0,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Weather Details
              </h4>
              <WeatherDetail data={weatherDetails} />
            </div>
          )}

          {/* Flood Risk */}
          {flood && (
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "28px",
              borderRadius: "20px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)"
            }}>
              <h4 style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#000000",
                marginTop: 0,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Flood Risk
              </h4>
              <div style={{
                padding: "24px",
                background: flood.flood_risk === "high" 
                  ? "rgba(255, 59, 48, 0.12)" 
                  : flood.flood_risk === "medium" 
                  ? "rgba(255, 149, 0, 0.12)" 
                  : "rgba(52, 199, 89, 0.12)",
                border: `1.5px solid ${
                  flood.flood_risk === "high" 
                    ? "rgba(255, 59, 48, 0.3)" 
                    : flood.flood_risk === "medium" 
                    ? "rgba(255, 149, 0, 0.3)" 
                    : "rgba(52, 199, 89, 0.3)"
                }`,
                borderRadius: "14px",
                marginBottom: "16px"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: flood.flood_risk === "high" 
                    ? "#d70015" 
                    : flood.flood_risk === "medium" 
                    ? "#ff9500" 
                    : "#34c759",
                  textTransform: "capitalize",
                  marginBottom: "12px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  letterSpacing: "-0.02em"
                }}>
                  {flood.flood_risk}
                </div>
                <div style={{
                  fontSize: "17px",
                  color: "#000000",
                  fontWeight: "500",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Probability: {(flood.probability * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{
                fontSize: "13px",
                color: "#6e6e73",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Coordinates: {flood.coords.lat.toFixed(4)}, {flood.coords.lon.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
