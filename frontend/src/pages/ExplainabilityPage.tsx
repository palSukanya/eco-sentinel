import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getFeatureImportance } from '@/api/mockData';
import { getTerrestrialFeatureImportance } from '@/api/terrestrialData';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';
import { BarChart2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };
const axisStyle = { fill:'rgba(255,255,255,0.38)', fontSize:11, fontFamily:MONO };

const BAR_GRADS = [
  {id:'bg0',stops:['#b91c1c','#ef4444']},{id:'bg1',stops:['#92400e','#f97316']},
  {id:'bg2',stops:['#1e3a5f','#2b8bbf']},{id:'bg3',stops:['#581c87','#a855f7']},
  {id:'bg4',stops:['#166534','#22c55e']},
];

const DarkTip = ({ active,payload }:any) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'rgba(10,22,40,0.95)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 14px',fontFamily:MONO,fontSize:12,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
    {payload.map((e:any,i:number) => <p key={i} style={{margin:'2px 0',color:'rgba(255,255,255,0.6)'}}>{e.name}: <span style={{color:'#fff',fontWeight:700}}>{typeof e.value === 'number' ? e.value.toFixed(1) : e.value}%</span></p>)}
  </div>;
};

const itemV = { hidden:{opacity:0,y:14}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:[0.2,0,0,1] as const}} };

