import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getMetricSummary, getFeatureImportance } from '@/api/mockData';
import { getTerrestrialMetrics, getTerrestrialFeatureImportance } from '@/api/terrestrialData';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };
const PIE_COLORS = ['#ef4444','#f97316','#2b8bbf','#a855f7','#22c55e'];

const RISK_STYLES: Record<string,{color:string;bg:string;border:string}> = {
  Stable:     {color:'#4ade80',bg:'rgba(34,197,94,0.15)',  border:'rgba(34,197,94,0.35)'},
  Vulnerable: {color:'#fbbf24',bg:'rgba(245,158,11,0.15)',border:'rgba(245,158,11,0.35)'},
  'High Risk':{color:'#fb923c',bg:'rgba(249,115,22,0.15)',border:'rgba(249,115,22,0.35)'},
  Critical:   {color:'#f87171',bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.35)'},
};
const FACTOR_COLORS = { negative:'linear-gradient(90deg,#b91c1c,#ef4444)', positive:'linear-gradient(90deg,#166534,#22c55e)' } as const;

const DarkTip = ({ active,payload }:any) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'rgba(10,22,40,0.95)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 14px',fontFamily:MONO,fontSize:12}}>
    {payload.map((e:any,i:number) => <p key={i} style={{color:'rgba(255,255,255,0.8)',margin:'2px 0'}}>{e.name}: <span style={{color:'#fff',fontWeight:700}}>{e.value.toFixed(1)}%</span></p>)}
  </div>;
};

