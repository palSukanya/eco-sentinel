import { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';
import { generateEcosystemData } from '@/api/mockData';
import { generateTerrestrialData } from '@/api/terrestrialData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };
const axisStyle = { fill:'rgba(255,255,255,0.45)', fontSize:11, fontFamily:MONO };
const Grid = () => <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>;
const XAx  = () => <XAxis dataKey="year" tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} tickMargin={8}/>;
const YAx  = () => <YAxis tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} width={38} domain={['auto','auto']}/>;

const DarkTip = ({ active,payload,label }:any) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'rgba(10,22,40,0.95)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 14px',fontFamily:MONO,fontSize:12,color:'rgba(255,255,255,0.85)',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
    <p style={{color:'rgba(255,255,255,0.4)',marginBottom:6}}>{label}</p>
    {payload.map((e:any,i:number) => <p key={i} style={{color:e.color??e.stroke,margin:'2px 0'}}>{e.name}: <span style={{color:'#fff'}}>{typeof e.value==='number'?e.value.toFixed(3):e.value}</span></p>)}
  </div>;
};

const ChartTitle = ({ children, dot }:{ children:React.ReactNode; dot:string }) => (
  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
    <span style={{ width:6,height:6,borderRadius:'50%',background:dot,boxShadow:`0 0 6px 1px ${dot}88`,flexShrink:0,display:'inline-block' }}/>
    <h3 style={{ fontSize:11,letterSpacing:'0.13em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',fontWeight:600,margin:0 }}>{children}</h3>
  </div>
);

const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };

export default function StabilityAnalysis() {
  const { isAquatic, accentColor } = useEcosystem();
  const { aquaticChartData, terrestrialChartData, aquaticMetrics, terrestrialMetrics } = useBackendData();

  const fallbackAqua  = useMemo(() => generateEcosystemData(), []);
  const fallbackTerra = useMemo(() => generateTerrestrialData(), []);

  const data = isAquatic
    ? (aquaticChartData.length > 0 ? aquaticChartData : fallbackAqua)
    : (terrestrialChartData.length > 0 ? terrestrialChartData : fallbackTerra);

  const metrics = isAquatic ? aquaticMetrics : terrestrialMetrics;

  // Compute regression stats from the chart data
  const n = data.length;
  const xMean = data.reduce((s,d) => s + d.year, 0) / n;
  const yMean = data.reduce((s,d) => s + d.stability, 0) / n;
  const slope = data.reduce((s,d) => s + (d.year - xMean)*(d.stability - yMean), 0) /
                data.reduce((s,d) => s + Math.pow(d.year - xMean, 2), 0);
  const intercept = yMean - slope * xMean;
  const predicted = data.map(d => slope * d.year + intercept);
  const ssRes = data.reduce((s,d,i) => s + Math.pow(d.stability - predicted[i], 2), 0);
  const ssTot = data.reduce((s,d)   => s + Math.pow(d.stability - yMean, 2), 0);
  const r2    = 1 - ssRes / ssTot;

  // Trend direction
  const TrendIcon = slope > 0.05 ? TrendingUp : slope < -0.05 ? TrendingDown : Minus;
  const trendColor = slope > 0.05 ? '#4ade80' : slope < -0.05 ? '#f87171' : '#fbbf24';
  const trendLabel = slope > 0.05 ? 'Improving' : slope < -0.05 ? 'Declining' : 'Stable';

  const statCards = [
    { label:'Trend Direction',   value: trendLabel,           sub:`Slope: ${slope.toFixed(4)} per year` },
    { label:'Trend Strength R²', value: r2.toFixed(4),        sub:'Linear regression fit quality' },
    { label:'Regression Slope',  value: `${slope.toFixed(3)} /yr`, sub:'Annual stability change rate' },
    { label:'Current Stability', value: metrics ? `${metrics.stabilityScore.toFixed(1)}/100` : `${data[data.length-1]?.stability?.toFixed(1)}/100`, sub: metrics ? `${metrics.riskCategory} — ${metrics.trendDirection}` : 'Model output' },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
      <motion.div variants={itemV}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>Stability Analysis</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>
          Deep statistical analysis of {isAquatic?'aquatic':'terrestrial'} ecosystem stability — Random Forest model output (2013–2020)
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemV} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} style={{...glass,padding:20}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.40)',letterSpacing:'0.13em',textTransform:'uppercase',marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:18,fontWeight:700,color: i===0 ? trendColor : '#fff',fontFamily:MONO,display:'flex',alignItems:'center',gap:6}}>
              {i===0 && <TrendIcon size={16} style={{color:trendColor}}/>}
              {s.value}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:4}}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stability over time */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24,height:380}}>
          <ChartTitle dot={accentColor}>Stability Index Over Time (2013–2020)</ChartTitle>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={data} margin={{top:10,right:16,bottom:8,left:4}}>
              <defs>
                <linearGradient id="gStab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.40}/>
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Grid/><XAx/><YAx/>
              <Tooltip content={<DarkTip/>}/>
              <Area type="monotone" dataKey="stability" name="Stability" stroke={accentColor} strokeWidth={2.5} fill="url(#gStab)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemV}>
          <div style={{...glass,padding:24,height:340}}>
            <ChartTitle dot="#f59e0b">Rolling Variance (Early Warning)</ChartTitle>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={data} margin={{top:10,right:16,bottom:8,left:4}}>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTip/>}/>
                <Line type="monotone" dataKey="variance" name="Variance" stroke="#f59e0b" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="rollingVariance" name="Rolling Var" stroke="#fb923c" strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemV}>
          <div style={{...glass,padding:24,height:340}}>
            <ChartTitle dot="#a78bfa">Autocorrelation (AR1)</ChartTitle>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={data} margin={{top:10,right:16,bottom:8,left:4}}>
                <Grid/><XAx/><YAx/>
                <Tooltip content={<DarkTip/>}/>
                <Line type="monotone" dataKey="autocorrelation" name="Autocorrelation" stroke="#a78bfa" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Risk over time */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24,height:320}}>
          <ChartTitle dot="#f87171">Collapse Risk Trajectory</ChartTitle>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={data} margin={{top:10,right:16,bottom:8,left:4}}>
              <defs>
                <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.40}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Grid/><XAx/><YAx/>
              <Tooltip content={<DarkTip/>}/>
              <Area type="monotone" dataKey="risk" name="Collapse Risk" stroke="#f87171" strokeWidth={2} fill="url(#gRisk)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
