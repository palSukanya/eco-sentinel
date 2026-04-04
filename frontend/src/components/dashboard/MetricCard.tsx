import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'Stable' | 'Vulnerable' | 'High Risk' | 'Critical' | 'Low Risk' | 'Safe' | 'Warning';
  delay?: number;
}

// ── Per-status design tokens ──────────────────────────────────────────────────
const statusConfig: Record<
  string,
  {
    borderColor: string;   // left accent bar
    glowColor: string;     // hover box-shadow
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    hoverBorder: string;   // brighter card border on hover
  }
> = {
  Stable: {
    borderColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeText: '#34d399',
    badgeBorder: 'rgba(16,185,129,0.4)',
    hoverBorder: 'rgba(16,185,129,0.55)',
  },
  Safe: {
    borderColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeText: '#34d399',
    badgeBorder: 'rgba(16,185,129,0.4)',
    hoverBorder: 'rgba(16,185,129,0.55)',
  },
  'Low Risk': {
    borderColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeText: '#34d399',
    badgeBorder: 'rgba(16,185,129,0.4)',
    hoverBorder: 'rgba(16,185,129,0.55)',
  },
  Vulnerable: {
    borderColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.25)',
    badgeBg: 'rgba(245,158,11,0.15)',
    badgeText: '#fbbf24',
    badgeBorder: 'rgba(245,158,11,0.4)',
    hoverBorder: 'rgba(245,158,11,0.55)',
  },
  Warning: {
    borderColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.25)',
    badgeBg: 'rgba(245,158,11,0.15)',
    badgeText: '#fbbf24',
    badgeBorder: 'rgba(245,158,11,0.4)',
    hoverBorder: 'rgba(245,158,11,0.55)',
  },
  'High Risk': {
    borderColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.25)',
    badgeBg: 'rgba(249,115,22,0.15)',
    badgeText: '#fb923c',
    badgeBorder: 'rgba(249,115,22,0.4)',
    hoverBorder: 'rgba(249,115,22,0.55)',
  },
  Critical: {
    borderColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.28)',
    badgeBg: 'rgba(239,68,68,0.15)',
    badgeText: '#f87171',
    badgeBorder: 'rgba(239,68,68,0.4)',
    hoverBorder: 'rgba(239,68,68,0.55)',
  },
};

const fallbackConfig = {
  borderColor: 'rgba(255,255,255,0.18)',
  glowColor: 'rgba(255,255,255,0.08)',
  badgeBg: 'rgba(255,255,255,0.08)',
  badgeText: 'rgba(255,255,255,0.6)',
  badgeBorder: 'rgba(255,255,255,0.15)',
  hoverBorder: 'rgba(255,255,255,0.28)',
};

// ── Component ─────────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, unit, trend = 'stable', status, delay = 0 }: MetricCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? '#10b981'
      : trend === 'down'
      ? '#ef4444'
      : 'rgba(255,255,255,0.4)';

  const cfg = status ? (statusConfig[status] ?? fallbackConfig) : fallbackConfig;

  return (
    <>
      {/* Scoped keyframes — injected once per card render, deduplicated by browser */}
      <style>{`
        @keyframes pulse-trend {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.88); }
        }
        .trend-pulse { animation: pulse-trend 1.4s ease-in-out infinite; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.2, 0, 0, 1] }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative overflow-hidden flex flex-col p-6 cursor-default"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          borderLeft: `4px solid ${cfg.borderColor}`,
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = cfg.hoverBorder;
          el.style.boxShadow = `0 8px 32px ${cfg.glowColor}, 0 0 0 1px ${cfg.hoverBorder}`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'rgba(255,255,255,0.12)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Header row: label + trend icon */}
        <div className="flex justify-between items-start mb-4">
          <h3
            className="font-semibold uppercase"
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {title}
          </h3>

          {/* Trend icon — pulses when trend === 'down' */}
          <TrendIcon
            size={16}
            className={trend === 'down' ? 'trend-pulse' : ''}
            style={{ color: trendColor, flexShrink: 0 }}
          />
        </div>

        {/* Metric value */}
        <div className="flex items-baseline space-x-2 mb-4">
          <span
            className="tabular-nums font-bold leading-none"
            style={{
              fontSize: '40px',
              color: '#ffffff',
              fontFamily: '"JetBrains Mono", "Fira Mono", "Cascadia Code", monospace',
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="font-medium"
              style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Status badge */}
        {status && (
          <div className="mt-auto">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: cfg.badgeBg,
                color: cfg.badgeText,
                border: `1px solid ${cfg.badgeBorder}`,
              }}
            >
              {status}
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default MetricCard;