const Gauge = ({ risk }: { risk: number }) => {
  const W=300,H=170,cx=W/2,cy=H-10,R=108,rIn=65;
  const zones = ['#22c55e','#eab308','#f97316','#ef4444','#7f1d1d'];
  const seg = (s:number,e:number,col:string,k:number) => {
    const r=(d:number) => ((d-180)*Math.PI)/180;
    const [x1,y1]=[cx+R*Math.cos(r(s)),cy+R*Math.sin(r(s))];
    const [x2,y2]=[cx+R*Math.cos(r(e)),cy+R*Math.sin(r(e))];
    const [xi1,yi1]=[cx+rIn*Math.cos(r(s)),cy+rIn*Math.sin(r(s))];
    const [xi2,yi2]=[cx+rIn*Math.cos(r(e)),cy+rIn*Math.sin(r(e))];
    return <path key={k} d={`M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} L${xi2} ${yi2} A${rIn} ${rIn} 0 0 0 ${xi1} ${yi1}Z`} fill={col} opacity={0.85}/>;
  };
  const needleDeg = (risk/100)*180;
  const nRad = ((needleDeg-180)*Math.PI)/180;
  const color = risk<20?'#22c55e':risk<40?'#eab308':risk<60?'#f97316':risk<80?'#ef4444':'#7f1d1d';
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <svg width={W} height={H+24} viewBox={`0 0 ${W} ${H+24}`}>
        {zones.map((c,i) => seg(i*36,(i+1)*36,c,i))}
        {[1,2,3,4].map(i => { const r=((i*36-180)*Math.PI)/180; return <line key={i} x1={cx+R*Math.cos(r)} y1={cy+R*Math.sin(r)} x2={cx+rIn*Math.cos(r)} y2={cy+rIn*Math.sin(r)} stroke="rgba(8,15,26,0.7)" strokeWidth={2.5}/>; })}
        <motion.line x1={cx} y1={cy} x2={cx+(R-6)*Math.cos(nRad)} y2={cy+(R-6)*Math.sin(nRad)}
          stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 5px ${color})`}}
          initial={{rotate:-180,originX:`${cx}px`,originY:`${cy}px`}} animate={{rotate:0,originX:`${cx}px`,originY:`${cy}px`}} transition={{duration:1.4,ease:[0.2,0,0,1]}}/>
        <circle cx={cx} cy={cy} r={7} fill={color} style={{filter:`drop-shadow(0 0 7px ${color})`}}/>
        <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.9)"/>
      </svg>
      <div style={{textAlign:'center',marginTop:-12}}>
        <div style={{fontSize:46,fontWeight:700,fontFamily:MONO,color,lineHeight:1}}>{risk.toFixed(1)}</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.38)',marginTop:2}}>collapse risk score</div>
      </div>
    </div>
  );
};

const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };

export default function CollapseRiskPage() {
  const { isAquatic } = useEcosystem();
  const { aquaticMetrics, terrestrialMetrics } = useBackendData();

  // Mock fallbacks
  const mockAquaM  = useMemo(() => getMetricSummary(), []);
  const mockTerraM = useMemo(() => getTerrestrialMetrics(), []);
  const mockAquaF  = useMemo(() => getFeatureImportance(), []);
  const mockTerraF = useMemo(() => getTerrestrialFeatureImportance(), []);

  // Use backend metrics if available
  const riskScore    = isAquatic ? (aquaticMetrics?.collapseRiskScore ?? mockAquaM.collapseRiskScore)  : (terrestrialMetrics?.collapseRiskScore ?? mockTerraM.collapseRiskScore);
  const riskCategory = isAquatic ? (aquaticMetrics?.riskCategory      ?? mockAquaM.riskCategory)       : (terrestrialMetrics?.riskCategory      ?? mockTerraM.riskCategory);
  const trendDir     = isAquatic ? (aquaticMetrics?.trendDirection     ?? 'declining')                  : (terrestrialMetrics?.trendDirection     ?? 'declining');
  const trendSlope   = isAquatic ? (aquaticMetrics?.trendSlope         ?? mockAquaM.varianceTrend)       : (terrestrialMetrics?.trendSlope         ?? mockTerraM.varianceTrend);
  const modelR2      = isAquatic ? (aquaticMetrics?.modelMetrics.r2    ?? null)                          : (terrestrialMetrics?.modelMetrics.r2    ?? null);

  // Feature importance — prefer real backend data
  const backendFeatures = isAquatic ? aquaticMetrics?.featureImportance : terrestrialMetrics?.featureImportance;
  const features = backendFeatures && backendFeatures.length > 0
    ? backendFeatures.slice(0, 5).map((f, i) => ({
        feature:    f.feature,
        importance: Math.round(f.importance * 100 * 10) / 10,
        direction:  i < 3 ? 'negative' as const : 'positive' as const,
      }))
    : (isAquatic ? mockAquaF : mockTerraF);

  const pieData = features.map(f => ({ name: f.feature, value: f.importance }));
  const badge   = RISK_STYLES[riskCategory] ?? RISK_STYLES['Stable'];

  const mockM   = isAquatic ? mockAquaM : mockTerraM;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
      <motion.div variants={itemV}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>Collapse Risk Assessment</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>Comprehensive risk scoring and contributing factor analysis — {isAquatic?'Aquatic':'Terrestrial'} ecosystem</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge */}
        <motion.div variants={itemV}>
          <div style={{...glass,padding:'24px 14px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <Gauge risk={riskScore}/>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div variants={itemV}>
          <div style={{...glass,padding:24,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <span style={{fontSize:10,letterSpacing:'0.13em',color:'rgba(255,255,255,0.40)',fontWeight:600,textTransform:'uppercase',marginBottom:12,display:'block'}}>Risk Category</span>
            <div style={{fontSize:26,fontWeight:800,color:badge.color,background:badge.bg,border:`1px solid ${badge.border}`,borderRadius:12,padding:'7px 16px',display:'inline-block',marginBottom:18,textShadow:`0 0 18px ${badge.color}55`}}>
              {riskCategory}
            </div>
            {[
              { label:'Confidence',    value: modelR2 ? `${(modelR2*100).toFixed(1)}%` : `${mockM.confidence}%` },
              { label:'Trend',         value: trendDir },
              { label:'Trend Slope',   value: trendSlope.toFixed(4) },
              { label:'Autocorr.',     value: (mockM.autocorrelationTrend ?? 0).toFixed(3) },
            ].map(r => (
              <div key={r.label} style={{display:'flex',justifyContent:'space-between',marginBottom:9}}>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.40)'}}>{r.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:MONO}}>{r.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Donut */}
        <motion.div variants={itemV}>
          <div style={{...glass,padding:24}}>
            <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:16}}>Factor Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} innerRadius={48} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<DarkTip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:8}}>
              {features.map((f,i) => (
                <div key={f.feature} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:7,height:7,borderRadius:2,background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.55)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.feature}</span>
                  <span style={{fontSize:11,fontFamily:MONO,color:'rgba(255,255,255,0.35)'}}>{f.importance}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contribution bars */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24}}>
          <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:20}}>Contributing Factors — {isAquatic?'Aquatic':'Terrestrial'}</h3>
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            {features.map((f,i) => (
              <motion.div key={f.feature} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.09,duration:0.4,ease:[0.2,0,0,1]}} style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.75)',fontWeight:500,width:220,flexShrink:0}}>{f.feature}</span>
                <div style={{flex:1,height:10,borderRadius:5,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
                  <motion.div initial={{width:0}} animate={{width:`${f.importance}%`}} transition={{duration:0.9,delay:i*0.1,ease:[0.2,0,0,1]}}
                    style={{height:'100%',borderRadius:5,background:FACTOR_COLORS[f.direction]}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,fontFamily:MONO,color:f.direction==='positive'?'#4ade80':'#f87171',width:40,textAlign:'right',flexShrink:0}}>{f.importance}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
