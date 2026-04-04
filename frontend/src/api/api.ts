/**
 * EcoSenitel API — connects to Flask backend at http://127.0.0.1:5000
 */

// In dev the vite proxy forwards /api/* → http://127.0.0.1:5000/api/*
// In production (Flask serves the built frontend) it hits the same origin.
export const BASE_URL = "";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TrendDataPoint {
  year: number;
  month: number;
  stability_score: number;
  resilience_score: number;
  status: string;
}

export interface ModelMetrics {
  mae: number;
  r2: number;
}

export interface AquaticResponse {
  ecosystem: "aquatic";
  stability_score: number;
  collapse_risk_score: number;
  status: string;
  risk_category: string;
  trend_slope: number;
  trend_direction: "improving" | "declining";
  model_metrics: ModelMetrics;
  feature_importance: Record<string, number>;
  trend_data: TrendDataPoint[];
  status_distribution: Record<string, number>;
  simulated?: boolean;
  simulation_params?: Record<string, number>;
}

export interface TerrestrialResponse {
  ecosystem: "terrestrial";
  stability_score: number;
  collapse_risk_score: number;
  status: string;
  risk_category: string;
  trend_slope: number;
  trend_direction: "improving" | "declining";
  model_metrics: ModelMetrics;
  feature_importance: Record<string, number>;
  trend_data: TrendDataPoint[];
  status_distribution: Record<string, number>;
  simulated?: boolean;
  simulation_params?: Record<string, number>;
}

export interface CombinedTrendPoint {
  year: number;
  month: number;
  aquatic_stability: number;
  terrestrial_stability: number;
  final_stability: number;
  risk_score: number;
  risk_category: string;
}

export interface CombinedResponse {
  ecosystem: "combined";
  final_stability_score: number;
  aquatic_stability_score: number;
  terrestrial_stability_score: number;
  collapse_risk_score: number;
  risk_category: string;
  model_metrics: ModelMetrics;
  feature_importance: Record<string, number>;
  trend_data: CombinedTrendPoint[];
  risk_distribution: Record<string, number>;
  aquatic_summary: { status: string; trend_direction: string };
  terrestrial_summary: { status: string; trend_direction: string };
}

// ── Fetch helpers ──────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: Record<string, number>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json() as Promise<T>;
}

// ── Public API ─────────────────────────────────────────────────────────────

export const fetchAquatic = (): Promise<AquaticResponse> =>
  get<AquaticResponse>("/api/aquatic");

export const fetchTerrestrial = (): Promise<TerrestrialResponse> =>
  get<TerrestrialResponse>("/api/terrestrial");

export const fetchCombined = (): Promise<CombinedResponse> =>
  get<CombinedResponse>("/api/combined");

export const simulateAquatic = (params: {
  capture_change?: number;
  temp_change?: number;
  turbidity_change?: number;
}): Promise<AquaticResponse> =>
  post<AquaticResponse>("/api/simulate/aquatic", params as Record<string, number>);

export const simulateTerrestrial = (params: {
  temp_change?: number;
  co2_change?: number;
  deforestation_change?: number;
  soil_change?: number;
}): Promise<TerrestrialResponse> =>
  post<TerrestrialResponse>("/api/simulate/terrestrial", params as Record<string, number>);

export const generateSampleData = (): Promise<{ status: string; message: string }> =>
  post("/api/generate-sample-data", {});
