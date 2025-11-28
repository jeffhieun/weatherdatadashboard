import React from "react";
import { WeatherDetails } from "../api/weather";
import { UvIndexBadge } from "./UvIndexBadge";

interface Props {
  data: WeatherDetails;
}

export const WeatherDetail: React.FC<Props> = ({ data }) => {
  return (
    <div className="weather-detail-card">
      <h2 style={{ marginBottom: 8 }}>{data.city}</h2>
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        {data.temperature.toFixed(1)}°C
        <span style={{ fontSize: 16, color: "#94a3b8", marginLeft: 8 }}>
          Feels like {data.feelsLike.toFixed(1)}°C
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
        <div>Humidity: <b>{data.humidity}%</b></div>
        <div>Wind: <b>{data.windSpeed} m/s {data.windDir}</b></div>
        <div>Visibility: <b>{data.visibility} km</b></div>
        <div>Pressure: <b>{data.pressure} hPa</b></div>
        <div>Clouds: <b>{data.cloudCover}%</b></div>
        <div>Precip. Prob: <b>{Math.round(data.precipProb * 100)}%</b></div>
        <div>Rain: <b>{data.rain} mm</b></div>
        <div>Snow: <b>{data.snow} mm</b></div>
        <div>
          <UvIndexBadge uv={data.uvIndex} />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <span>Sunrise: <b>{new Date(data.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b></span>
        <span style={{ marginLeft: 16 }}>Sunset: <b>{new Date(data.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b></span>
      </div>
      <div style={{ color: "#94a3b8", fontSize: 13 }}>
        Updated: {new Date(data.updatedAt).toLocaleString()}
      </div>
    </div>
  );
};
