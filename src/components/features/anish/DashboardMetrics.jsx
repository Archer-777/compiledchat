import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardMetrics({
  collectiveIntelligence = 40,
  globalConsciousness = 60,
  balancedThinking = 90,
}) {
  const metrics = [
    { label: 'Collective Intelligence Index', val: collectiveIntelligence, color: '#38bdf8' },
    { label: 'Global Consciousness Score', val: globalConsciousness, color: '#c084fc' },
    { label: 'Balanced Thinking Ratio', val: balancedThinking, color: '#4ade80' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-widest font-['Poppins'] flex items-center gap-2">
          <span>✨</span> Growth & Consciousness
        </h3>
        <span className="text-[10px] text-purple-300 font-mono">Real-time Metrics</span>
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">{m.label}</span>
              <span className="font-bold font-mono" style={{ color: m.color }}>
                {m.val}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: m.color }}
                initial={{ width: 0 }}
                animate={{ width: `${m.val}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
