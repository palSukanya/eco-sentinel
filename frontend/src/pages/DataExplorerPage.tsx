import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, Database } from 'lucide-react';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';
import { generateEcosystemData } from '@/api/mockData';
import { generateTerrestrialData } from '@/api/terrestrialData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';
const inputBase: React.CSSProperties = { background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:10,color:'rgba(255,255,255,0.85)',fontFamily:MONO,fontSize:13,outline:'none',transition:'border-color 0.15s ease,box-shadow 0.15s ease' };
const focus = { borderColor:'rgba(20,184,166,0.70)',boxShadow:'0 0 0 3px rgba(20,184,166,0.15)' };
const blur  = { borderColor:'rgba(255,255,255,0.10)',boxShadow:'none' };

// Columns driven purely by real backend trend_data shape
const AQUA_COLS  = ['year','month','stability_score','resilience_score','status'] as const;
const TERRA_COLS = ['year','month','stability_score','resilience_score','status'] as const;

const AQUA_LABELS:  Record<string,string> = { year:'Year', month:'Month', stability_score:'Stability Score', resilience_score:'Resilience Score', status:'Status' };
const TERRA_LABELS: Record<string,string> = { year:'Year', month:'Month', stability_score:'Stability Score', resilience_score:'Resilience Score', status:'Status' };

function valueColor(key: string, val: any): string {
  if (key === 'stability_score') return Number(val)>=70?'#4ade80':Number(val)>=40?'#fbbf24':'#f87171';
  if (key === 'status') {
    const s = String(val);
    if (s==='Healthy'||s==='Stable') return '#4ade80';
    if (s==='Vulnerable') return '#fbbf24';
    if (s==='Unstable')   return '#fb923c';
    return '#f87171';
  }
  return 'rgba(255,255,255,0.80)';
}

const tableV = { hidden:{}, visible:{ transition:{ staggerChildren:0.018 } } };
const rowV   = { hidden:{opacity:0,x:-10}, visible:{opacity:1,x:0,transition:{duration:0.22,ease:[0.2,0,0,1] as const}} };

export default function DataExplorerPage() {
  const { isAquatic, accentColor, accentBorder } = useEcosystem();
  const { aquatic, terrestrial, aquaticChartData, terrestrialChartData } = useBackendData();

  // Build table rows from backend trend_data (monthly) or fallback to annual chart data
  const rawRows: any[] = useMemo(() => {
    if (isAquatic) {
      if (aquatic?.trend_data?.length) return aquatic.trend_data;
      return generateEcosystemData().map(d => ({ year:d.year, month:'-', stability_score:d.stability, resilience_score:(d.biodiversityIndex*100).toFixed(1), status:'—' }));
    } else {
      if (terrestrial?.trend_data?.length) return terrestrial.trend_data;
      return generateTerrestrialData().map(d => ({ year:d.year, month:'-', stability_score:d.stability, resilience_score:(d.ndvi*100).toFixed(1), status:'—' }));
    }
  }, [isAquatic, aquatic, terrestrial]);

  const cols   = isAquatic ? AQUA_COLS  : TERRA_COLS;
  const labels = isAquatic ? AQUA_LABELS: TERRA_LABELS;

  const [search,    setSearch]    = useState('');
  const [yearRange, setYearRange] = useState<[number,number]>([2013, 2020]);

  const filtered = rawRows.filter((d: any) => {
    if (d.year < yearRange[0] || d.year > yearRange[1]) return false;
    if (search && !Object.values(d).some((v: any) => String(v).toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const downloadCSV = () => {
    const headers = cols.join(',');
    const rows    = filtered.map((d: any) => cols.map(c => d[c]).join(',')).join('\n');
    const blob    = new Blob([headers+'\n'+rows], {type:'text/csv'});
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url; a.download = `${isAquatic?'aquatic':'terrestrial'}_stability_data.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const glass: React.CSSProperties = { background:'rgba(255,255,255,0.06)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16 };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:4}}>Data Explorer</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.40)'}}>
          {isAquatic
            ? 'Aquatic ecosystem — Monthly stability scores from Random Forest model (2013–2020)'
            : 'Terrestrial ecosystem — Monthly stability scores from Random Forest model (2013–2020)'}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{...glass,border:`1px solid ${accentBorder}`,padding:'14px 18px',display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>
        <div style={{position:'relative',flex:'1 1 200px',minWidth:160}}>
          <Search size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.35)',pointerEvents:'none'}}/>
          <input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{...inputBase,width:'100%',paddingLeft:34,paddingRight:12,paddingTop:8,paddingBottom:8}}
            onFocus={e=>Object.assign(e.currentTarget.style,focus)} onBlur={e=>Object.assign(e.currentTarget.style,blur)}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.40)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Year</span>
          <input type="number" min={2013} max={2020} value={yearRange[0]} onChange={e=>setYearRange([Number(e.target.value),yearRange[1]])}
            style={{...inputBase,width:70,padding:'7px 10px',textAlign:'center'}}
            onFocus={e=>Object.assign(e.currentTarget.style,focus)} onBlur={e=>Object.assign(e.currentTarget.style,blur)}/>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>–</span>
          <input type="number" min={2013} max={2020} value={yearRange[1]} onChange={e=>setYearRange([yearRange[0],Number(e.target.value)])}
            style={{...inputBase,width:70,padding:'7px 10px',textAlign:'center'}}
            onFocus={e=>Object.assign(e.currentTarget.style,focus)} onBlur={e=>Object.assign(e.currentTarget.style,blur)}/>
        </div>
        <button onClick={downloadCSV} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,background:`${accentColor}18`,border:`1px solid ${accentColor}45`,color:accentColor,fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s ease'}}
          onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background=`${accentColor}30`)}
          onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background=`${accentColor}18`)}>
          <Download size={13}/> Export CSV
        </button>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,0.35)',fontFamily:MONO}}>
          <Database size={12}/>{filtered.length} records
        </div>
      </div>

      {/* Table */}
      <div style={{...glass,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <motion.table style={{width:'100%',borderCollapse:'collapse',fontSize:13}} variants={tableV} initial="hidden" animate="visible">
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.10)'}}>
                {cols.map(c => (
                  <th key={c} style={{textAlign:'left',padding:'12px 16px',fontSize:10,letterSpacing:'0.12em',color:'rgba(255,255,255,0.38)',fontWeight:600,textTransform:'uppercase',whiteSpace:'nowrap',background:'rgba(255,255,255,0.03)'}}>
                    {labels[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((d: any, i: number) => (
                <motion.tr key={i} variants={rowV}
                  style={{borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'default'}}
                  onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)')}
                  onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background='transparent')}>
                  {cols.map(c => (
                    <td key={c} style={{padding:'10px 16px',color:valueColor(c,d[c]),fontFamily:MONO,whiteSpace:'nowrap'}}>
                      {typeof d[c] === 'number' ? d[c].toFixed ? (d[c] as number).toFixed(2) : d[c] : d[c]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
        {filtered.length === 0 && (
          <div style={{padding:'40px 0',textAlign:'center',color:'rgba(255,255,255,0.28)',fontSize:14}}>No records match your filter.</div>
        )}
        {filtered.length > 200 && (
          <div style={{padding:'12px 16px',textAlign:'center',color:'rgba(255,255,255,0.28)',fontSize:12,fontFamily:MONO}}>
            Showing first 200 of {filtered.length} records — use year range filter to narrow results
          </div>
        )}
      </div>
    </div>
  );
}
