// ── THIS FILE IS KEPT ONLY FOR FALLBACK TYPING/SHAPES ──────────────────────
// All real values come from the Flask backend via useBackendData.
// Mock generators are used only when the backend is offline.

export interface EcosystemDataPoint {
  year: number;
  stability: number;
  risk: number;
  variance: number;
  autocorrelation: number;
  rollingMean: number;
  rollingVariance: number;
  residualVolatility: number;
  biodiversityIndex: number;
  biomass: number;
  fishCapture: number;
}

export interface MetricSummary {
  stabilityScore: number;
  collapseRiskScore: number;
  trendDirection: 'Declining' | 'Stable' | 'Improving';
  riskCategory: 'Stable' | 'Vulnerable' | 'High Risk' | 'Critical';
  biodiversityIndex: number;
  biomassFlux: number;
  varianceTrend: number;
  autocorrelationTrend: number;
  confidence: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
}

export interface EarlyWarningSignal {
  indicator: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Offline fallback — generates plausible shape matching backend CSV range 2013–2020
const pseudo = (i: number) => { const x = Math.sin(42 + i * 127.1) * 43758.5; return x - Math.floor(x); };

export const generateEcosystemData = (
  stressReduction = 0, biodiversityImprovement = 0, captureReduction = 0
): EcosystemDataPoint[] =>
  Array.from({ length: 8 }, (_, i) => {
    const year = 2013 + i;
    const stability = Math.min(100, Math.max(10, (72 - i * 1.2 + pseudo(i+30)*8) * (1+stressReduction/200)));
    const risk = Math.max(0, Math.min(100, (28 + i * 1.4 + pseudo(i+40)*5) * (1-stressReduction/200)));
    return {
      year, stability: Math.round(stability*10)/10, risk: Math.round(risk*10)/10,
      variance: Math.round((0.02+i*0.003+pseudo(i+50)*0.01)*10000)/10000,
      autocorrelation: Math.round(Math.min(1,0.1+i*0.025+pseudo(i+60)*0.08)*1000)/1000,
      rollingMean: Math.round(stability*10)/10, rollingVariance: Math.round((0.02+i*0.003)*100*10)/10,
      residualVolatility: Math.round((Math.abs(pseudo(i+90)*5-2.5)+i*0.15)*100)/100,
      biodiversityIndex: Math.round(Math.min(1,Math.max(0.2,0.72-i*0.012+pseudo(i+10)*0.05-(captureReduction/100)*0.1))*1000)/1000,
      biomass: Math.round(Math.max(50,280-i*4+pseudo(i+20)*30)*10)/10,
      fishCapture: Math.round(Math.max(100,(430+pseudo(i)*120+i*6)*(1-captureReduction/100/0.6))*10)/10,
    };
  });

export const getMetricSummary = (s=0,b=0,c=0): MetricSummary => ({
  stabilityScore:       Math.round((72.4+s*0.4+b*0.3+c*0.2)*10)/10,
  collapseRiskScore:    Math.round(Math.max(0,27.6-s*0.35-b*0.2-c*0.15)*10)/10,
  trendDirection:       'Declining',
  riskCategory:         'Vulnerable',
  biodiversityIndex:    0.68,
  biomassFlux:          11.2,
  varianceTrend:        0.034,
  autocorrelationTrend: 0.67,
  confidence:           87,
});

export const getFeatureImportance = (): FeatureImportance[] => [
  { feature:'DO (Dissolved Oxygen)',   importance:28, direction:'negative' },
  { feature:'Turbidity',               importance:24, direction:'negative' },
  { feature:'Temp',                    importance:18, direction:'negative' },
  { feature:'Fish Capture (Capture)',  importance:16, direction:'negative' },
  { feature:'CHLA',                    importance:14, direction:'positive' },
];

export const getEarlyWarningSignals = (): EarlyWarningSignal[] => [
  { indicator:'Rolling Variance',      value:0.042, threshold:0.05, status:'warning', trend:'increasing' },
  { indicator:'Autocorrelation (AR1)', value:0.67,  threshold:0.7,  status:'warning', trend:'increasing' },
  { indicator:'Critical Slowing Down', value:0.58,  threshold:0.65, status:'safe',    trend:'increasing' },
  { indicator:'Regime Shift Index',    value:0.34,  threshold:0.5,  status:'safe',    trend:'stable'     },
  { indicator:'Spectral Reddening',    value:0.71,  threshold:0.6,  status:'danger',  trend:'increasing' },
];

// No named ecosystems — removed
export const ecosystems: string[] = [];
