import { motion } from 'framer-motion';
import {
  Waves, TreePine, Target, Shield, Globe, Microscope,
  BarChart3, Brain, Code2, Server, Cpu, GitBranch,
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const MONO = '"JetBrains Mono","Fira Mono",monospace';

// ── Helpers ───────────────────────────────────────────────────────────────────
const GlassCard = ({ children, style = {}, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) => (
  <div className={className} style={{
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, ...style,
  }}>
    {children}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h3 style={{ fontSize: 11, letterSpacing: '0.13em', color: 'rgba(255,255,255,0.45)',
    fontWeight: 600, textTransform: 'uppercase', marginBottom: 20 }}>
    {title}
  </h3>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const goals = [
  {
    Icon: Microscope,
    title: 'Ecosystem Monitoring',
    desc: 'Continuous tracking of biodiversity, biomass, and fish capture rates across global marine and terrestrial ecosystems using satellite and field data.',
    accent: '#2b8bbf',
    accentBg: 'rgba(43,139,191,0.12)',
    accentBorder: 'rgba(43,139,191,0.30)',
  },
  {
    Icon: Shield,
    title: 'Early Warning Detection',
    desc: 'Statistical detection of critical slowing down signals — rising variance and autocorrelation — that precede ecosystem tipping points and regime shifts.',
    accent: '#f97316',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.30)',
  },
  {
    Icon: Target,
    title: 'Sustainability Planning',
    desc: 'Data-driven intervention modeling supporting conservation policies and sustainable resource management through scenario simulation.',
    accent: '#22c55e',
    accentBg: 'rgba(34,197,94,0.12)',
    accentBorder: 'rgba(34,197,94,0.30)',
  },
  {
    Icon: Brain,
    title: 'ML-Powered Predictions',
    desc: 'Machine learning models trained on ecological time-series to predict collapse probability and classify risk categories with quantified confidence scores.',
    accent: '#a855f7',
    accentBg: 'rgba(168,85,247,0.12)',
    accentBorder: 'rgba(168,85,247,0.30)',
  },
  {
    Icon: Globe,
    title: 'Global Coverage',
    desc: 'Scalable architecture designed to ingest data from multiple ecosystem types — pelagic, reef, rainforest, savanna — across different geographic regions.',
    accent: '#14b8a6',
    accentBg: 'rgba(20,184,166,0.12)',
    accentBorder: 'rgba(20,184,166,0.30)',
  },
  {
    Icon: BarChart3,
    title: 'Open Data Insights',
    desc: 'Interactive dashboards and explainability tooling enabling researchers, policymakers, and conservation practitioners to interpret model outputs.',
    accent: '#eab308',
    accentBg: 'rgba(234,179,8,0.12)',
    accentBorder: 'rgba(234,179,8,0.30)',
  },
];

const sdgs = [
  {
    number: '14',
    title: 'Life Below Water',
    desc: 'Conserve and sustainably use the oceans, seas and marine resources. EcoSentinel monitors fish capture pressure, marine biodiversity, and pelagic ecosystem stability as direct proxies for SDG 14 progress.',
    accent: '#1e5f8e',
    accentLight: '#2b8bbf',
    bg: 'linear-gradient(135deg, rgba(30,95,142,0.20), rgba(43,139,191,0.10))',
    border: 'rgba(43,139,191,0.35)',
    glow: 'rgba(43,139,191,0.15)',
    Icon: Waves,
  },
  {
    number: '15',
    title: 'Life on Land',
    desc: 'Protect, restore and promote sustainable use of terrestrial ecosystems and halt biodiversity loss. Our variance and autocorrelation indicators provide early warning for land-based regime shifts and forest collapse.',
    accent: '#1a5c38',
    accentLight: '#22c55e',
    bg: 'linear-gradient(135deg, rgba(26,92,56,0.22), rgba(34,197,94,0.10))',
    border: 'rgba(34,197,94,0.35)',
    glow: 'rgba(34,197,94,0.15)',
    Icon: TreePine,
  },
];

const methodologySteps = [
  { step: '01', title: 'Data Ingestion', desc: 'Time-series data collected from FAO, GBIF, and satellite sensors covering 1990–2023.' },
  { step: '02', title: 'EWS Computation', desc: 'Rolling variance, AR1 autocorrelation, and spectral reddening computed over sliding windows.' },
  { step: '03', title: 'Risk Scoring',    desc: 'Gradient-boosted ensemble model trained on 200+ historical ecosystem collapse events.' },
  { step: '04', title: 'Explainability',  desc: 'SHAP values decompose predictions into per-feature contributions for interpretability.' },
  { step: '05', title: 'Scenario Sim.',   desc: 'Monte Carlo simulation projects ecosystem trajectories under user-defined interventions.' },
];

const techStack = [
  { label: 'React 18',            Icon: Code2,     color: '#60a5fa' },
  { label: 'TypeScript',          Icon: Code2,     color: '#3b82f6' },
  { label: 'Tailwind CSS',        Icon: Code2,     color: '#38bdf8' },
  { label: 'Recharts',            Icon: BarChart3, color: '#818cf8' },
  { label: 'Framer Motion',       Icon: Cpu,       color: '#a78bfa' },
  { label: 'Radix UI',            Icon: Code2,     color: '#c084fc' },
  { label: 'Vite',                Icon: GitBranch, color: '#fbbf24' },
  { label: 'Python Backend ★',    Icon: Server,    color: '#34d399' },
  { label: 'ML Pipeline ★',       Icon: Brain,     color: '#4ade80' },
];

// ── Framer Motion variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] as const } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AboutPage = () => (
  <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

    {/* Heading */}
    <motion.div variants={itemVariants}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>About This Project</h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)' }}>Scientific foundations and development goals</p>
    </motion.div>

    {/* ── Mission statement ── */}
    <motion.div variants={itemVariants}>
      <GlassCard style={{
        padding: 32,
        background: 'linear-gradient(135deg, rgba(30,95,142,0.15), rgba(46,139,87,0.12))',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #1e5f8e, #2e8b57)',
            boxShadow: '0 0 18px rgba(46,139,87,0.40)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={24} style={{ color: '#ffffff' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>Mission Statement</h2>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
          The <strong style={{ color: '#ffffff' }}>Ecosystem Stability & Collapse Risk Assessment System</strong> is a
          scientific decision-support platform designed to help researchers, policymakers, and conservation practitioners
          monitor ecosystem health, detect early warning signals of collapse, and model intervention scenarios. By combining
          advanced statistical methods with machine learning, we aim to provide actionable intelligence for preserving
          Earth's critical ecosystems.
        </p>
      </GlassCard>
    </motion.div>

    {/* ── Project goals ── */}
    <motion.div variants={itemVariants}>
      <SectionHeader title="Project Goals" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.2, 0, 0, 1] }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${g.accentBorder}`,
              borderRadius: 16, padding: 22,
              boxShadow: `0 4px 20px ${g.accentBg}`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 28px ${g.accentBg}`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = `0 4px 20px ${g.accentBg}`; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 14,
              background: g.accentBg, border: `1px solid ${g.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <g.Icon size={18} style={{ color: g.accent }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>{g.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>{g.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* ── UN SDGs ── */}
    <motion.div variants={itemVariants}>
      <GlassCard style={{ padding: 28 }}>
        <SectionHeader title="Aligned with UN Sustainable Development Goals" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sdgs.map((sdg, i) => (
            <motion.div
              key={sdg.number}
              initial={{ opacity: 0, x: i === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              style={{
                background: sdg.bg,
                border: `1px solid ${sdg.border}`,
                borderRadius: 14, padding: 22,
                boxShadow: `0 4px 20px ${sdg.glow}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* SDG number block */}
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${sdg.accent}, ${sdg.accentLight})`,
                  boxShadow: `0 0 16px ${sdg.glow}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <sdg.Icon size={20} style={{ color: '#ffffff', marginBottom: 1 }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: MONO }}>
                    {sdg.number}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    SDG {sdg.number}: {sdg.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
                    {sdg.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>

    {/* ── Methodology ── */}
    <motion.div variants={itemVariants}>
      <GlassCard style={{ padding: 28 }}>
        <SectionHeader title="Scientific Methodology" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {methodologySteps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                padding: '16px 0',
                borderBottom: i < methodologySteps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {/* Step number */}
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: MONO, color: '#4ade80' }}>{s.step}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>

    {/* ── Tech stack ── */}
    <motion.div variants={itemVariants}>
      <GlassCard style={{ padding: 28 }}>
        <SectionHeader title="Technical Stack" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {techStack.map(t => (
            <div
              key={t.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.09)'; el.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            >
              <t.Icon size={13} style={{ color: t.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>{t.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 14, margin: '14px 0 0 0' }}>
          ★ Planned — Python ML backend and live data pipeline are under active development.
        </p>
      </GlassCard>
    </motion.div>

  </motion.div>
);

export default AboutPage;