import React from "react";
import { FloodRiskData } from "../api/flood";

interface Props {
  data: FloodRiskData;
  cityName?: string;
}

export const FloodRiskDisplay: React.FC<Props> = ({ data, cityName }) => {
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

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "32px",
        borderRadius: "18px",
        marginTop: "24px",
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
        🌊 Flood Risk Assessment
      </h3>
      {cityName && (
        <p
          style={{
            fontSize: "15px",
            color: "#86868b",
            marginBottom: "24px",
            fontWeight: "400",
          }}
        >
          {cityName}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Risk Level */}
        <div
          style={{
            padding: "20px",
            background: getRiskBackground(data.flood_risk),
            borderRadius: "14px",
            border: `1.5px solid ${getRiskColor(data.flood_risk)}33`,
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#86868b",
              marginBottom: "8px",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Risk Level
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: getRiskColor(data.flood_risk),
              textTransform: "capitalize",
            }}
          >
            {data.flood_risk}
          </div>
        </div>

        {/* Probability */}
        <div
          style={{
            padding: "20px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "14px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#86868b",
              marginBottom: "8px",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Probability
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#000000",
            }}
          >
            {(data.probability * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div
        style={{
          padding: "16px",
          background: "rgba(242, 242, 247, 0.6)",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
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
            Latitude
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#000000",
            }}
          >
            {data.coords.lat.toFixed(4)}°
          </div>
        </div>
        <div
          style={{
            width: "1px",
            height: "30px",
            background: "rgba(0, 0, 0, 0.1)",
          }}
        />
        <div style={{ textAlign: "center" }}>
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
            Longitude
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#000000",
            }}
          >
            {data.coords.lon.toFixed(4)}°
          </div>
        </div>
      </div>
    </div>
  );
};
