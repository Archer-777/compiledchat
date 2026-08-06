import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import SacredGeometryOrb from '@/components/visuals/SacredGeometryOrb';
import { Upload, ArrowRight, Image as ImageIcon, Check } from 'lucide-react';

export default function UnifiedSetupScreen({
  twinName,
  setTwinName,
  avatarImage,
  setAvatarImage,
  filterMode,
  setFilterMode,
  overlayPattern,
  setOverlayPattern,
  auraIntensity,
  setAuraIntensity,
  onUnlock,
  playHaptic
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      playHaptic();
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilterClass = () => {
    switch (filterMode) {
      case 'dramatic': return 'filter-bw-dramatic';
      case 'ethereal': return 'filter-bw-ethereal';
      case 'mystic': return 'filter-bw-mystic';
      default: return 'grayscale(100%)';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto flex flex-col justify-start text-left px-3 py-2 space-y-3"
    >
      {/* ================= SECTION 1: AWAKENING REVEAL ================= */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-[10px] tracking-wider uppercase font-medium text-white/90">
            NEXT ARCHER PROTOCOL
          </span>
        </div>

        {/* Compact Sacred Geometry Orb */}
        <div className="flex justify-center my-1 cursor-pointer" onClick={playHaptic}>
          <SacredGeometryOrb size={120} />
        </div>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
          Congratulations!
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-spiritual-200 to-spiritual-400">
            You Have Unlocked Your Digital Twin
          </span>
        </h1>
        <p className="text-[11px] text-spiritual-300 font-light max-w-xs mx-auto leading-normal">
          Name your Digital Twin and upload a gallery photo to synthesize your monochrome soul card.
        </p>
      </div>

      {/* ================= SECTION 2: NAMING YOUR TWIN ================= */}
      <div className="glass-panel p-3 rounded-xl border border-white/15 space-y-1.5">
        <label className="text-[11px] font-semibold text-white tracking-wide block">
          What should be the name of your Digital Twin?
        </label>
        <div className="relative">
          <input
            type="text"
            value={twinName}
            onChange={(e) => setTwinName(e.target.value)}
            placeholder="Type your twin's name..."
            maxLength={28}
            className="w-full px-3 py-2.5 rounded-lg bg-spiritual-900 border border-white/20 text-white placeholder-spiritual-500 focus:outline-none focus:border-white text-xs font-sans"
          />
          {twinName && (
            <div className="absolute right-2.5 top-2.5 text-[10px] text-spiritual-400">
              {twinName.length}/28
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 3: GALLERY PHOTO & AURA CUSTOMIZATION ================= */}
      <div className="glass-panel p-3 rounded-xl border border-white/15 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-semibold text-white">Add Pic From User Gallery</h3>
            <p className="text-[10px] text-spiritual-400 font-light">Upload photo & select effects</p>
          </div>
          <button
            onClick={() => {
              playHaptic();
              fileInputRef.current?.click();
            }}
            className="py-1.5 px-2.5 rounded-lg bg-white text-black font-semibold text-[10px] flex items-center space-x-1 hover:bg-spiritual-100 transition-all cursor-pointer shadow"
          >
            <Upload className="w-3 h-3" />
            <span>Upload Photo</span>
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Live Photo & Aura Ring Preview */}
        <div className="flex items-center space-x-3 pt-0.5">
          <div className="relative w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center bg-black flex-shrink-0 group overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            
            {/* Animated Ring Overlay */}
            <div 
              className="absolute inset-0 border border-white/40 rounded-full animate-pulse-slow pointer-events-none z-20"
              style={{ opacity: auraIntensity / 100 }}
            />

            {/* Sacred Geometry SVG */}
            <svg className="absolute inset-0 w-full h-full text-white/40 z-20 pointer-events-none" viewBox="0 0 100 100">
              {overlayPattern === 'halo' && (
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
              )}
              {overlayPattern === 'grid' && (
                <polygon points="50,4 96,50 50,96 4,50" fill="none" stroke="currentColor" strokeWidth="0.75" />
              )}
              {overlayPattern === 'matrix' && (
                <>
                  <polygon points="50,6 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="0.75" />
                  <polygon points="50,94 90,15 10,15" fill="none" stroke="currentColor" strokeWidth="0.75" />
                </>
              )}
            </svg>

            {avatarImage ? (
              <img 
                src={avatarImage} 
                alt="Digital Twin Avatar" 
                className={`w-full h-full object-cover ${getFilterClass()}`} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-1">
                <ImageIcon className="w-5 h-5 text-spiritual-500 mb-0.5" />
                <span className="text-[8px] text-spiritual-400">No Photo</span>
              </div>
            )}
          </div>

          {/* Effect & Overlay Toggles */}
          <div className="flex-1 space-y-1.5">
            <div>
              <span className="text-[9px] text-spiritual-400 uppercase tracking-wider block mb-0.5">
                B&W Filter:
              </span>
              <div className="flex space-x-1">
                {[
                  { id: 'dramatic', label: 'Dramatic' },
                  { id: 'ethereal', label: 'Ethereal' },
                  { id: 'mystic', label: 'Noir' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      playHaptic();
                      setFilterMode(f.id);
                    }}
                    className={`flex-1 py-0.5 px-1 rounded text-[9px] font-medium border transition-all ${
                      filterMode === f.id ? 'bg-white text-black border-white font-bold' : 'border-white/10 text-spiritual-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] text-spiritual-400 uppercase tracking-wider block mb-0.5">
                Sacred Ring:
              </span>
              <div className="flex space-x-1">
                {[
                  { id: 'halo', label: 'Halo' },
                  { id: 'grid', label: 'Grid' },
                  { id: 'matrix', label: 'Matrix' }
                ].map((ov) => (
                  <button
                    key={ov.id}
                    onClick={() => {
                      playHaptic();
                      setOverlayPattern(ov.id);
                    }}
                    className={`flex-1 py-0.5 px-1 rounded text-[9px] font-medium border transition-all ${
                      overlayPattern === ov.id ? 'bg-white text-black border-white font-bold' : 'border-white/10 text-spiritual-300 hover:text-white'
                    }`}
                  >
                    {ov.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Aura Slider */}
        <div className="space-y-0.5 pt-0.5">
          <div className="flex justify-between text-[9px] text-spiritual-400">
            <span>Aura Glow Intensity</span>
            <span className="text-white font-semibold">{auraIntensity}%</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            value={auraIntensity}
            onChange={(e) => setAuraIntensity(Number(e.target.value))}
            className="w-full accent-white bg-spiritual-800 rounded-lg cursor-pointer h-1"
          />
        </div>
      </div>

      {/* ================= UNLOCK BUTTON ================= */}
      <motion.button
        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          playHaptic();
          onUnlock();
        }}
        className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 group cursor-pointer hover:bg-spiritual-100 transition-colors mt-1"
      >
        <span>Synthesize & View Soul Card</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </motion.button>

    </motion.div>
  );
}
