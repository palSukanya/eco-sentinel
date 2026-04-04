import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import AlertBadge from '@/components/dashboard/AlertBadge';
import { generateEcosystemData, getEarlyWarningSignals } from '@/api/mockData';
import { generateTerrestrialData, getTerrestrialEarlyWarningSignals } from '@/api/terrestrialData';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle, Thermometer, TreeDeciduous } from 'lucide-react';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };
const axisStyle = { fill:'rgba(255,255,255,0.38)', fontSize:11, fontFamily:MONO };

const STATUS = {
  safe:    {color:'#4ade80',bg:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.35)', pill:'SAFE'},
  warning: {color:'#fbbf24',bg:'rgba(245,158,11,0.15)',border:'rgba(245,158,11,0.35)',pill:'WARNING'},
  danger:  {color:'#f87171',bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.38)', pill:'DANGER'},
} as const;

const Grid = () => <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>;
const XAx = () => <XAxis dataKey="year" tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} tickMargin={8}/>;
const YAx = () => <YAxis tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} width={38} domain={['auto','auto']}/>;

const DarkTip = ({ active,payload,label }:any) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'rgba(10,22,40,0.95)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 14px',fontFamily:MONO,fontSize:12,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
    <p style={{color:'rgba(255,255,255,0.4)',marginBottom:6}}>{label}</p>
    {payload.map((e:any,i:number) => <p key={i} style={{color:e.color??e.stroke,margin:'2px 0'}}>{e.name}: <span style={{color:'#fff'}}>{typeof e.value==='number'?e.value.toFixed(3):e.value}</span></p>)}
  </div>;
};

const AlertCard = ({ title, value, threshold, status, Icon }: { title:string;value:number;threshold:number;status:keyof typeof STATUS;Icon:React.ElementType }) => {
  const s = STATUS[status];
  return (
    <div style={{...glass,padding:22,border:`1px solid ${s.border}`,boxShadow:`0 4px 20px ${s.bg}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:10,background:s.bg,border:`1px solid ${s.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon size={18} style={{color:s.color}}/>
        </div>
        <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:999,padding:'3px 10px',fontSize:10,fontWeight:700,fontFamily:MONO}}>{s.pill}</span>
      </div>
      <div style={{fontSize:42,fontWeight:700,fontFamily:MONO,color:s.color,lineHeight:1,marginBottom:4}}>{value.toFixed(3)}</div>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.33)',fontFamily:MONO,marginBottom:4}}>threshold: {threshold.toFixed(3)}</div>
      <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.70)',marginBottom:14}}>{title}</div>
      <div style={{height:5,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden',position:'relative'}}>
        <motion.div initial={{width:0}} animate={{width:`${Math.min(100,(value/Math.max(value,threshold)*1.15)*100)}%`}} transition={{duration:0.9,ease:[0.2,0,0,1]}}
          style={{height:'100%',borderRadius:999,background:s.color,boxShadow:`0 0 8px 1px ${s.bg}`}}/>
        <div style={{position:'absolute',top:-3,width:2,height:11,left:`${Math.min(98,(threshold/Math.max(value,threshold)*1.15)*100)}%`,background:'rgba(255,255,255,0.55)',borderRadius:999}}/>
      </div>
    </div>
  );
};

const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };

