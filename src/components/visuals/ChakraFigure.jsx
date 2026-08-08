import React from 'react';
import { motion } from 'framer-motion';
import soulMatrixImg from '@/assets/soulmatrix.png';

const CHAKRA_DEFS = [
  { key: 'crown', label: 'Crown', color: '#d946ef', glowColor: 'rgba(217,70,239,0.85)', cyPercent: 21 },
  { key: 'third_eye', label: 'Third Eye', color: '#6366f1', glowColor: 'rgba(99,102,241,0.85)', cyPercent: 29 },
  { key: 'throat', label: 'Throat', color: '#06b6d4', glowColor: 'rgba(6,182,212,0.85)', cyPercent: 37 },
  { key: 'heart', label: 'Heart', color: '#22c55e', glowColor: 'rgba(34,197,94,0.85)', cyPercent: 47 },
  { key: 'solar_plexus', label: 'Solar Plexus', color: '#eab308', glowColor: 'rgba(234,179,8,0.85)', cyPercent: 57 },
  { key: 'sacral', label: 'Sacral', color: '#f97316', glowColor: 'rgba(249,115,22,0.85)', cyPercent: 66 },
  { key: 'root', label: 'Root', color: '#ef4444', glowColor: 'rgba(239,68,68,0.85)', cyPercent: 74 },
];

export default function ChakraFigure({ chakras }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl flex flex-col items-center justify-center group"
        style={{
          background: 'linear-gradient(160deg, #070314 0%, #15082e 100%)',
          boxShadow: '0 0 35px rgba(139,92,246,0.15)',
        }}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center">
          <img
            src={soulMatrixImg}
            alt="Soul Matrix Energy Figure"
            className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(7,3,20,0.65) 100%)',
            }}
          />

          <svg
            viewBox="0 0 200 150"
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Universal Energy – Chakra Node Overlays"
          >
            <defs>
              <filter id="chakra-node-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CHAKRA_DEFS.map((c) => {
              const raw = chakras?.[c.key] ?? 75;
              const norm = Math.max(0, Math.min(100, raw)) / 100;
              const r = 3.5 + norm * 2.0;
              const cy = (c.cyPercent / 100) * 150;
              const alpha = 0.6 + norm * 0.4;

              return (
                <g key={c.key} aria-label={`${c.label}: ${raw}%`}>
                  <motion.circle
                    cx={100}
                    cy={cy}
                    r={r + 3}
                    fill="transparent"
                    stroke={c.color}
                    strokeWidth={1.2}
                    strokeOpacity={alpha * 0.5}
                    animate={{
                      r: [r + 2, r + 6, r + 2],
                      strokeOpacity: [alpha * 0.3, alpha * 0.8, alpha * 0.3],
                    }}
                    transition={{
                      duration: 2.2 + (1 - norm) * 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  <circle
                    cx={100}
                    cy={cy}
                    r={r}
                    fill={c.color}
                    fillOpacity={alpha}
                    filter="url(#chakra-node-glow)"
                    style={{
                      boxShadow: `0 0 12px ${c.glowColor}`,
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <p className="py-3 text-center text-xs font-semibold tracking-[0.3em] text-cyan-400/90 uppercase border-t border-white/5 w-full bg-black/40 backdrop-blur-md">
          UNIVERSAL ENERGY
        </p>
      </div>
    </div>
  );
}
