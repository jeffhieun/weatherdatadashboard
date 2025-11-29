import React, { useState } from "react";
import { getResult } from "../api";

interface WeatherResult {
  city: string;
  temperature: number;
  fetched_at: string;
}

export const CachedWeatherLookup: React.FC = () => {
  const [city, setCity] = useState("");
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await getResult(city.trim());
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No cached data found for this city"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "#ff3b30"; // Hot - Red
    if (temp >= 20) return "#ff9500"; // Warm - Orange
    if (temp >= 10) return "#007aff"; // Cool - Blue
    return "#5ac8fa"; // Cold - Light Blue
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "32px",
        borderRadius: "18px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h3
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#000000",
          margin: "0 0 8px 0",
          letterSpacing: "-0.5px",
        }}
      >
        🔍 Lookup Cached Weather
      </h3>
      <p
        style={{
          fontSize: "15px",
          color: "#86868b",
          marginBottom: "24px",
          fontWeight: "400",
        }}
      >
        Search for a specific city's cached weather data
      </p>

      {/* Search Input */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter city name..."
          style={{
            flex: 1,
            padding: "16px 18px",
            border: "1.5px solid rgba(0, 0, 0, 0.12)",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            fontSize: "17px",
            color: "#000000",
            transition: "all 0.3s ease",
            outline: "none",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{
            padding: "16px 32px",
            background: loading ? "#d1d1d6" : "#007aff",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: loading ? "none" : "0 2px 8px rgba(0, 122, 255, 0.25)",
          }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.background = "#0051d5")
          }
          onMouseLeave={(e) =>
            !loading && (e.currentTarget.style.background = "#007aff")
          }
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "rgba(255, 59, 48, 0.1)",
            border: "1px solid rgba(255, 59, 48, 0.3)",
            padding: "16px 20px",
            borderRadius: "12px",
            color: "#ff3b30",
            fontSize: "15px",
            marginBottom: "20px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          style={{
            padding: "28px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#86868b",
                  marginBottom: "6px",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                City
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#000000",
                }}
              >
                {result.city}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: "700",
                  color: getTemperatureColor(result.temperature),
                  lineHeight: "1",
                }}
              >
                {result.temperature.toFixed(1)}°
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#86868b",
                  marginTop: "8px",
                  fontWeight: "500",
                }}
              >
                Celsius
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#86868b",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Cached At
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#000000",
              }}
            >
              {formatDate(result.fetched_at)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
