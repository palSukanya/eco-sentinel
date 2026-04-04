import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShieldAlert, Activity, FlaskConical,
  BarChart3, Waves, ChevronDown,
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const MONO = '"JetBrains Mono","Fira Mono",monospace';

const PARTICLE_COLORS = ['#2b8bbf', '#3cb371'];

// ── Feature card data ─────────────────────────────────────────────────────────
const features = [
  {
    Icon: TrendingUp,
    title: 'Trend Analysis',
    desc:  'Track long-term ecosystem stability using rolling statistical indicators and variance detection across 26 years of historical data.',
    accent:       '#2b8bbf',
    accentDim:    'rgba(43,139,191,0.14)',
    accentBorder: 'rgba(43,139,191,0.35)',
    accentGlow:   'rgba(43,139,191,0.20)',
    topBorder:    '#2b8bbf',
  },
  {
    Icon: ShieldAlert,
    title: 'Risk Prediction',
    desc:  'ML-powered collapse risk scoring with SHAP-based explainability, confidence intervals, and real-time category classification.',
    accent:       '#ef4444',
    accentDim:    'rgba(239,68,68,0.14)',
    accentBorder: 'rgba(239,68,68,0.35)',
    accentGlow:   'rgba(239,68,68,0.18)',
    topBorder:    '#ef4444',
  },
  {
    Icon: Activity,
    title: 'Ecosystem Monitoring',
    desc:  'Continuous tracking of biodiversity index, biomass flux, and fish capture pressure with automated early-warning alerts.',
    accent:       '#22c55e',
    accentDim:    'rgba(34,197,94,0.14)',
    accentBorder: 'rgba(34,197,94,0.35)',
    accentGlow:   'rgba(34,197,94,0.18)',
    topBorder:    '#22c55e',
  },
  {
    Icon: FlaskConical,
    title: 'Simulation Lab',
    desc:  'Model what-if intervention scenarios: adjust capture rates, biodiversity targets, and stress levels to project recovery outcomes.',
    accent:       '#14b8a6',
    accentDim:    'rgba(20,184,166,0.14)',
    accentBorder: 'rgba(20,184,166,0.35)',
    accentGlow:   'rgba(20,184,166,0.18)',
    topBorder:    '#14b8a6',
  },
];

// ── Stats data ────────────────────────────────────────────────────────────────
const stats = [
  { value: '7 Years',       label: 'Historical data coverage' },
  { value: '2 Ecosystems',   label: 'Monitored globally'       },
];

// ── Canvas particle background ────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Build 80 particles alternating two colors
    const particles = Array.from({ length: 80 }, (_, i) => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.6,
      vx:    (Math.random() - 0.5) * 0.28,
      vy:    (Math.random() - 0.5) * 0.28,
      color: PARTICLE_COLORS[i % 2],
      o:     Math.random() * 0.45 + 0.15,
    }));

    const CONNECTION_DIST = 120;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions with wrap-around
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -12) p.x = canvas.width  + 12;
        if (p.x > canvas.width  + 12) p.x = -12;
        if (p.y < -12) p.y = canvas.height + 12;
        if (p.y > canvas.height + 12) p.y = -12;
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Use the first particle's color for the line
            const hex = particles[i].color;
            const r   = parseInt(hex.slice(1, 3), 16);
            const g   = parseInt(hex.slice(3, 5), 16);
            const b   = parseInt(hex.slice(5, 7), 16);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.o})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
};

