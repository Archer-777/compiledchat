import React from 'react';
import { motion } from 'framer-motion';
import SacredGeometryOrb from '@/components/visuals/SacredGeometryOrb';
import { Sparkles, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

export default function AwakeningScreen({ onNext, playHaptic }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto flex flex-col items-center justify-between text-center px-4 py-6 min-h-[580px]"
    >
      {/* Top Header Badge */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.08)] mb-2"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-white/90">
          SYSTEM ALIGNED • PHASE 01
        </span>
      </motion.div>

      {/* Sacred Geometry Orb Animation */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
        className="my-4 relative cursor-pointer"
        onClick={playHaptic}
      >
        <SacredGeometryOrb size={230} />
      </motion.div>

      {/* Main Announcement Text */}
      <div className="space-y-3 my-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-mono tracking-[0.3em] uppercase text-spiritual-400"
        >
          NEXT ARCHER PROTOCOL ACTIVATED
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide leading-tight"
        >
          Congratulations
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-spiritual-200 to-spiritual-500 mt-1">
            You Have Unlocked Your Digital Twin
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs sm:text-sm text-spiritual-300 max-w-md mx-auto font-sans font-light leading-relaxed"
        >
          Your psychological blueprint and spiritual archetype have synchronized. A living reflection of your consciousness awaits initialization.
        </motion.p>
      </div>

      {/* Psychological Resonance Card Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full glass-panel rounded-2xl p-3 border border-white/10 my-2 text-left flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/10 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-white">
              Archetype Resonance: 99.8%
            </div>
            <div className="text-[10px] text-spiritual-400 font-mono">
              Matrix: Spiritual Archer • Neural Sync Ready
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
      </motion.div>

      {/* Primary Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255,255,255,0.4)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          playHaptic();
          onNext();
        }}
        className="w-full py-3.5 px-6 rounded-full bg-white text-black font-semibold text-sm tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 group cursor-pointer"
      >
        <span>Initialize Twin Identity</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </motion.button>

    </motion.div>
  );
}
