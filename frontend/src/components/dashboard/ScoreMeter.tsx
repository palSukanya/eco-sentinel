import { motion } from 'framer-motion';

interface ScoreMeterProps {
  score: number;
  maxScore?: number;
  label: string;
  size?: number;
  colorClass?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolve hex arc colour based on meter type and percentage */
function resolveColor(percentage: number, isStability: boolean, colorClass?: string): string {
  // colorClass override (legacy support — caller passes a hex or CSS colour)
  if (colorClass) return colorClass;

  if (isStability) {
    // Higher score = better
    if (percentage >= 70) return '#22c55e';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  } else {
    // Risk / default: lower score = better (inverted)
    if (percentage <= 40) return '#22c55e';
    if (percentage <= 70) return '#f59e0b';
    return '#ef4444';
  }
}

/** Derive a short category label from percentage + meter type */
function resolveCategory(percentage: number, isStability: boolean): { text: string; color: string; bg: string; border: string } {
  if (isStability) {
    if (percentage >= 70) return { text: 'Stable',    color: '#4ade80', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)'  };
    if (percentage >= 40) return { text: 'Vulnerable',color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' };
    return                       { text: 'Critical',  color: '#f87171', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)'  };
  } else {
    if (percentage <= 40) return { text: 'Low Risk',  color: '#4ade80', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)'  };
    if (percentage <= 70) return { text: 'Moderate',  color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' };
    return                       { text: 'High Risk', color: '#f87171', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)'  };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const ScoreMeter = ({ score, maxScore = 100, label, size = 200, colorClass }: ScoreMeterProps) => {
  const percentage  = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const isStability = label.toLowerCase().includes('stability');
  const isCritical  = isStability ? percentage < 40 : percentage > 70;

  const arcColor  = resolveColor(percentage, isStability, colorClass);
  const category  = resolveCategory(percentage, isStability);

  // Arc geometry
  const cx          = size / 2;
  const cy          = size / 2;
  const arcRadius   = (size - 24) / 2;   // main arc
  const trackRadius = arcRadius;          // same path, track behind arc
  const innerRing   = arcRadius - 20;     // decorative inner ring
  const circumference = 2 * Math.PI * arcRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Tick marks — 10 evenly spaced, drawn outside the main arc
  const tickCount   = 10;
  const tickOuter   = arcRadius + 10;
  const tickInner   = arcRadius + 4;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x1: cx + tickOuter * Math.cos(angle),
      y1: cy + tickOuter * Math.sin(angle),
      x2: cx + tickInner * Math.cos(angle),
      y2: cy + tickInner * Math.sin(angle),
    };
  });

  // Colour-range bar below circle
  const barWidth    = 120;
  const markerLeft  = (percentage / 100) * barWidth;

  return (
    <>
      <style>{`
        @keyframes arc-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        .arc-critical { animation: arc-pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col items-center select-none">

        {/* ── SVG circle ── */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            <defs>
              {/* Radial glow filter matching arc colour */}
              <filter id={`glow-${label.replace(/\s+/g, '')}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glow halo — wide blurry arc at 20% opacity */}
            <circle
              cx={cx}
              cy={cy}
              r={arcRadius}
              fill="none"
              stroke={arcColor}
              strokeWidth={28}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              opacity={0.18}
              style={{ filter: `blur(8px)` }}
            />

            {/* Decorative inner ring */}
            <circle
              cx={cx}
              cy={cy}
              r={innerRing}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              opacity={0.08}
            />

            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={trackRadius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={10}
            />

            {/* Tick marks */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1} y1={t.y1}
                x2={t.x2} y2={t.y2}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            ))}

            {/* Main arc — Framer Motion animates strokeDashoffset on mount */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={arcRadius}
              fill="none"
              stroke={arcColor}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
              filter={`url(#glow-${label.replace(/\s+/g, '')})`}
              className={isCritical ? 'arc-critical' : ''}
            />
          </svg>

          {/* ── Center overlay ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="tabular-nums font-bold leading-none"
              style={{
                fontSize: '36px',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", "Fira Mono", monospace',
              }}
            >
              {score}
            </span>
            <span
              className="mt-0.5"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
            >
              /{maxScore}
            </span>

            {/* Category badge */}
            <span
              className="mt-2 px-2 py-0.5 rounded-full font-semibold"
              style={{
                fontSize: '10px',
                letterSpacing: '0.08em',
                background: category.bg,
                color: category.color,
                border: `1px solid ${category.border}`,
              }}
            >
              {category.text}
            </span>
          </div>
        </div>

        {/* ── Label ── */}
        <span
          className="mt-3 font-semibold uppercase"
          style={{
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {label}
        </span>

        {/* ── Colour-range bar ── */}
        <div className="mt-3 relative" style={{ width: barWidth, height: 6 }}>
          {/* Gradient track: green → amber → red (or inverted for stability) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isStability
                ? 'linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #22c55e 100%)'
                : 'linear-gradient(90deg, #22c55e 0%, #f59e0b 55%, #ef4444 100%)',
              opacity: 0.75,
            }}
          />

          {/* Position marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 10,
              height: 10,
              background: arcColor,
              border: '2px solid rgba(255,255,255,0.85)',
              boxShadow: `0 0 6px 2px ${arcColor}55`,
              left: markerLeft - 5,      // centre the 10px dot
            }}
            initial={{ left: -5 }}
            animate={{ left: markerLeft - 5 }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
          />
        </div>

      </div>
    </>
  );
};

export default ScoreMeter;