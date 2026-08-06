import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Wand2, Fingerprint, Shield } from 'lucide-react';

export default function NamingScreen({ twinName, setTwinName, onNext, onBack, playHaptic }) {
  const suggestions = [
    { name: 'Aether-01', trait: 'Cosmic Intelligence' },
    { name: 'Kairos', trait: 'Master of Opportunity' },
    { name: 'Aethelgard', trait: 'Spiritual Guardian' },
    { name: 'Zephyr Mind', trait: 'Unbound Intuition' },
    { name: 'Solon Archer', trait: 'Psychological Clarity' },
    { name: 'Chronos-X', trait: 'Temporal Visionary' }
  ];

  const handleSelectSuggestion = (name) => {
    playHaptic();
    setTwinName(name);
  };

  // Generate initials for seal
  const initials = twinName
    ? twinName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'NT';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto flex flex-col justify-between text-left px-4 py-4 min-h-[580px]"
    >
      {/* Step Header */}
      <div>
        <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-spiritual-400 uppercase mb-1">
          <span>PHASE 02 OF 04</span>
          <span>•</span>
          <span className="text-white">CONSCIOUSNESS NAMING</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
          What Should Be The Name Of Your Digital Twin?
        </h2>
        <p className="text-xs text-spiritual-300 font-light mt-1">
          Give form to your psychological reflection. This title will resonate through your digital twin's neural matrix.
        </p>
      </div>

      {/* Live Monogram Seal Preview Card */}
      <motion.div 
        layout
        className="my-4 glass-panel rounded-2xl p-4 border border-white/20 bg-gradient-to-b from-spiritual-850 to-black relative overflow-hidden flex items-center space-x-4 shadow-[0_0_25px_rgba(255,255,255,0.05)]"
      >
        <div className="relative w-16 h-16 rounded-full border border-white/40 bg-black flex items-center justify-center font-serif text-xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <div className="absolute inset-0 rounded-full border stroke-dasharray border-white/20 animate-spin-slow" />
          {initials}
        </div>

        <div className="flex-1">
          <div className="text-[10px] font-mono text-spiritual-400 uppercase tracking-widest flex items-center space-x-1">
            <Fingerprint className="w-3 h-3 text-white" />
            <span>Digital Twin Designation</span>
          </div>
          <div className="text-lg font-serif font-bold text-white truncate max-w-[220px]">
            {twinName || 'Unnamed Twin'}
          </div>
          <div className="text-[11px] font-mono text-spiritual-300 flex items-center space-x-1.5 mt-0.5">
            <Shield className="w-3 h-3 text-spiritual-400" />
            <span>Archetype: Next Archer Sync Active</span>
          </div>
        </div>

        <img 
          src="/logo.png" 
          alt="Next Archer" 
          className="w-8 h-auto filter invert opacity-30 absolute top-3 right-3"
        />
      </motion.div>

      {/* Name Input Field */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-spiritual-300 uppercase tracking-wider block">
          Enter Moniker or Title
        </label>
        <div className="relative">
          <input
            type="text"
            value={twinName}
            onChange={(e) => setTwinName(e.target.value)}
            placeholder="e.g. Aethelgard, Kairos, Zephyr..."
            maxLength={28}
            className="w-full px-4 py-3.5 rounded-xl bg-spiritual-900 border border-white/20 text-white placeholder-spiritual-500 font-sans focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm shadow-inner"
          />
          <div className="absolute right-3 top-3.5 text-xs font-mono text-spiritual-500">
            {twinName.length}/28
          </div>
        </div>
      </div>

      {/* Spiritual Archetype Quick Suggestion Chips */}
      <div className="space-y-2 my-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-spiritual-400">
          <Wand2 className="w-3.5 h-3.5 text-white" />
          <span>Spiritual Archetype Suggestions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
          {suggestions.map((sug) => (
            <button
              key={sug.name}
              onClick={() => handleSelectSuggestion(sug.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                twinName === sug.name
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-white/10 bg-spiritual-900/80 text-spiritual-300 hover:border-white/30 hover:text-white'
              }`}
            >
              {sug.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onBack}
          className="py-3 px-4 rounded-xl border border-white/20 text-spiritual-300 hover:text-white hover:border-white/40 text-xs font-mono flex items-center space-x-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            if (!twinName.trim()) setTwinName('Aethelgard');
            playHaptic();
            onNext();
          }}
          className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-semibold text-xs font-mono tracking-wider uppercase shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 group cursor-pointer hover:bg-spiritual-100 transition-colors"
        >
          <span>Choose Avatar & Aura</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </motion.div>
  );
}
