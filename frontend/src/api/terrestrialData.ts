// ── TERRESTRIAL FALLBACK DATA ─────────────────────────────────────────────────
// Used only when Flask backend is offline.
// Data shape matches the real CSV: 2013–2020, columns:
// Wildlife Population Index, Vegetation Index, Soil Moisture, Temperature,
// CO2 Level, Extreme Weather Events, Economic Impact, Population Affected,
// Habitat Fragmentation Score, Deforestation Pressure Index

export interface TerrestrialDataPoint {
  year: number;
  temperature: number;
  co2Level: number;
  extremeWeatherEvents: number;
  wildlifePopulation: number;
  ndvi: number;
  soilMoisture: number;
  habitatFragmentation: number;
  deforestationPressure: number;
  stability: number;
  risk: number;
  variance: number;
  autocorrelation: number;
  rollingMean: number;
  rollingVariance: number;
  residualVolatility: number;
}

export interface TerrestrialMetricSummary {
  stabilityScore: number;
  collapseRiskScore: number;
  trendDirection: 'Declining' | 'Stable' | 'Improving';
  riskCategory: 'Stable' | 'Vulnerable' | 'High Risk' | 'Critical';
  ndviIndex: number;
  biomassFlux: number;
  varianceTrend: number;
  autocorrelationTrend: number;
  confidence: number;
  avgTemperature: number;
  co2Level: number;
}

export interface TerrestrialFeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
}

export interface TerrestrialEarlyWarningSignal {
  indicator: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  trend: 'increasing' | 'decreasing' | 'stable';
}

const pr = (i: number) => { const x = Math.sin(99 + i * 83.7) * 31415.9; return x - Math.floor(x); };

// Offline fallback — 8 years matching real CSV range 2013–2020
export const generateTerrestrialData = (
  tempReduction = 0, co2Reduction = 0, deforestationControl = 0, soilImprovement = 0
): TerrestrialDataPoint[] =>
  Array.from({ length: 8 }, (_, i) => {
    const year = 2013 + i;
    const tF = 1-(tempReduction/100)*0.6, cF = 1-(co2Reduction/100)*0.5;
    const dF = 1-(deforestationControl/100)*0.7, sF = 1+(soilImprovement/100)*0.4;
    const stability = Math.round(Math.min(100,Math.max(10,(70-i*1.1+pr(i+50)*7)*(1+tempReduction/200)))*10)/10;
    const risk      = Math.round(Math.max(0,Math.min(100,(30+i*1.5+pr(i+55)*5)*tF*cF))*10)/10;
    return {
      year,
      temperature:          Math.round((22+i*0.38+pr(i)*0.8)*tF*10)/10,
      co2Level:             Math.round((396+i*2.4+pr(i+5)*3)*cF*10)/10,
      extremeWeatherEvents: Math.round((1.5+i*0.18+pr(i+10)*1.2)*tF*10)/10,
      wildlifePopulation:   Math.round(Math.max(40,(63-i*1.2+pr(i+25)*4)*sF)*10)/10,
      ndvi:                 Math.round(Math.min(1,Math.max(0.3,(0.52-i*0.009+pr(i+30)*0.03)*sF))*1000)/1000,
      soilMoisture:         Math.round(Math.max(20,(34-i*0.5+pr(i+35)*4)*sF)*10)/10,
      habitatFragmentation: Math.round(Math.min(90,(28+i*1.5+pr(i+40)*4)*dF)*10)/10,
      deforestationPressure:Math.round(Math.max(0.1,(0.25+i*0.018+pr(i+45)*0.04)*dF)*1000)/1000,
      stability, risk,
      variance:             Math.round((0.018+i*0.0025+pr(i+60)*0.008)*10000)/10000,
      autocorrelation:      Math.round(Math.min(1,Math.max(-0.2,0.08+i*0.022+pr(i+65)*0.07))*1000)/1000,
      rollingMean:          Math.round((stability+pr(i+70)*2-1)*10)/10,
      rollingVariance:      Math.round((0.018+i*0.0025)*100*10)/10,
      residualVolatility:   Math.round((Math.abs(pr(i+80)*4-2)+i*0.1)*100)/100,
    };
  });

export const getTerrestrialMetrics = (t=0,c=0,d=0,s=0): TerrestrialMetricSummary => ({
  stabilityScore:       Math.round((66.2+t*0.35+c*0.25+d*0.28+s*0.18)*10)/10,
  collapseRiskScore:    Math.round(Math.max(0,33.8-t*0.32-c*0.22-d*0.25-s*0.12)*10)/10,
  trendDirection:       'Declining',
  riskCategory:         'Vulnerable',
  ndviIndex:            0.48,
  biomassFlux:          8.4,
  varianceTrend:        0.038,
  autocorrelationTrend: 0.71,
  confidence:           85,
  avgTemperature:       23.4,
  co2Level:             406.2,
});

export const getTerrestrialFeatureImportance = (): TerrestrialFeatureImportance[] => [
  { feature:'CO₂ Level',                    importance:31, direction:'negative' },
  { feature:'Deforestation Pressure Index', importance:26, direction:'negative' },
  { feature:'Vegetation Index (NDVI)',       importance:19, direction:'negative' },
  { feature:'Extreme Weather Events',        importance:13, direction:'negative' },
  { feature:'Soil Moisture',                 importance:11, direction:'positive' },
];

export const getTerrestrialEarlyWarningSignals = (): TerrestrialEarlyWarningSignal[] => [
  { indicator:'Climate Stress Index',      value:0.61, threshold:0.65, status:'warning', trend:'increasing' },
  { indicator:'Deforestation Rate',        value:0.31, threshold:0.35, status:'warning', trend:'increasing' },
  { indicator:'NDVI Anomaly',              value:0.12, threshold:0.20, status:'safe',    trend:'increasing' },
  { indicator:'Extreme Event Clustering',  value:0.72, threshold:0.60, status:'danger',  trend:'increasing' },
  { indicator:'Soil Resilience Index',     value:0.44, threshold:0.35, status:'safe',    trend:'stable'     },
];

// No named ecosystems — removed
export const terrestrialEcosystems: string[] = [];
