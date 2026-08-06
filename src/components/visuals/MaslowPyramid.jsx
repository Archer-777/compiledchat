import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TIERS = [
  { key: 'physiological', label: 'Physiological', shortLabel: 'Physiological' },
  { key: 'safety', label: 'Safety', shortLabel: 'Safety & Order' },
  { key: 'love_belonging', label: 'Love & Belonging', shortLabel: 'Belonging' },
  { key: 'esteem', label: 'Esteem', shortLabel: 'Self-Esteem' },
  { key: 'self_actualization', label: 'Self-Actualization', shortLabel: 'Actualization' },
];

export default function MaslowPyramid({ levels }) {
  const values = useMemo(
    () => TIERS.map((t) => ({ ...t, value: Math.max(0, Math.min(100, levels?.[t.key] ?? 50)) })),
    [levels]
  );

  return (
    <div className="flex flex-col items-center w-full pt-4">
      <div
        className="relative w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(16,10,36,0.95) 0%, rgba(10,6,26,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="relative w-full aspect-[1.75/1] -mt-5">
          <svg
            viewBox="0 0 200 150"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Consciousness Awareness Pyramid"
          >
            <defs>
              <linearGradient id="aesthetic-bar-fill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <polygon
              points="100,4 178,138 22,138"
              fill="rgba(18, 12, 40, 0.4)"
              stroke="rgba(167, 139, 250, 0.35)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            <line x1="100" y1="4" x2="100" y2="138" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" strokeDasharray="2 3" />

            {values.map((tier, i) => {
              const tierH = 20;
              const y = 115 - i * 24;

              const maxHalfW = 68 * (1 - (i * 0.17));
              const barLeft = 100 - maxHalfW;
              const fullWidth = maxHalfW * 2;
              const progressWidth = (tier.value / 100) * fullWidth;

              return (
                <g key={tier.key} aria-label={`${tier.label}: ${tier.value}%`}>
                  <rect
                    x={barLeft}
                    y={y}
                    width={fullWidth}
                    height={tierH - 4}
                    rx={3}
                    fill="rgba(255, 255, 255, 0.05)"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="0.6"
                  />

                  <motion.rect
                    x={barLeft}
                    y={y}
                    width={progressWidth}
                    height={tierH - 4}
                    rx={3}
                    fill="url(#aesthetic-bar-fill)"
                    initial={{ width: 0 }}
                    animate={{ width: progressWidth }}
                    transition={{ duration: 0.8, delay: (4 - i) * 0.1, ease: 'easeOut' }}
                  />

                  <text
                    x={100}
                    y={y + 11}
                    textAnchor="middle"
                    fontSize={fullWidth < 60 ? '7.5' : '8.5'}
                    fontWeight="600"
                    fill="rgba(240, 245, 255, 0.9)"
                    fontFamily="Inter, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {tier.shortLabel} · {tier.value}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="w-full flex items-center justify-between border-t border-white/5 pt-3 mt-1">
          <span
            className="text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: 'rgba(210, 220, 250, 0.8)', fontFamily: "'Poppins', sans-serif" }}
          >
            Consciousness Awareness
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-indigo-200/70">
            Maslow Matrix
          </span>
        </div>
      </div>
    </div>
  );
}