export default function ExplainabilityPage() {
  const { isAquatic, accentColor } = useEcosystem();
  const { aquaticMetrics, terrestrialMetrics } = useBackendData();

  // Prefer real backend feature importance
  const backendFI = isAquatic ? aquaticMetrics?.featureImportance : terrestrialMetrics?.featureImportance;
  const mockFI    = useMemo(() => isAquatic ? getFeatureImportance() : getTerrestrialFeatureImportance(), [isAquatic]);

  const features = useMemo(() => {
    if (backendFI && backendFI.length > 0) {
      // Convert backend format { feature, importance } → display format
      return backendFI.slice(0, 8).map((f, i) => ({
        feature:    f.feature,
        importance: Math.round(f.importance * 100 * 10) / 10,  // raw 0–1 → percentage
        direction:  (i < Math.ceil(backendFI.length * 0.7) ? 'negative' : 'positive') as 'positive' | 'negative',
      }));
    }
    return mockFI;
  }, [backendFI, mockFI]);

  const ranked = [...features].sort((a, b) => b.importance - a.importance);
  const dirs   = features.map(f => f.direction);

  const modelR2  = isAquatic ? aquaticMetrics?.modelMetrics.r2  : terrestrialMetrics?.modelMetrics.r2;
  const modelMAE = isAquatic ? aquaticMetrics?.modelMetrics.mae : terrestrialMetrics?.modelMetrics.mae;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
      <motion.div variants={itemV}>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>Model Explainability</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>
          {isAquatic
            ? 'Random Forest feature importance — what drives aquatic ecosystem instability'
            : 'Random Forest feature importance — what drives terrestrial ecosystem collapse risk'}
        </p>
      </motion.div>

      {/* Model metrics row */}
      {(modelR2 != null || modelMAE != null) && (
        <motion.div variants={itemV} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Model Type',   value:'Random Forest',                color:'rgba(255,255,255,0.85)' },
            { label:'R² Score',     value: modelR2  != null ? modelR2.toFixed(4)  : '—', color:accentColor },
            { label:'MAE',          value: modelMAE != null ? modelMAE.toFixed(4) : '—', color:'#f59e0b' },
            { label:'Data Source',  value: isAquatic ? 'Ecosystem Stability.csv' : 'Terrestrial.csv', color:'rgba(255,255,255,0.55)' },
          ].map(m => (
            <div key={m.label} style={{...glass,padding:18}}>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.38)',letterSpacing:'0.13em',textTransform:'uppercase',marginBottom:6}}>{m.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:m.color,fontFamily:MONO}}>{m.value}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ranked.slice(0,3).map((f,i) => {
          const isNeg  = f.direction === 'negative';
          const color  = isNeg ? '#f87171' : '#4ade80';
          const bg     = isNeg ? 'rgba(239,68,68,0.14)' : 'rgba(34,197,94,0.14)';
          const border = isNeg ? 'rgba(239,68,68,0.30)' : 'rgba(34,197,94,0.30)';
          return (
            <motion.div key={f.feature} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1,duration:0.4}}>
              <div style={{...glass,padding:22,border:`1px solid ${border}`,boxShadow:`0 4px 18px ${bg}`}}>
                <div style={{width:40,height:40,borderRadius:10,marginBottom:14,background:bg,border:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <BarChart2 size={18} style={{color}}/>
                </div>
                <div style={{fontSize:42,fontWeight:800,fontFamily:MONO,lineHeight:1,color:'#fff',marginBottom:6}}>{f.importance.toFixed(1)}%</div>
                <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.75)',marginBottom:8}}>{f.feature}</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  {isNeg ? <AlertTriangle size={12} style={{color}}/> : <CheckCircle2 size={12} style={{color}}/>}
                  <span style={{fontSize:11,fontWeight:600,color}}>{isNeg?'↑ Destabilizing':'↓ Stabilizing'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Horizontal bar chart */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24}}>
          <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:20}}>
            Feature Importance — {isAquatic ? 'Aquatic Model' : 'Terrestrial Model'}
          </h3>
          <ResponsiveContainer width="100%" height={Math.max(200, ranked.length * 48)}>
            <BarChart data={ranked} layout="vertical" margin={{top:4,right:60,bottom:4,left:4}}>
              <defs>
                {BAR_GRADS.map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={g.stops[0]}/>
                    <stop offset="100%" stopColor={g.stops[1]}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis type="number" tick={axisStyle} axisLine={{stroke:'rgba(255,255,255,0.08)'}} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`}/>
              <YAxis type="category" dataKey="feature" tick={{...axisStyle,fontSize:12}} axisLine={false} tickLine={false} width={220}/>
              <Tooltip content={<DarkTip/>}/>
              <Bar dataKey="importance" name="Importance" radius={[0,6,6,0]} maxBarSize={28}>
                {ranked.map((_,i) => <Cell key={i} fill={`url(#${BAR_GRADS[i%BAR_GRADS.length].id})`}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Full table */}
      <motion.div variants={itemV}>
        <div style={{...glass,padding:24}}>
          <h3 style={{fontSize:11,letterSpacing:'0.13em',color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',marginBottom:16}}>
            All Features — Ranked by Importance
          </h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {ranked.map((f,i) => {
              const isNeg = f.direction === 'negative';
              const color = isNeg ? '#f87171' : '#4ade80';
              return (
                <motion.div key={f.feature} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.06,duration:0.35}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <span style={{fontSize:11,fontFamily:MONO,color:'rgba(255,255,255,0.30)',width:20,textAlign:'right',flexShrink:0}}>#{i+1}</span>
                    <span style={{fontSize:13,color:'rgba(255,255,255,0.78)',fontWeight:500,width:200,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.feature}</span>
                    <div style={{flex:1,height:8,borderRadius:999,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                      <motion.div initial={{width:0}} animate={{width:`${f.importance}%`}} transition={{duration:0.9,delay:i*0.07,ease:[0.2,0,0,1]}}
                        style={{height:'100%',borderRadius:999,background:isNeg?'linear-gradient(90deg,#b91c1c,#ef4444)':'linear-gradient(90deg,#166534,#22c55e)'}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,fontFamily:MONO,color,width:48,textAlign:'right',flexShrink:0}}>{f.importance.toFixed(1)}%</span>
                    <span style={{fontSize:10,fontWeight:700,color,padding:'2px 8px',borderRadius:999,background:`${color}18`,border:`1px solid ${color}30`,flexShrink:0}}>
                      {isNeg ? '↑ RISK' : '↓ RISK'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
