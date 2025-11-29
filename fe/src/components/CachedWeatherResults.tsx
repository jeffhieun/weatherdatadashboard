import React, { useState, useEffect } from "react";
import { getResults } from "../api";

interface WeatherResult {
  city: string;
  temperature: number;
  fetched_at: string;
}

export const CachedWeatherResults: React.FC = () => {
  const [results, setResults] = useState<WeatherResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getResults();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cached results");
    } finally {
      setLoading(false);
    }
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

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "#ff3b30"; // Hot - Red
    if (temp >= 20) return "#ff9500"; // Warm - Orange
    if (temp >= 10) return "#007aff"; // Cool - Blue
    return "#5ac8fa"; // Cold - Light Blue
  };

  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "32px",
          borderRadius: "18px",
          textAlign: "center",
          fontSize: "17px",
          color: "#000000",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        Loading cached weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "rgba(255, 59, 48, 0.1)",
          border: "1px solid rgba(255, 59, 48, 0.3)",
          padding: "24px",
          borderRadius: "12px",
          color: "#ff3b30",
          fontSize: "15px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "32px",
        borderRadius: "18px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#000000",
              margin: "0 0 4px 0",
              letterSpacing: "-0.5px",
            }}
          >
            📦 Cached Weather Data
          </h3>
          <p
            style={{
              fontSize: "15px",
              color: "#86868b",
              margin: 0,
              fontWeight: "400",
            }}
          >
            {results.length} {results.length === 1 ? "record" : "records"} in cache
          </p>
        </div>
        <button
          onClick={loadResults}
          style={{
            padding: "12px 24px",
            background: "#007aff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0, 122, 255, 0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0051d5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#007aff")}
        >
          🔄 Refresh
        </button>
      </div>

      {results.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#86868b",
            fontSize: "15px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p style={{ margin: 0 }}>No cached weather data available</p>
          <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
            Fetch weather for a city to see results here
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                background: "rgba(242, 242, 247, 0.95)",
                borderRadius: "14px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "20px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(242, 242, 247, 1)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(242, 242, 247, 0.95)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* City Name */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#86868b",
                    marginBottom: "4px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  City
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "600",
                    color: "#000000",
                  }}
                >
                  {result.city}
                </div>
              </div>

              {/* Temperature */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: getTemperatureColor(result.temperature),
                    lineHeight: "1",
                  }}
                >
                  {result.temperature.toFixed(1)}°
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#86868b",
                    marginTop: "4px",
                    fontWeight: "500",
                  }}
                >
                  Celsius
                </div>
              </div>

              {/* Timestamp */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#86868b",
                    marginBottom: "4px",
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
          ))}
        </div>
      )}
    </div>
  );
};
