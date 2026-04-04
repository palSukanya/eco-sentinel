import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, AlertTriangle, ShieldAlert,
  FlaskConical, Database, BrainCircuit, Info, ShieldCheck,
  Search, Download, Menu, Home, Waves, Trees,
} from 'lucide-react';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useBackendData } from '@/api/useBackendData';

const MONO = '"JetBrains Mono","Fira Mono",monospace';

const navItems = [
  { icon: Home,          label: 'Home',             path: '/' },
  { icon: LayoutDashboard,label: 'Dashboard',       path: '/dashboard' },
  { icon: Activity,      label: 'Stability Analysis',path: '/stability' },
  { icon: AlertTriangle, label: 'Early Warning',    path: '/early-warning' },
  { icon: ShieldAlert,   label: 'Collapse Risk',    path: '/collapse-risk' },
  { icon: FlaskConical,  label: 'Simulation Lab',   path: '/simulation' },
  { icon: Database,      label: 'Data Explorer',    path: '/data-explorer' },
  { icon: BrainCircuit,  label: 'Explainability',   path: '/explainability' },
  { icon: Info,          label: 'About',            path: '/about' },
];

interface DashboardLayoutProps { children: ReactNode; }

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location   = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { ecosystem, setEcosystem, isAquatic, accentColor, accentBorder } = useEcosystem();
  const { aquaticMetrics, terrestrialMetrics, loading, error } = useBackendData();
  const currentPageLabel = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard';

  // Live scores for the header pill
  const liveScore = isAquatic
    ? aquaticMetrics?.stabilityScore
    : terrestrialMetrics?.stabilityScore;
  const liveRisk = isAquatic
    ? aquaticMetrics?.collapseRiskScore
    : terrestrialMetrics?.collapseRiskScore;

  return (
    <div className="flex min-h-screen bg-background">
      <style>{`
        @keyframes shimmer-header { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes pulse-dot { 0%,100%{opacity:1;box-shadow:0 0 6px 2px ${accentColor}} 50%{opacity:0.45;box-shadow:0 0 2px 0 ${accentColor}} }
        @keyframes bg-drift  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        .hdr-shimmer       { background:linear-gradient(90deg,#2e8b57,#1e5f8e,#14b8a6,#2e8b57);background-size:200% 100%;animation:shimmer-header 3s linear infinite; }
        .hdr-shimmer-terra { background:linear-gradient(90deg,#166534,#15803d,#22c55e,#166534);background-size:200% 100%;animation:shimmer-header 3s linear infinite; }
        .main-bg           { background:linear-gradient(135deg,#080f1a 0%,#091a10 40%,#080f1a 100%);background-size:300% 300%;animation:bg-drift 20s ease infinite; }
        .eco-pill-aquatic  { background:rgba(20,184,166,0.15);border-color:rgba(20,184,166,0.40);color:#5eead4; }
        .eco-pill-terra    { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.40); color:#86efac; }
        .search-input::placeholder { color:rgba(255,255,255,0.28); }
        .sidebar-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-scroll::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: ${accentColor};
    border-radius: 10px;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #2dd4bf, #4ade80);
  }

      `}</style>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}/>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-60 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${sidebarOpen?'translate-x-0':'-translate-x-full'} md:translate-x-0 flex flex-col overflow-hidden`}
        style={{ background:'linear-gradient(180deg,#0a1628 0%,#0d2b1a 100%)', borderRight:'1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div className="p-6 pb-4 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#1e5f8e,#2e8b57)', boxShadow:'0 0 14px 3px rgba(46,139,87,0.45),0 2px 8px rgba(0,0,0,0.4)' }}>
              <ShieldCheck className="text-white" size={22}/>
            </div>
            <div className="leading-tight">
              <span className="font-bold tracking-tight text-sm" style={{color:'rgba(255,255,255,0.92)'}}>ECO-Senitel</span><br/>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{color:accentColor}}>Stability Lab</span>
            </div>
          </div>

          {/* Aquatic / Terrestrial toggle */}
          <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.10)', marginBottom:24, background:'rgba(255,255,255,0.04)' }}>
            {(['aquatic','terrestrial'] as const).map(e => {
              const active = ecosystem === e;
              const isA    = e === 'aquatic';
              return (
                <button key={e} onClick={() => setEcosystem(e)} style={{
                  flex:1, padding:'8px 4px', fontSize:11, fontWeight:600, border:'none', cursor:'pointer',
                  background: active ? (isA?'rgba(20,184,166,0.22)':'rgba(34,197,94,0.22)') : 'transparent',
                  color:      active ? (isA?'#5eead4':'#86efac') : 'rgba(255,255,255,0.40)',
                  borderBottom: active ? `2px solid ${isA?'#14b8a6':'#22c55e'}` : '2px solid transparent',
                  transition:'all 0.2s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                }}>
                  {isA ? <Waves size={12}/> : <Trees size={12}/>}
                  {isA ? 'Aquatic' : 'Land'}
                </button>
              );
            })}
          </div>

          {/* Live score mini-card in sidebar */}
          {!loading && !error && liveScore != null && (
            <div style={{ marginBottom:20, padding:'12px 14px', borderRadius:12, background:`${accentColor}10`, border:`1px solid ${accentBorder}` }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.13em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:6 }}>
                Live Model Output
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', marginBottom:2 }}>Stability</div>
                  <div style={{ fontSize:18, fontWeight:800, color:accentColor, fontFamily:MONO }}>{liveScore.toFixed(1)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', marginBottom:2 }}>Risk</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#f87171', fontFamily:MONO }}>{liveRisk?.toFixed(1)}%</div>
                </div>
              </div>
              <div style={{ marginTop:8, height:3, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${liveScore}%`, background:`linear-gradient(90deg,${accentColor}88,${accentColor})`, borderRadius:999, transition:'width 1s ease' }}/>
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav className="sidebar-scroll space-y-0.5 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{ background:isActive?`${accentColor}18`:'transparent', color:isActive?accentColor:'rgba(255,255,255,0.50)', borderLeft:`2px solid ${isActive?accentColor:'transparent'}`, paddingLeft:'12px' }}
                  onMouseEnter={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if(!isActive)(e.currentTarget as HTMLElement).style.background='transparent'; }}>
                  <item.icon size={18} style={{color:isActive?accentColor:'inherit'}}/>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="mt-auto p-5 flex items-center space-x-2" style={{borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: error?'#f87171':loading?'#fbbf24':accentColor, animation:'pulse-dot 2s ease-in-out infinite' }}/>
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{color: error?'#f87171':loading?'#fbbf24':accentColor}}>
            {error ? 'Backend Offline' : loading ? 'Connecting…' : 'ML Pipeline Active'}
          </span>
          <span className="ml-auto text-[9px] uppercase tracking-wider" style={{color:'rgba(255,255,255,0.25)',fontFamily:MONO}}>v2.0</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header ── */}
        <header className="h-14 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between overflow-hidden"
          style={{ background:'rgba(10,22,40,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div className={`absolute top-0 left-0 right-0 ${isAquatic?'hdr-shimmer':'hdr-shimmer-terra'}`} style={{height:2}}/>

          {/* Left cluster */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg md:hidden" style={{color:'rgba(255,255,255,0.6)'}}>
              <Menu size={20}/>
            </button>

            <div className={`eco-pill-${isAquatic?'aquatic':'terra'}`}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:999, border:'1px solid', fontSize:12, fontWeight:600 }}>
              {isAquatic ? <Waves size={12}/> : <Trees size={12}/>}
              {isAquatic ? 'Aquatic' : 'Terrestrial'}
            </div>

            <h2 className="text-sm font-semibold hidden sm:block">
              <span style={{color:'rgba(255,255,255,0.35)'}}>ECO-Senitel / </span>
              <span style={{color:'rgba(255,255,255,0.88)'}}>{currentPageLabel}</span>
            </h2>
            <h2 className="text-sm font-semibold sm:hidden" style={{color:'rgba(255,255,255,0.88)'}}>{currentPageLabel}</h2>

            <div className="hidden sm:block h-4 w-px" style={{background:'rgba(255,255,255,0.12)'}}/>

            {/* Data source badge */}
            <div className="hidden sm:flex items-center gap-2" style={{ padding:'5px 12px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', fontSize:11, color:'rgba(255,255,255,0.50)', fontFamily:MONO }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: error?'#f87171':loading?'#fbbf24':'#4ade80', display:'inline-block', flexShrink:0 }}/>
              {error ? 'Mock data' : loading ? 'Loading…' : isAquatic ? 'Ecosystem Stability.csv' : 'Ecosystem Stability Terrestrial.csv'}
            </div>
          </div>

          
        </header>

        {/* ── Main area ── */}
        <main className="flex-1 overflow-y-auto main-bg">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={`${location.pathname}-${ecosystem}`}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                transition={{duration:0.25,ease:[0.2,0,0,1]}}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
