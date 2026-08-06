import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, Sliders, Sparkles, ArrowRight, ArrowLeft, RefreshCw, Check } from 'lucide-react';

export default function AvatarScreen({
  avatarImage,
  setAvatarImage,
  filterMode,
  setFilterMode,
  overlayPattern,
  setOverlayPattern,
  auraIntensity,
  setAuraIntensity,
  onNext,
  onBack,
  playHaptic
}) {
  const fileInputRef = useRef(null);

  // Preset Spiritual Avatars if user doesn't pick gallery image immediately
  const presets = [
    { id: 'archer', name: 'Spiritual Archer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { id: 'monk', name: 'Ethereal Soul', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { id: 'oracle', name: 'Cyber Oracle', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { id: 'sage', name: 'Cosmic Sage', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' }
  ];

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto flex flex-col justify-between text-left px-4 py-4 min-h-[580px]"
    >
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-spiritual-400 uppercase mb-1">
          <span>PHASE 03 OF 04</span>
          <span>•</span>
          <span className="text-white">GALLERY & AURA SYNTHESIS</span>
        </div>

        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Upload Gallery Pic & Sacred Aura
        </h2>
        <p className="text-xs text-spiritual-300 font-light mt-0.5">
          Select a photo from your gallery or choose a spiritual archetype preset to synthesize into black & white sacred geometry.
        </p>
      </div>

      {/* Main Preview Frame with Sacred Geometry Overlay */}
      <div className="my-3 flex items-center justify-center">
        <div className="relative w-44 h-44 rounded-full p-1 border-2 border-white/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] group">
          
          {/* Animated Aura Glow Ring */}
          <div 
            className="absolute -inset-2 rounded-full border border-white/20 animate-pulse-slow pointer-events-none" 
            style={{ opacity: auraIntensity / 100 }}
          />

          {/* Sacred Geometry SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full text-white/40 z-20 pointer-events-none" viewBox="0 0 100 100">
            {overlayPattern === 'halo' && (
              <>
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </>
            )}
            {overlayPattern === 'grid' && (
              <>
                <polygon points="50,2 98,50 50,98 2,50" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
              </>
            )}
            {overlayPattern === 'matrix' && (
              <>
                <polygon points="50,5 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <polygon points="50,95 90,15 10,15" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </>
            )}
          </svg>

          {/* Avatar Image Container */}
          <div className="w-full h-full rounded-full overflow-hidden bg-black relative z-10 flex items-center justify-center">
            {avatarImage ? (
              <img 
                src={avatarImage} 
                alt="Digital Twin Avatar"
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="w-8 h-8 text-spiritual-500 mb-1 animate-bounce" />
                <span className="text-[10px] font-mono text-spiritual-400">No Image Selected</span>
              </div>
            )}
          </div>

          {/* Next Archer Seal Badge Overlay */}
          <div className="absolute -bottom-1 -right-1 z-30 p-1.5 rounded-full border border-white/40 bg-black shadow-lg">
            <img src="/logo.png" alt="Next Archer" className="w-5 h-auto filter invert" />
          </div>
        </div>
      </div>

      {/* Gallery File Upload Button */}
      <div className="space-y-2">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => {
            playHaptic();
            fileInputRef.current?.click();
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-white/30 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <Upload className="w-4 h-4 text-white" />
          <span>Upload Photo From Gallery</span>
        </button>

        {/* Preset Archetype Avatars */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-[10px] font-mono text-spiritual-400 uppercase">Or Presets:</span>
          <div className="flex space-x-2 overflow-x-auto py-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  playHaptic();
                  setAvatarImage(preset.url);
                }}
                className={`w-8 h-8 rounded-full border overflow-hidden flex-shrink-0 transition-transform hover:scale-110 ${
                  avatarImage === preset.url ? 'ring-2 ring-white border-white' : 'border-white/20 opacity-70'
                }`}
                title={preset.name}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover filter grayscale" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Overlay Toggles */}
      <div className="grid grid-cols-2 gap-2 my-2">
        {/* B&W Filter Preset */}
        <div className="glass-panel p-2.5 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-spiritual-400 uppercase block">Monochrome Style:</span>
          <div className="flex flex-col space-y-1">
            {[
              { id: 'dramatic', label: 'Dramatic B&W' },
              { id: 'ethereal', label: 'Ethereal Glow' },
              { id: 'mystic', label: 'Deep Noir' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playHaptic();
                  setFilterMode(f.id);
                }}
                className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between ${
                  filterMode === f.id ? 'bg-white text-black font-bold' : 'text-spiritual-300 hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                {filterMode === f.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sacred Geometry Ring Overlay */}
        <div className="glass-panel p-2.5 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-spiritual-400 uppercase block">Sacred Geometry:</span>
          <div className="flex flex-col space-y-1">
            {[
              { id: 'halo', label: 'Halo Rings' },
              { id: 'grid', label: 'Metatron Grid' },
              { id: 'matrix', label: 'Dual Hex' }
            ].map((ov) => (
              <button
                key={ov.id}
                onClick={() => {
                  playHaptic();
                  setOverlayPattern(ov.id);
                }}
                className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between ${
                  overlayPattern === ov.id ? 'bg-white text-black font-bold' : 'text-spiritual-300 hover:text-white'
                }`}
              >
                <span>{ov.label}</span>
                {overlayPattern === ov.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aura Intensity Slider */}
      <div className="space-y-1 my-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-spiritual-400">
          <span>Aura Vibration Field</span>
          <span className="text-white">{auraIntensity}%</span>
        </div>
        <input 
          type="range" 
          min="20" 
          max="100" 
          value={auraIntensity}
          onChange={(e) => setAuraIntensity(Number(e.target.value))}
          className="w-full accent-white bg-spiritual-800 rounded-lg cursor-pointer h-1.5"
        />
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
            playHaptic();
            onNext();
          }}
          className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-semibold text-xs font-mono tracking-wider uppercase shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 group cursor-pointer hover:bg-spiritual-100 transition-colors"
        >
          <span>Synthesize Soul Card</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </motion.div>
  );
}
