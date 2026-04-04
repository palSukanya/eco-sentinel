import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as RadixSlider from '@radix-ui/react-slider';
import { Zap, ArrowRight, Fish, Leaf, Wind, Thermometer, CloudFog, TreeDeciduous, Droplets, Loader2 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateEcosystemData, getMetricSummary } from '@/api/mockData';
import { generateTerrestrialData, getTerrestrialMetrics } from '@/api/terrestrialData';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };
const axisStyle = { fill:'rgba(255,255,255,0.38)', fontSize:11, fontFamily:MONO };
const Grid = () => <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>;
const XAx = () => <XAxis dataKey="year" tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} tickMargin={8}/>;
const YAx = () => <YAxis tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} width={36} domain={['auto','auto']}/>;
const DarkTip = ({ active,payload,label }:any) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'rgba(10,22,40,0.95)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 14px',fontFamily:MONO,fontSize:12,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
    <p style={{color:'rgba(255,255,255,0.4)',marginBottom:6}}>{label}</p>
    {payload.map((e:any,i:number) => <p key={i} style={{color:e.color??e.stroke,margin:'2px 0'}}>{e.name}: <span style={{color:'#fff'}}>{typeof e.value==='number'?e.value.toFixed(1):e.value}</span></p>)}
  </div>;
};

const AQUA_SLIDERS = [
  { key:'captureReduction',        label:'Fish Capture Reduction',        Icon:Fish,          color:'#2b8bbf' },
  { key:'biodiversityImprovement', label:'Biodiversity Improvement',      Icon:Leaf,          color:'#14b8a6' },
  { key:'stressReduction',         label:'Environmental Stress Reduction', Icon:Wind,          color:'#22c55e' },
] as const;

const TERRA_SLIDERS = [
  { key:'tempReduction',           label:'Temperature Reduction',         Icon:Thermometer,   color:'#f97316' },
  { key:'co2Reduction',            label:'CO₂ Reduction',                 Icon:CloudFog,      color:'#a78bfa' },
  { key:'deforestationControl',    label:'Deforestation Control',          Icon:TreeDeciduous, color:'#22c55e' },
  { key:'soilImprovement',         label:'Soil Moisture Improvement',     Icon:Droplets,      color:'#14b8a6' },
] as const;

const SliderRow = ({ label, value, onChange, color, Icon }:{ label:string;value:number;onChange:(v:number)=>void;color:string;Icon:React.ElementType }) => {
  const pct = (value/50)*100;
  return (
    <div style={{padding:'12px 14px',borderRadius:12,border:'1px solid transparent',transition:'all 0.18s'}}
      onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background=`${color}08`; el.style.borderColor=`${color}30`; }}
      onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='transparent'; }}
    >
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${color}20`,border:`1px solid ${color}45`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon size={15} style={{color}}/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{label}</span>
        </div>
        <span style={{background:`${color}20`,color,border:`1px solid ${color}45`,borderRadius:999,padding:'3px 10px',fontSize:12,fontWeight:700,fontFamily:MONO}}>{value}%</span>
      </div>
      <RadixSlider.Root min={0} max={50} step={1} value={[value]} onValueChange={([v]) => onChange(v)}
        style={{position:'relative',display:'flex',alignItems:'center',width:'100%',height:20,userSelect:'none',touchAction:'none'}}>
        <RadixSlider.Track style={{position:'relative',flexGrow:1,height:6,borderRadius:3,background:'rgba(255,255,255,0.10)',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${color}aa,${color})`,borderRadius:3,transition:'width 0.08s linear'}}/>
          <RadixSlider.Range style={{position:'absolute',height:'100%',background:'transparent'}}/>
        </RadixSlider.Track>
        <RadixSlider.Thumb style={{display:'block',width:18,height:18,borderRadius:'50%',background:'#fff',border:`2.5px solid ${color}`,outline:'none',cursor:'pointer',transition:'box-shadow 0.15s ease'}}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow=`0 0 0 6px ${color}44`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow='none'; }}/>
      </RadixSlider.Root>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
        <span style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontFamily:MONO}}>0%</span>
        <span style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontFamily:MONO}}>50%</span>
      </div>
    </div>
  );
};

const RISK_BADGE: Record<string,{color:string;bg:string;border:string}> = {
  Stable:    {color:'#4ade80',bg:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.35)'},
  Vulnerable:{color:'#fbbf24',bg:'rgba(245,158,11,0.15)',border:'rgba(245,158,11,0.35)'},
  'High Risk':{color:'#fb923c',bg:'rgba(249,115,22,0.15)',border:'rgba(249,115,22,0.35)'},
  Critical:  {color:'#f87171',bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.35)'},
};
const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };

