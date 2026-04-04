import { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Info, Loader2, WifiOff } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import ScoreMeter from '@/components/dashboard/ScoreMeter';
import { generateEcosystemData, getMetricSummary } from '@/api/mockData';
import { generateTerrestrialData, getTerrestrialMetrics } from '@/api/terrestrialData';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const axisStyle = { fill:'rgba(255,255,255,0.38)', fontSize:11, fontFamily:MONO };
const GlassCard = ({ children, style={} }: { children:React.ReactNode; style?:React.CSSProperties }) => (
  <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:16, ...style }}>{children}</div>
);
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,22,40,0.95)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 14px', fontFamily:MONO, fontSize:12, color:'rgba(255,255,255,0.85)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:6 }}>{label}</p>
      {payload.map((e:any,i:number) => (
        <p key={i} style={{ color:e.color??e.stroke, margin:'2px 0' }}>
          {e.name}: <span style={{color:'#fff'}}>{typeof e.value==='number'?e.value.toFixed(2):e.value}</span>
        </p>
      ))}
    </div>
  );
};
const ChartHeader = ({ title, subtitle }: { title:string; subtitle:string }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
    <div>
      <h3 style={{ fontSize:11, letterSpacing:'0.13em', color:'rgba(255,255,255,0.45)', fontWeight:600, textTransform:'uppercase' }}>{title}</h3>
      <p style={{ fontSize:12, color:'rgba(255,255,255,0.28)', marginTop:3 }}>{subtitle}</p>
    </div>
    <Info size={13} style={{ color:'rgba(255,255,255,0.2)' }}/>
  </div>
);
const Grid = () => <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>;
const XAx = () => <XAxis dataKey="year" tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} tickMargin={8}/>;
const YAx = ({ domain }:{ domain?:[any,any] }) => <YAxis tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} width={36} domain={domain??['auto','auto']}/>;

const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } };
const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };
const NOW = new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});

const RISK_BADGE: Record<string,{color:string;bg:string;border:string}> = {
  Stable:     {color:'#4ade80',bg:'rgba(34,197,94,0.15)',  border:'rgba(34,197,94,0.35)'},
  Vulnerable: {color:'#fbbf24',bg:'rgba(245,158,11,0.15)',border:'rgba(245,158,11,0.35)'},
  'High Risk':{color:'#fb923c',bg:'rgba(249,115,22,0.15)',border:'rgba(249,115,22,0.35)'},
  Critical:   {color:'#f87171',bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.35)'},
};

