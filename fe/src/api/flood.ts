import axios from "axios";

export interface FloodRiskData {
  flood_risk: "low" | "medium" | "high";
  probability: number;
  coords: {
    lat: number;
    lon: number;
  };
}

export interface FloodResult {
  city: string;
  risk: "low" | "medium" | "high";
  probability: number;
  fetched_at: string;
}

export async function fetchFloodRisk(latitude: number, longitude: number): Promise<FloodRiskData> {
  const res = await axios.get<FloodRiskData>(`/api/flood/risk?latitude=${latitude}&longitude=${longitude}`);
  return res.data;
}

export async function fetchFloodResults(): Promise<FloodResult[]> {
  const res = await axios.get<FloodResult[]>('/api/flood/results');
  return res.data;
}
