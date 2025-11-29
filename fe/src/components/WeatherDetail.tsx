import React from "react";
import { WeatherDetails } from "../api/weather";
import { UvIndexBadge } from "./UvIndexBadge";

interface Props {
  data: WeatherDetails;
}

export const WeatherDetail: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ color: "#000000" }}>
      <div style={{ 
        fontSize: "17px", 
        fontWeight: "400", 
        marginBottom: "16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "12px",
          fontSize: "15px"
        }}>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Feels Like</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.feelsLike.toFixed(1)}°C</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Humidity</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.humidity}%</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Wind</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.windSpeed} m/s</div>
            <div style={{ fontSize: "12px", color: "#6e6e73" }}>{data.windDir}</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Visibility</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.visibility} km</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Pressure</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.pressure} hPa</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Clouds</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{data.cloudCover}%</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>Rain Prob</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>{Math.round(data.precipProb * 100)}%</div>
          </div>
          <div style={{ 
            padding: "12px",
            background: "rgba(242, 242, 247, 0.95)",
            borderRadius: "10px"
          }}>
            <div style={{ color: "#6e6e73", fontSize: "13px", marginBottom: "4px" }}>UV Index</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>
              <UvIndexBadge uv={data.uvIndex} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ 
        display: "flex", 
        gap: "12px",
        marginTop: "16px",
        fontSize: "15px",
        color: "#000000"
      }}>
        <div style={{ 
          flex: 1,
          padding: "12px",
          background: "rgba(255, 204, 0, 0.15)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 204, 0, 0.3)"
        }}>
          <div style={{ fontSize: "13px", color: "#6e6e73", marginBottom: "4px" }}>Sunrise</div>
          <div style={{ fontSize: "17px", fontWeight: "600" }}>
            {new Date(data.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div style={{ 
          flex: 1,
          padding: "12px",
          background: "rgba(255, 149, 0, 0.15)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 149, 0, 0.3)"
        }}>
          <div style={{ fontSize: "13px", color: "#6e6e73", marginBottom: "4px" }}>Sunset</div>
          <div style={{ fontSize: "17px", fontWeight: "600" }}>
            {new Date(data.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
      <div style={{ 
        marginTop: "16px",
        color: "#6e6e73", 
        fontSize: "13px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        Updated: {new Date(data.updatedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};
