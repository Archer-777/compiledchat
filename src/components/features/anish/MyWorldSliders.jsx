import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SLIDER_CONFIGS = [
  { key: 'business', label: 'Business', id: 'slider-business', color: '#f87171' },
  { key: 'family', label: 'Family', id: 'slider-family', color: '#fde047' },
  { key: 'friend', label: 'Friend', id: 'slider-friend', color: '#4ade80' },
];

export default function MyWorldSliders({ initialValues, userId = 'user_001' }) {
  const [values, setValues] = React.useState({
    business: initialValues?.business ?? 0,
    family: initialValues?.family ?? 0,
    friend: initialValues?.friend ?? 0,
  });

  React.useEffect(() => {
    if (initialValues) {
      setValues({
        business: initialValues.business ?? 0,
        family: initialValues.family ?? 0,
        friend: initialValues.friend ?? 0,
      });
    }
  }, [initialValues?.business, initialValues?.family, initialValues?.friend]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-widest font-['Poppins'] flex items-center gap-2">
          <span>🌐</span> My World Balance
        </h3>
        <span className="text-[10px] text-cyan-300 font-mono">Live Telemetry</span>
      </div>

      <div className="flex flex-col gap-3">
        {SLIDER_CONFIGS.map((cfg) => {
          const val = values[cfg.key];
          return (
            <div key={cfg.key} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-medium">{cfg.label}</span>
                <span className="font-bold font-mono" style={{ color: cfg.color }}>
                  {val}%
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  id={cfg.id}
                  type="range"
                  min="0"
                  max="100"
                  value={val}
                  onChange={(e) => handleChange(cfg.key, parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