export default function EcosystemDashboard() {
  const { isAquatic, accentColor, accentBorder } = useEcosystem();
  const { aquaticMetrics, terrestrialMetrics, aquaticChartData, terrestrialChartData, loading, error } = useBackendData();

  const mockAquaData    = useMemo(() => generateEcosystemData(), []);
  const mockTerraData   = useMemo(() => generateTerrestrialData(), []);
  const mockAquaMetrics = useMemo(() => getMetricSummary(), []);
  const mockTerraMetrics= useMemo(() => getTerrestrialMetrics(), []);

  const aquaData = aquaticChartData.length > 0 ? aquaticChartData : mockAquaData;
  const terraData= terrestrialChartData.length > 0 ? terrestrialChartData : mockTerraData;
  const data     = isAquatic ? aquaData : terraData;

  const stabilityScore    = isAquatic ? (aquaticMetrics?.stabilityScore    ?? mockAquaMetrics.stabilityScore)    : (terrestrialMetrics?.stabilityScore    ?? mockTerraMetrics.stabilityScore);
  const collapseRiskScore = isAquatic ? (aquaticMetrics?.collapseRiskScore ?? mockAquaMetrics.collapseRiskScore) : (terrestrialMetrics?.collapseRiskScore ?? mockTerraMetrics.collapseRiskScore);
  const riskCategory      = isAquatic ? (aquaticMetrics?.riskCategory      ?? mockAquaMetrics.riskCategory)      : (terrestrialMetrics?.riskCategory      ?? mockTerraMetrics.riskCategory);
  const biodiversityIndex = isAquatic ? (aquaticMetrics?.biodiversityIndex ?? mockAquaMetrics.biodiversityIndex) : (terrestrialMetrics?.biodiversityIndex  ?? mockTerraMetrics.ndviIndex);
  const modelR2           = isAquatic ? aquaticMetrics?.modelMetrics.r2 : terrestrialMetrics?.modelMetrics.r2;

  const badge = RISK_BADGE[riskCategory] ?? RISK_BADGE['Stable'];

  return (
    <motion.div className="space-y-6" variants={containerV} initial="hidden" animate="visible">
      <style>{`@keyframes bpulse{0%,100%{opacity:1;box-shadow:0 0 6px 2px ${accentColor};}50%{opacity:0.4;box-shadow:none;}}.bpulse{animation:bpulse 2s ease-in-out infinite;} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Backend status */}
      {loading && (
        <motion.div variants={itemV}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderRadius:10, background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.25)' }}>
            <Loader2 size={14} style={{ color:'#14b8a6', animation:'spin 1s linear infinite' }}/>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>Loading live model data from backend…</span>
          </div>
        </motion.div>
      )}
      {error && !loading && (
        <motion.div variants={itemV}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderRadius:10, background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.25)' }}>
            <WifiOff size={14} style={{ color:'#fb923c' }}/>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>Backend offline — showing mock data. Run <code style={{fontFamily:MONO,background:'rgba(255,255,255,0.08)',padding:'1px 6px',borderRadius:4}}>python app.py</code> to load real ML results.</span>
          </div>
        </motion.div>
      )}

      

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAquatic ? (
          <>
            <motion.div variants={itemV}><MetricCard title="Stability Score"    value={stabilityScore}              unit="/100" trend="down" status={riskCategory}  delay={0}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="Collapse Risk"      value={collapseRiskScore}           unit="%"    trend="up"   status="Vulnerable"      delay={0.07}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="Biodiversity Index" value={(biodiversityIndex).toFixed(2)} unit="H'" trend="down" status="Stable"       delay={0.14}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="Biomass Flux"       value={`+${mockAquaMetrics.biomassFlux.toFixed(1)}`} unit="kt/y" trend="up" status="Stable" delay={0.21}/></motion.div>
          </>
        ) : (
          <>
            <motion.div variants={itemV}><MetricCard title="Stability Score"    value={stabilityScore}              unit="/100" trend="down" status={riskCategory}  delay={0}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="Collapse Risk"      value={collapseRiskScore}           unit="%"    trend="up"   status="Vulnerable"      delay={0.07}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="NDVI Index"         value={mockTerraMetrics.ndviIndex.toFixed(3)} unit="" trend="down" status="Stable"   delay={0.14}/></motion.div>
            <motion.div variants={itemV}><MetricCard title="CO₂ Level"          value={mockTerraMetrics.co2Level.toFixed(1)}  unit="ppm" trend="up" status="Vulnerable" delay={0.21}/></motion.div>
          </>
        )}
      </div>

      {/* Score gauges */}
      <motion.div variants={itemV}>
        <GlassCard style={{ padding:'28px 24px' }}>
          <h3 style={{ fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.4)',fontWeight:600,textTransform:'uppercase',marginBottom:28 }}>System Status Overview</h3>
          <div className="flex flex-wrap justify-center gap-10">
            <ScoreMeter score={Math.round(stabilityScore)} label="Stability"/>
            <ScoreMeter score={Math.round(collapseRiskScore)} label="Collapse Risk"/>
            <ScoreMeter score={isAquatic ? Math.round(biodiversityIndex*100) : Math.round(mockTerraMetrics.ndviIndex*100)} label={isAquatic?'Biodiversity':'NDVI'}/>
            <ScoreMeter score={isAquatic ? 87 : Math.round(mockTerraMetrics.confidence)} label="Confidence"/>
          </div>
        </GlassCard>
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemV}>
          <GlassCard style={{ padding:24, height:380 }}>
            <ChartHeader title="Stability Trend (2013–2020)" subtitle="Annual stability index — Random Forest ML model"/>
            <ResponsiveContainer width="100%" height="82%">
              <AreaChart data={data} margin={{top:16,right:16,bottom:8,left:4}}>
                <defs><linearGradient id="gsA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.40}/>
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0}/>
                </linearGradient></defs>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTooltip/>}/>
                <Area type="monotone" dataKey="stability" name="Stability" stroke={accentColor} strokeWidth={2.5} fill="url(#gsA)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemV}>
          <GlassCard style={{ padding:24, height:380 }}>
            <ChartHeader title="Resilience vs Collapse Risk" subtitle="Ecosystem resilience score vs collapse risk over time"/>
            <ResponsiveContainer width="100%" height="82%">
              <LineChart data={data} margin={{top:16,right:16,bottom:8,left:4}}>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line type="monotone" dataKey="biodiversityIndex" name="Resilience" stroke={accentColor} strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="risk"              name="Risk"        stroke="#ef4444"     strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemV}>
          <GlassCard style={{ padding:24, height:340 }}>
            <ChartHeader
              title={isAquatic ? 'Biomass Trend' : 'Vegetation (NDVI) Trend'}
              subtitle={isAquatic ? 'Estimated biomass index over observed period' : 'Normalized vegetation index over observed period'}
            />
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={data} margin={{top:14,right:14,bottom:8,left:4}}>
                <defs><linearGradient id="gsB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isAquatic?'#2b8bbf':'#22c55e'} stopOpacity={0.38}/>
                  <stop offset="100%" stopColor={isAquatic?'#2b8bbf':'#22c55e'} stopOpacity={0}/>
                </linearGradient></defs>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTooltip/>}/>
                <Area type="monotone" dataKey="biomass" name={isAquatic?'Biomass':'NDVI Index'} stroke={isAquatic?'#2b8bbf':'#22c55e'} strokeWidth={2} fill="url(#gsB)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemV}>
          <GlassCard style={{ padding:24, height:340 }}>
            <ChartHeader title="Rolling Variance & Autocorrelation" subtitle="Early warning signal metrics — rising values indicate system stress"/>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={data} margin={{top:14,right:14,bottom:8,left:4}}>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line type="monotone" dataKey="variance"        name="Variance"        stroke="#f59e0b" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="autocorrelation" name="Autocorrelation" stroke="#a78bfa" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
