import React, { useState, useEffect } from "react";
import { fetchFloodResults, FloodResult } from "../api/flood";

export const FloodResultsList: React.FC = () => {
  const [results, setResults] = useState<FloodResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFloodResults();
  }, []);

  const loadFloodResults = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFloodResults();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flood results");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "#ff3b30";
      case "medium":
        return "#ff9500";
      case "low":
        return "#34c759";
      default:
        return "#8e8e93";
    }
  };

  const getRiskBackground = (risk: string) => {
    switch (risk) {
      case "high":
        return "rgba(255, 59, 48, 0.1)";
      case "medium":
        return "rgba(255, 149, 0, 0.1)";
      case "low":
        return "rgba(52, 199, 89, 0.1)";
      default:
        return "rgba(142, 142, 147, 0.1)";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "32px",
          borderRadius: "18px",
          textAlign: "center",
          fontSize: "17px",
          color: "#000000",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        Loading flood results...
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
        {error}
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
          marginBottom: "8px",
          letterSpacing: "-0.5px",
        }}
      >
        🌊 Recent Flood Risk Assessments
      </h3>
      <p
        style={{
          fontSize: "15px",
          color: "#86868b",
          marginBottom: "24px",
          fontWeight: "400",
        }}
      >
        Cached flood risk data for various locations
      </p>

      {results.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#86868b",
            fontSize: "15px",
            padding: "32px",
          }}
        >
          No flood risk data available
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                background: getRiskBackground(result.risk),
                borderRadius: "12px",
                border: `1.5px solid ${getRiskColor(result.risk)}33`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: "600",
                    color: "#000000",
                    marginBottom: "4px",
                  }}
                >
                  {result.city}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#86868b",
                  }}
                >
                  {new Date(result.fetched_at).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: getRiskColor(result.risk),
                    textTransform: "capitalize",
                    marginBottom: "2px",
                  }}
                >
                  {result.risk}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#000000",
                  }}
                >
                  {(result.probability * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