export default function EarlyWarningPage() {
  const { isAquatic, accentColor } = useEcosystem();
  const { aquaticChartData, terrestrialChartData, aquaticMetrics, terrestrialMetrics } = useBackendData();

  // Mock fallbacks
  const mockAquaData  = useMemo(() => generateEcosystemData(), []);
  const mockTerraData = useMemo(() => generateTerrestrialData(), []);
  const aquaSig       = useMemo(() => getEarlyWarningSignals(), []);
  const terraSig      = useMemo(() => getTerrestrialEarlyWarningSignals(), []);

  // Prefer real chart data
  const aquaData  = aquaticChartData.length > 0 ? aquaticChartData : mockAquaData;
  const terraData = terrestrialChartData.length > 0 ? terrestrialChartData : mockTerraData;
  const data      = isAquatic ? aquaData  : terraData;
  const signals   = isAquatic ? aquaSig   : terraSig;

  // Derive live early-warning values from backend trend slope if available
  const trendSlope = isAquatic
    ? (aquaticMetrics?.trendSlope ?? null)
    : (terrestrialMetrics?.trendSlope ?? null);

  const riskScore  = isAquatic
    ? (aquaticMetrics?.collapseRiskScore ?? signals[0]?.value ?? 0)
    : (terrestrialMetrics?.collapseRiskScore ?? signals[0]?.value ?? 0);

  // Derive live variance-like and autocorrelation-like indicators
  const liveVariance  = trendSlope != null ? Math.abs(trendSlope) * 10 : signals[0]?.value;
  const liveAutoCorr  = trendSlope != null ? Math.min(1, Math.abs(trendSlope) * 5 + 0.3) : signals[1]?.value;

  const varStatus: keyof typeof STATUS = liveVariance && liveVariance > 0.05 ? 'danger' : liveVariance && liveVariance > 0.025 ? 'warning' : 'safe';
  const autoStatus: keyof typeof STATUS = liveAutoCorr && liveAutoCorr > 0.7 ? 'danger' : liveAutoCorr && liveAutoCorr > 0.5 ? 'warning' : 'safe';
  const regimeShift = varStatus === 'danger' || autoStatus === 'danger' || signals.some(s => s.status === 'danger');

  const topCards = isAquatic ? [
    { title:'Rolling Variance',      value:liveVariance ?? aquaSig[0].value,  threshold:aquaSig[0].threshold,  status:varStatus,  Icon:BarChart3  },
    { title:'Autocorrelation (AR1)', value:liveAutoCorr ?? aquaSig[1].value,  threshold:aquaSig[1].threshold,  status:autoStatus, Icon:TrendingUp },
  ] : [
    { title:'Climate Stress Index',        value:terraSig[0].value, threshold:terraSig[0].threshold, status:terraSig[0].status as keyof typeof STATUS, Icon:Thermometer },
    { title:'Deforestation Rate (Mha/yr)', value:terraSig[1].value, threshold:terraSig[1].threshold, status:terraSig[1].status as keyof typeof STATUS, Icon:TreeDeciduous },
  ];

  const chartConfigs = isAquatic ? [
    { key:'variance',         label:'Variance Over Time',    color:'#f59e0b', ref:0.05, refLabel:'Threshold' },
    { key:'autocorrelation',  label:'Autocorrelation (AR1)', color:'#2b8bbf', ref:0.7,  refLabel:'Critical'  },
  ] : [
    { key:'variance',         label:'Variance Over Time',    color:'#f97316', ref:0.05, refLabel:'Threshold' },
    { key:'autocorrelation',  label:'Autocorrelation (AR1)', color:'#ef4444', ref:0.7,  refLabel:'Critical'  },
    { key:'biodiversityIndex',label:'Resilience Index',      color:'#22c55e', ref:0.5,  refLabel:'Min Safe'  },
    { key:'risk',             label:'Collapse Risk Score',   color:'#fb923c', ref:60,   refLabel:'Baseline'  },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
      <motion.div variants={itemV}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>Early Warning Signals</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>
          {isAquatic ? 'Critical slowing down detection and regime shift indicators' : 'Climate stress, deforestation spikes, and extreme event clustering'}
        </p>
      </motion.div>

      {/* Top alert cards */}
      <div className={`grid grid-cols-1 gap-5 ${isAquatic ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {topCards.map((c,i) => (
          <motion.div key={i} variants={itemV}><AlertCard {...c}/></motion.div>
        ))}
        {/* Regime shift card */}
        <motion.div variants={itemV}>
          <div style={{...glass,padding:22,border:`1px solid ${regimeShift?'rgba(239,68,68,0.40)':'rgba(34,197,94,0.35)'}`,boxShadow:`0 4px 20px ${regimeShift?'rgba(239,68,68,0.12)':'rgba(34,197,94,0.12)'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:10,background:regimeShift?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)',border:`1px solid ${regimeShift?'rgba(239,68,68,0.35)':'rgba(34,197,94,0.35)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {regimeShift?<ShieldAlert size={18} style={{color:'#f87171'}}/>:<CheckCircle2 size={18} style={{color:'#4ade80'}}/>}
              </div>
              <span style={{background:regimeShift?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)',color:regimeShift?'#f87171':'#4ade80',border:`1px solid ${regimeShift?'rgba(239,68,68,0.35)':'rgba(34,197,94,0.35)'}`,borderRadius:999,padding:'3px 10px',fontSize:10,fontWeight:700,fontFamily:MONO}}>{regimeShift?'DANGER':'SAFE'}</span>
            </div>
            <div style={{fontSize:18,fontWeight:700,color:regimeShift?'#f87171':'#4ade80',marginBottom:6}}>{regimeShift?'REGIME SHIFT DETECTED':'ECOSYSTEM STABLE'}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:14}}>Regime Shift Index</div>
            <div style={{height:5,borderRadius:999,background:regimeShift?'linear-gradient(90deg,rgba(239,68,68,0.5),rgba(239,68,68,0.15))':'linear-gradient(90deg,rgba(34,197,94,0.55),rgba(34,197,94,0.15))'}}/> 
          </div>
        </motion.div>
      </div>

      {/* Alert badges */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:'18px 22px'}}>
          <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:12}}>Active Alerts</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {signals.map(s => (
              <AlertBadge key={s.indicator} status={s.status} label={s.indicator}/>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Indicator table */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24}}>
          <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:16}}>Indicator Summary</h3>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  {['Indicator','Value','Threshold','Status','Trend'].map(h => (
                    <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:10,letterSpacing:'0.12em',color:'rgba(255,255,255,0.35)',fontWeight:600,textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signals.map((s,i) => {
                  const st = STATUS[s.status as keyof typeof STATUS];
                  return (
                    <motion.tr key={s.indicator} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.05}}
                      style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}
                    >
                      <td style={{padding:'10px 12px',color:'rgba(255,255,255,0.80)',fontWeight:500}}>{s.indicator}</td>
                      <td style={{padding:'10px 12px',color:st.color,fontFamily:MONO}}>{s.value.toFixed(3)}</td>
                      <td style={{padding:'10px 12px',color:'rgba(255,255,255,0.35)',fontFamily:MONO}}>{s.threshold.toFixed(3)}</td>
                      <td style={{padding:'10px 12px'}}><AlertBadge status={s.status} label={s.status.charAt(0).toUpperCase()+s.status.slice(1)}/></td>
                      <td style={{padding:'10px 12px',color:'rgba(255,255,255,0.40)',textTransform:'capitalize'}}>{s.trend}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className={`grid grid-cols-1 ${isAquatic?'lg:grid-cols-2':'lg:grid-cols-2'} gap-6`}>
        {chartConfigs.map(c => (
          <motion.div key={c.key} variants={itemV}>
            <div style={{...glass,padding:24,height:340}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:c.color,display:'inline-block'}}/>
                <h3 style={{fontSize:11,letterSpacing:'0.13em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',fontWeight:600,margin:0}}>{c.label}</h3>
              </div>
              <ResponsiveContainer width="100%" height="82%">
                <AreaChart data={data} margin={{top:14,right:14,bottom:8,left:4}}>
                  <defs><linearGradient id={`gEW${c.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.color} stopOpacity={0.38}/>
                    <stop offset="100%" stopColor={c.color} stopOpacity={0}/>
                  </linearGradient></defs>
                  <Grid/><XAx/><YAx/>
                  <Tooltip content={<DarkTip/>}/>
                  <ReferenceLine y={c.ref} stroke="rgba(239,68,68,0.55)" strokeDasharray="6 3"
                    label={{value:c.refLabel,position:'right',fontSize:10,fill:'rgba(239,68,68,0.65)',fontFamily:MONO}}/>
                  <Area type="monotone" dataKey={c.key as any} name={c.label} stroke={c.color} strokeWidth={2} fill={`url(#gEW${c.key})`} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