// ── Scroll-triggered section wrapper ─────────────────────────────────────────
const FadeInSection = ({
  children, delay = 0, className = '',
}: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#ffffff' }}>

      {/* ════════════════════════════════════════════════════════
          HERO — 100vh
      ════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingBottom: 128,
        background: 'linear-gradient(180deg, #0a1628 0%, #0d2b1a 60%, #0a1628 100%)',
      }}>
        {/* Particle canvas */}
        <ParticleCanvas />

        {/* Gradient overlay so text is always readable */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,22,40,0.20) 0%, rgba(10,22,40,0.70) 100%)',
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 860, margin: '0 auto' }}>

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 999,
              background: 'rgba(60,179,113,0.12)',
              border: '1px solid rgba(60,179,113,0.30)',
              fontSize: 12, fontWeight: 600, color: '#3cb371', letterSpacing: '0.06em',
            }}>
              <Waves size={13} />
              Scientific Decision Support System
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.2, 0, 0, 1] }}
            style={{
              fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }}
          >
            Ecosystem Stability &{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #7ec8e3 0%, #3cb371 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Collapse Risk Assessment
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.2, 0, 0, 1] }}
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: 600,
              margin: '0 auto 40px',
              lineHeight: 1.65,
            }}
          >
            AI-powered monitoring for ecosystem resilience and early collapse detection.
            Analyze trends, predict risks, and simulate conservation interventions.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34, ease: [0.2, 0, 0, 1] }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}
          >
            {/* Primary CTA */}
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '16px 32px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #1a5c38, #1e5f8e)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(26,92,56,0.45)',
                  transition: 'box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 32px rgba(26,92,56,0.65), 0 0 0 1px rgba(34,197,94,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(26,92,56,0.45)'; }}
              >
                <BarChart3 size={18} />
                Open Dashboard
              </motion.div>
            </Link>

            {/* Secondary CTA */}
            <Link to="/simulation" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '16px 32px', borderRadius: 999,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.28)',
                  color: 'rgba(255,255,255,0.82)', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.08)'; el.style.borderColor = 'rgba(255,255,255,0.45)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'rgba(255,255,255,0.28)'; }}
              >
                <FlaskConical size={18} />
                Explore Simulation
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.5, ease: [0.2, 0, 0, 1] }}
          style={{
            position: 'relative', zIndex: 2,
            marginTop: 64,
            display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center',
            paddingBottom: 8,
          }}
        >
          {stats.map(s => (
            <div
              key={s.value}
              style={{
                padding: '14px 28px', borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', fontFamily: MONO }}>{s.value}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.08em', marginTop: 1 }}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{ position: 'absolute', bottom: 28, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.28)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES section
      ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0a1628 0%, #081220 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section heading */}
          <FadeInSection className="text-center" style={{ marginBottom: 56 } as any}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{
                display: 'inline-block', marginBottom: 14,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#3cb371', fontWeight: 700,
              }}>
                Core Capabilities
              </span>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800,
                color: '#ffffff', marginBottom: 14, lineHeight: 1.15,
              }}>
                Everything you need to protect<br />
                <span style={{
                  backgroundImage: 'linear-gradient(135deg, #7ec8e3, #3cb371)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  critical ecosystems
                </span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Comprehensive ecosystem monitoring powered by machine learning and advanced statistical analysis.
              </p>
            </div>
          </FadeInSection>

          {/* Feature cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 0.10}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${f.accentBorder}`,
                    borderRadius: 16,
                    padding: 26,
                    overflow: 'hidden',
                    boxShadow: `0 4px 24px ${f.accentGlow}`,
                    cursor: 'default',
                  }}
                >
                  {/* Colored top border accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
                    background: f.topBorder,
                    boxShadow: `0 0 12px 2px ${f.accentGlow}`,
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                    background: f.accentDim,
                    border: `1px solid ${f.accentBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 18px ${f.accentGlow}`,
                  }}>
                    <f.Icon size={22} style={{ color: f.accent }} />
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', background: '#081220' }}>
        <FadeInSection>
          <div style={{
            maxWidth: 720, margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(30,95,142,0.22), rgba(46,139,87,0.18))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 24, padding: '52px 40px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.35)',
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#3cb371', fontWeight: 700, marginBottom: 16,
            }}>
              Get Started
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginBottom: 14, lineHeight: 1.2 }}>
              Ready to monitor your ecosystem?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.52)', marginBottom: 32, lineHeight: 1.65 }}>
              Open the interactive dashboard to explore live stability scores, early warning signals,
              and what-if simulation tools for any of our five monitored ecosystems.
            </p>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '15px 36px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #1a5c38, #1e5f8e)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 28px rgba(26,92,56,0.5)',
                }}
              >
                <BarChart3 size={17} />
                Open Dashboard
              </motion.div>
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '28px 24px', textAlign: 'center',
        background: '#081220',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, #1e5f8e, #2e8b57)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Waves size={12} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
            EcoSentinel
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, letterSpacing: '0.04em' }}>
          Ecosystem Stability Lab • Research Preview v1.0.0-beta • {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;