export default function SimulationLab() {
  const { isAquatic, accentColor } = useEcosystem();
  const { aquaticChartData, terrestrialChartData, aquaticMetrics, terrestrialMetrics, runAquaticSimulation, runTerrestrialSimulation, error: backendError } = useBackendData();

  const [captureReduction,       setCaptureReduction]       = useState(0);
  const [biodiversityImprovement,setBiodiversityImprovement] = useState(0);
  const [stressReduction,        setStressReduction]         = useState(0);
  const [tempReduction,          setTempReduction]           = useState(0);
  const [co2Reduction,           setCo2Reduction]            = useState(0);
  const [deforestationControl,   setDeforestationControl]    = useState(0);
  const [soilImprovement,        setSoilImprovement]         = useState(0);

  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun,       setHasRun]       = useState(false);

  // Mock baselines
  const mockAquaBase  = useMemo(() => generateEcosystemData(), []);
  const mockTerraBase = useMemo(() => generateTerrestrialData(), []);
  const mockAquaBaseM = useMemo(() => getMetricSummary(), []);
  const mockTerraBaseM= useMemo(() => getTerrestrialMetrics(), []);

  // Simulated data state
  const [simStabilityScore,    setSimStabilityScore]    = useState<number|null>(null);
  const [simRiskScore,         setSimRiskScore]          = useState<number|null>(null);
  const [simRiskCategory,      setSimRiskCategory]       = useState<string|null>(null);
  const [simChartData,         setSimChartData]          = useState<any[]|null>(null);

  // Real or mock base metrics
  const baseStability  = isAquatic ? (aquaticMetrics?.stabilityScore    ?? mockAquaBaseM.stabilityScore)    : (terrestrialMetrics?.stabilityScore    ?? mockTerraBaseM.stabilityScore);
  const baseRisk       = isAquatic ? (aquaticMetrics?.collapseRiskScore ?? mockAquaBaseM.collapseRiskScore) : (terrestrialMetrics?.collapseRiskScore ?? mockTerraBaseM.collapseRiskScore);
  const baseRiskCat    = isAquatic ? (aquaticMetrics?.riskCategory      ?? mockAquaBaseM.riskCategory)      : (terrestrialMetrics?.riskCategory      ?? mockTerraBaseM.riskCategory);

  // Final display values
  const displaySimStability  = simStabilityScore  ?? baseStability;
  const displaySimRisk       = simRiskScore        ?? baseRisk;
  const displaySimRiskCat    = simRiskCategory     ?? baseRiskCat;

  const baseData = isAquatic ? (aquaticChartData.length > 0 ? aquaticChartData : mockAquaBase) : (terrestrialChartData.length > 0 ? terrestrialChartData : mockTerraBase);
  const simData  = simChartData ?? baseData;

  const combined = baseData.map((d, i) => ({
    year: d.year,
    baseStability: d.stability,
    simStability:  simData[i]?.stability ?? d.stability,
    baseRisk:      d.risk,
    simRisk:       simData[i]?.risk ?? d.risk,
  }));

  const stDelta = displaySimStability - baseStability;
  const rDelta  = displaySimRisk      - baseRisk;

  const runSim = useCallback(async () => {
    setIsSimulating(true);

    if (!backendError) {
      // Try real backend first
      try {
        if (isAquatic) {
          const result = await runAquaticSimulation({
            capture_change:   -captureReduction,
            temp_change:      -stressReduction * 0.5,
            turbidity_change: -biodiversityImprovement * 0.3,
          });
          if (result) {
            setSimStabilityScore(result.stability_score);
            setSimRiskScore(result.collapse_risk_score);
            setSimRiskCategory(result.risk_category);
            // Build chart data from result trend_data
            const byYear: Record<number, number[]> = {};
            for (const d of result.trend_data) {
              if (!byYear[d.year]) byYear[d.year] = [];
              byYear[d.year].push(d.stability_score);
            }
            const chartPts = Object.keys(byYear).map(Number).sort((a,b)=>a-b).map(year => {
              const avg = byYear[year].reduce((s,v)=>s+v,0)/byYear[year].length;
              return { year, stability: Math.round(avg*10)/10, risk: Math.round((100-avg)*10)/10 };
            });
            setSimChartData(chartPts);
          }
        } else {
          const result = await runTerrestrialSimulation({
            temp_change:          tempReduction,
            co2_change:           co2Reduction,
            deforestation_change: deforestationControl,
            soil_change:          soilImprovement,
          });
          if (result) {
            setSimStabilityScore(result.stability_score);
            setSimRiskScore(result.collapse_risk_score);
            setSimRiskCategory(result.risk_category);
            const byYear: Record<number, number[]> = {};
            for (const d of result.trend_data) {
              if (!byYear[d.year]) byYear[d.year] = [];
              byYear[d.year].push(d.stability_score);
            }
            const chartPts = Object.keys(byYear).map(Number).sort((a,b)=>a-b).map(year => {
              const avg = byYear[year].reduce((s,v)=>s+v,0)/byYear[year].length;
              return { year, stability: Math.round(avg*10)/10, risk: Math.round((100-avg)*10)/10 };
            });
            setSimChartData(chartPts);
          }
        }
      } catch {
        // Fall through to mock
      }
    }

    // If no backend or backend failed, use mock simulation
    if (!simStabilityScore) {
      const mockSim = isAquatic
        ? generateEcosystemData(stressReduction, biodiversityImprovement, captureReduction)
        : generateTerrestrialData(tempReduction, co2Reduction, deforestationControl, soilImprovement);
      const mockSimM = isAquatic
        ? getMetricSummary(stressReduction, biodiversityImprovement, captureReduction)
        : getTerrestrialMetrics(tempReduction, co2Reduction, deforestationControl, soilImprovement);
      setSimStabilityScore(mockSimM.stabilityScore);
      setSimRiskScore(mockSimM.collapseRiskScore);
      setSimRiskCategory(mockSimM.riskCategory);
      setSimChartData(mockSim);
    }

    setTimeout(() => { setIsSimulating(false); setHasRun(true); }, 1200);
  }, [isAquatic, captureReduction, biodiversityImprovement, stressReduction, tempReduction, co2Reduction, deforestationControl, soilImprovement, backendError, runAquaticSimulation, runTerrestrialSimulation, simStabilityScore]);

  const sliderConfig = isAquatic ? AQUA_SLIDERS : TERRA_SLIDERS;
  const sliderValues: Record<string,number> = { captureReduction, biodiversityImprovement, stressReduction, tempReduction, co2Reduction, deforestationControl, soilImprovement };
  const sliderSetters: Record<string,(v:number)=>void> = {
    captureReduction:setCaptureReduction, biodiversityImprovement:setBiodiversityImprovement,
    stressReduction:setStressReduction, tempReduction:setTempReduction,
    co2Reduction:setCo2Reduction, deforestationControl:setDeforestationControl,
    soilImprovement:setSoilImprovement,
  };

  const badge1 = RISK_BADGE[baseRiskCat]          ?? RISK_BADGE['Stable'];
  const badge2 = RISK_BADGE[displaySimRiskCat]    ?? RISK_BADGE['Stable'];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <motion.div variants={itemV}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>What-If Simulation Lab</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>
          Model {isAquatic?'aquatic':'terrestrial'} intervention scenarios using {backendError ? 'mock data' : 'live Random Forest predictions'} and project ecosystem recovery outcomes
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <motion.div variants={itemV}>
          <div style={{...glass,padding:22,display:'flex',flexDirection:'column',gap:6}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:10}}>Simulation Parameters</h3>
            {sliderConfig.map(s => (
              <SliderRow key={s.key} label={s.label} Icon={s.Icon} color={s.color}
                value={sliderValues[s.key]} onChange={sliderSetters[s.key]}/>
            ))}
            <button onClick={runSim} disabled={isSimulating} style={{
              width:'100%',marginTop:10,padding:'15px 0',
              background:'linear-gradient(135deg,#1a5c38,#1e5f8e)',
              border:'1px solid rgba(34,197,94,0.30)',borderRadius:12,
              color:'#fff',fontSize:15,fontWeight:700,cursor:isSimulating?'not-allowed':'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              opacity:isSimulating?0.80:1,transition:'opacity 0.15s ease',
            }}>
              {isSimulating ? <><Loader2 size={18} style={{animation:'spin 0.9s linear infinite'}}/><span>Simulating…</span></>
                : <><Zap size={18}/><span>Run Simulation</span></>}
            </button>
            {!backendError && (
              <p style={{fontSize:10,color:'rgba(255,255,255,0.25)',textAlign:'center',marginTop:4,fontFamily:MONO}}>
                ● Powered by live Random Forest model
              </p>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {hasRun && (
              <motion.div key="cmp" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.4,ease:[0.2,0,0,1]}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <span style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.40)',fontWeight:600,textTransform:'uppercase'}}>Scenario Comparison</span>
                  <div style={{flex:1,height:1,background:'rgba(255,255,255,0.07)'}}/>
                  <ArrowRight size={13} style={{color:accentColor}}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { stab:baseStability, risk:baseRisk, cat:baseRiskCat, b:badge1, label:'Before', delta:false },
                    { stab:displaySimStability, risk:displaySimRisk, cat:displaySimRiskCat, b:badge2, label:'After', delta:true },
                  ].map(({stab,risk,cat,b,label,delta}) => (
                    <div key={label} style={{...glass,padding:20,
                      background:delta?'rgba(34,197,94,0.06)':'rgba(255,255,255,0.05)',
                      border:delta?`1px solid rgba(34,197,94,0.35)`:'1px solid rgba(255,255,255,0.10)',
                      boxShadow:delta?'0 4px 20px rgba(34,197,94,0.12)':'none'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                        <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.13em',textTransform:'uppercase',color:delta?accentColor:'rgba(255,255,255,0.40)'}}>{delta?'▸ After':'◂ Before'}</span>
                        {delta && <span style={{fontSize:13,fontWeight:700,fontFamily:MONO,color:stDelta>0?'#4ade80':'#f87171'}}>{stDelta>0?'+':''}{stDelta.toFixed(1)}</span>}
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Stability Score</div>
                        <div style={{fontSize:34,fontWeight:700,fontFamily:MONO,color:delta?accentColor:'#fff',lineHeight:1,marginTop:4}}>{stab.toFixed(1)}<span style={{fontSize:13,color:'rgba(255,255,255,0.35)',fontFamily:MONO}}>/100</span></div>
                      </div>
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Collapse Risk</div>
                        <div style={{fontSize:22,fontWeight:700,fontFamily:MONO,color:delta?(rDelta<0?'#4ade80':'#f87171'):'#fff',lineHeight:1,marginTop:4}}>
                          {risk.toFixed(1)}%
                          {delta&&<span style={{fontSize:12,marginLeft:6,fontFamily:MONO,color:rDelta<=0?'#4ade80':'#f87171'}}>{rDelta>0?'+':''}{rDelta.toFixed(1)}</span>}
                        </div>
                      </div>
                      <span style={{background:b.bg,color:b.color,border:`1px solid ${b.border}`,borderRadius:999,padding:'3px 10px',fontSize:10,fontWeight:700}}>{cat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stability chart */}
          <motion.div variants={itemV}>
            <div style={{...glass,padding:24,height:360}}>
              <div style={{marginBottom:14}}>
                <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.50)',fontWeight:600,textTransform:'uppercase'}}>Projected Stability</h3>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.28)',marginTop:2}}>Baseline vs simulated trajectory (2013–2020)</p>
              </div>
              <ResponsiveContainer width="100%" height="82%">
                <LineChart data={combined} margin={{top:14,right:14,bottom:8,left:4}}>
                  <Grid/><XAx/><YAx/>
                  <Tooltip content={<DarkTip/>}/>
                  <Line type="monotone" dataKey="baseStability" name="Baseline"  stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} dot={false} strokeDasharray="6 3"/>
                  <Line type="monotone" dataKey="simStability"  name="Simulated" stroke={accentColor}             strokeWidth={2.5} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk chart */}
          <motion.div variants={itemV}>
            <div style={{...glass,padding:24,height:320}}>
              <div style={{marginBottom:14}}>
                <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.50)',fontWeight:600,textTransform:'uppercase'}}>Projected Risk Comparison</h3>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.28)',marginTop:2}}>Lower simulated risk signals intervention effectiveness</p>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={combined} margin={{top:12,right:12,bottom:8,left:4}}>
                  <defs>
                    <linearGradient id="gSimR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.35}/>
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Grid/><XAx/><YAx/>
                  <Tooltip content={<DarkTip/>}/>
                  <Area type="monotone" dataKey="baseRisk" name="Baseline Risk"  stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} fill="none" strokeDasharray="6 3"/>
                  <Area type="monotone" dataKey="simRisk"  name="Simulated Risk" stroke={accentColor}             strokeWidth={2}   fill="url(#gSimR)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
