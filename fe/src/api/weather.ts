import axios from "axios";

export interface WeatherDetails {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  cloudCover: number;
  precipProb: number;
  rain: number;
  snow: number;
  updatedAt: string;
}

export async function fetchWeatherDetails(city: string): Promise<WeatherDetails> {
  const res = await axios.get<WeatherDetails>(`/api/weather/details?city=${encodeURIComponent(city)}`);
  return res.data;
}
