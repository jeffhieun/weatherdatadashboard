import React, { useState } from "react";
import { CityAutoSuggest, CitySuggestion } from "../CityAutoSuggest";
import { fetchWeatherDetails, WeatherDetails } from "../api/weather";
import { fetchFloodRisk, FloodRiskData } from "../api/flood";
import { WeatherDetail } from "./WeatherDetail";
import { FloodRiskDisplay } from "./FloodRiskDisplay";

interface WeatherResult {
  city: string;
  temperature: number;
  fetched_at: string;
}

export default function WeatherDateFilter() {
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [results, setResults] = useState<WeatherResult[]>([]);
  const [weatherDetails, setWeatherDetails] = useState<WeatherDetails | null>(null);
  const [floodRisk, setFloodRisk] = useState<FloodRiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingFloodRisk, setLoadingFloodRisk] = useState(false);
  const [error, setError] = useState("");

  const handleSelectCity = async (city: CitySuggestion) => {
    setSelectedCity(city);
    
    // Automatically fetch weather details for the selected city
    setLoadingDetails(true);
    try {
      const details = await fetchWeatherDetails(city.name);
      setWeatherDetails(details);
    } catch (err) {
      console.error("Failed to fetch weather details:", err);
      setWeatherDetails(null);
    } finally {
      setLoadingDetails(false);
    }

    // Automatically fetch flood risk data for the selected city
    setLoadingFloodRisk(true);
    try {
      const risk = await fetchFloodRisk(city.lat, city.lon);
      setFloodRisk(risk);
    } catch (err) {
      console.error("Failed to fetch flood risk:", err);
      setFloodRisk(null);
    } finally {
      setLoadingFloodRisk(false);
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("city", selectedCity.name);
      if (date) {
        const [year, month, day] = date.split("-");
        if (year) params.append("year", year);
        if (month) params.append("month", month);
        if (day) params.append("day", day);
      }
      
      const res = await fetch(`/api/weather/results?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCity(null);
    setDate("");
    setResults([]);
    setWeatherDetails(null);
    setFloodRisk(null);
    setError("");
  };

  return (
    <div style={{ 
      padding: "40px", 
      maxWidth: "900px", 
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      borderRadius: "20px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)"
    }}>
      <h2 style={{ 
        color: "#000000", 
        marginBottom: "12px", 
        fontSize: "32px",
        fontWeight: "600",
        letterSpacing: "-0.02em",
        textAlign: "center"
      }}>
        Filter Weather by Date
      </h2>
      <p style={{
        color: "#6e6e73",
        fontSize: "17px",
        textAlign: "center",
        marginBottom: "36px",
        fontWeight: "400"
      }}>
        Select a date to view historical weather data
      </p>

      
      <div style={{ 
        background: "rgba(255, 255, 255, 0.8)", 
        padding: "32px", 
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "20px",
          marginBottom: "28px"
        }}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600",
              color: "#000000",
              fontSize: "15px",
              letterSpacing: "-0.01em",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              City
            </label>
            <CityAutoSuggest onSelect={handleSelectCity} />
          </div>
          
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600",
              color: "#000000",
              fontSize: "15px",
              letterSpacing: "-0.01em"
            }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "16px 18px", 
                border: "1.5px solid rgba(0, 0, 0, 0.12)",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "12px",
                fontSize: "17px",
                color: "#000000",
                transition: "all 0.3s ease",
                outline: "none",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007aff";
                e.target.style.boxShadow = "0 0 0 4px rgba(0, 122, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 0, 0, 0.12)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "16px" }}>
          <button 
            onClick={fetchWeather} 
            disabled={loading}
            style={{ 
              flex: 1,
              padding: "18px 28px", 
              background: loading ? "#d1d1d6" : "#007aff",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontSize: "17px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              letterSpacing: "-0.01em",
              boxShadow: loading ? "none" : "0 2px 8px rgba(0, 122, 255, 0.25)"
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#0051d5")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#007aff")}
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button 
            onClick={clearFilters}
            style={{ 
              padding: "18px 28px",
              background: "rgba(255, 255, 255, 0.95)",
              color: "#007aff",
              border: "1.5px solid rgba(0, 122, 255, 0.3)",
              borderRadius: "14px",
              fontSize: "17px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              letterSpacing: "-0.01em"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#007aff";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderColor = "#007aff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
              e.currentTarget.style.color = "#007aff";
              e.currentTarget.style.borderColor = "rgba(0, 122, 255, 0.3)";
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Weather Details - Show below filter inputs */}
      {loadingDetails && (
        <div
          style={{
            background: "rgba(242, 242, 247, 0.95)",
            padding: "24px",
            borderRadius: "12px",
            marginTop: "24px",
            textAlign: "center",
            fontSize: "17px",
            color: "#000000",
          }}
        >
          Loading weather details...
        </div>
      )}
      
      {weatherDetails && !loadingDetails && (
        <div style={{ marginTop: "24px" }}>
          <WeatherDetail data={weatherDetails} />
        </div>
      )}

      {/* Flood Risk - Show below weather details */}
      {loadingFloodRisk && (
        <div
          style={{
            background: "rgba(242, 242, 247, 0.95)",
            padding: "24px",
            borderRadius: "12px",
            marginTop: "24px",
            textAlign: "center",
            fontSize: "17px",
            color: "#000000",
          }}
        >
          Loading flood risk data...
        </div>
      )}
      
      {floodRisk && !loadingFloodRisk && (
        <FloodRiskDisplay 
          data={floodRisk} 
          cityName={selectedCity?.name}
        />
      )}

      {error && (
        <div style={{ 
          marginTop: "24px",
          padding: "18px",
          background: "rgba(255, 59, 48, 0.1)",
          border: "1px solid rgba(255, 59, 48, 0.2)",
          borderRadius: "12px",
          color: "#d70015",
          fontWeight: "500",
          fontSize: "15px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "36px" }}>
          <h3 style={{ 
            color: "#000000", 
            marginBottom: "24px",
            fontSize: "28px",
            fontWeight: "600",
            letterSpacing: "-0.02em",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Results ({results.length})
          </h3>
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {results.map((r, i) => (
              <div 
                key={i}
                style={{
                  padding: "28px",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(0, 122, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.08)";
                }}
              >
                <div style={{ 
                  fontSize: "22px", 
                  fontWeight: "600",
                  color: "#000000",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {r.city}
                </div>
                <div style={{ 
                  fontSize: "56px", 
                  fontWeight: "200",
                  color: "#000000",
                  marginBottom: "16px",
                  letterSpacing: "-0.03em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  lineHeight: "1"
                }}>
                  {r.temperature}°
                </div>
                <div style={{ 
                  fontSize: "15px",
                  color: "#6e6e73",
                  fontWeight: "400",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {new Date(r.fetched_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && date && (
        <div style={{ 
          marginTop: "24px",
          padding: "32px",
          background: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(209, 213, 219, 0.3)",
          textAlign: "center",
          color: "#86868b",
          fontSize: "17px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          No results found for the selected filters
        </div>
      )}
    </div>
  );
}
