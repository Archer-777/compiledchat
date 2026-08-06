import React from 'react';
import { motion } from 'framer-motion';

export default function SacredGeometryOrb({ size = 260, logoUrl = '/logo.png', interactive = true }) {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer Ethereal Glow */}
      <div 
        className="absolute inset-0 rounded-full bg-white/5 blur-3xl animate-pulse-slow pointer-events-none" 
      />

      {/* Outer Rotating Sacred Geometry Ring 1 */}
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 w-full h-full text-white/20"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {/* 12 point sacred star markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 100 + 88 * Math.cos(angle);
          const y1 = 100 + 88 * Math.sin(angle);
          const x2 = 100 + 94 * Math.cos(angle);
          const y2 = 100 + 94 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />;
        })}
      </motion.svg>

      {/* Reverse Rotating Sacred Geometry Ring 2 */}
      <motion.svg
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[80%] h-[80%] text-white/30"
        viewBox="0 0 200 200"
      >
        {/* Octagram / Metatron triangle lines */}
        <polygon points="100,10 163,163 37,163" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <polygon points="100,190 163,37 37,37" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 4" />
      </motion.svg>

      {/* Breathing Center Ring */}
      <motion.div
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[60%] h-[60%] rounded-full border border-white/40 glass-panel flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)]"
      >
        {/* Inner SVG Sacred Flower of Life snippet */}
        <svg className="absolute inset-0 w-full h-full text-white/20" viewBox="0 0 100 100">
          <circle cx="50" cy="35" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="65" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="35" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="65" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Center Next Archer Logo */}
        <motion.div 
          whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 15px rgba(255,255,255,0.9))" }}
          className="relative z-10 p-3 flex flex-col items-center justify-center cursor-pointer"
        >
          <img 
            src={logoUrl} 
            alt="Next Archer Logo" 
            className="w-16 h-auto object-contain filter invert contrast-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            onError={(e) => {
              // Fallback text logo if image loading is delayed
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="hidden font-mono text-sm font-bold tracking-widest text-white">
            &gt;&gt; &lt;]&gt;
          </span>
        </motion.div>
      </motion.div>

      {/* Floating Sparkles around orb */}
      <motion.div
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-3 right-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]"
      />
      <motion.div
        animate={{ opacity: [0.8, 0.2, 0.8] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-white/80 shadow-[0_0_10px_#fff]"
      />
    </div>
  );
}
