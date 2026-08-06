import { useState, useEffect } from 'react';
import { chakraData, adaptiveColors, getChakraData } from '@/data/chakraData';
import { playSolfeggioTone, stopSolfeggioTone } from '@/utils/audio';
import ChakraHero from '@/components/visuals/ChakraHero';
import AudioVisualCard from '@/components/common/AudioVisualCard';
import HealingButton from '@/components/common/HealingButton';

const chakraGradients = {
  root: 'from-red-900/60 via-[#06060C] to-[#06060C]',
  sacral: 'from-orange-900/60 via-[#06060C] to-[#06060C]',
  solar: 'from-amber-900/60 via-[#06060C] to-[#06060C]',
  heart: 'from-emerald-900/70 via-emerald-950/40 to-[#06060C]',
  throat: 'from-cyan-900/60 via-[#06060C] to-[#06060C]',
  thirdEye: 'from-indigo-900/60 via-[#06060C] to-[#06060C]',
  crown: 'from-purple-900/60 via-[#06060C] to-[#06060C]',
  universal: 'from-purple-900/60 via-[#06060C] to-[#06060C]',
};

const chakraInlineGradients = {
  root: 'radial-gradient(ellipse at top, rgba(153, 27, 27, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  sacral: 'radial-gradient(ellipse at top, rgba(194, 65, 12, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  solar: 'radial-gradient(ellipse at top, rgba(180, 83, 9, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  heart: 'radial-gradient(ellipse at top, rgba(6, 95, 70, 0.75) 0%, rgba(5, 46, 34, 0.45) 55%, #06060C 100%)',
  throat: 'radial-gradient(ellipse at top, rgba(22, 101, 120, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  thirdEye: 'radial-gradient(ellipse at top, rgba(49, 46, 129, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  crown: 'radial-gradient(ellipse at top, rgba(88, 28, 135, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
  universal: 'radial-gradient(ellipse at top, rgba(124, 77, 255, 0.65) 0%, rgba(6, 6, 12, 0.9) 60%, #06060C 100%)',
};

export default function HealingScreen({ currentChakra = 'heart', onBack, onChakraChange }) {
  const [selectedId, setSelectedId] = useState(currentChakra);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHealingActive, setIsHealingActive] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (currentChakra) setSelectedId(currentChakra);
  }, [currentChakra]);

  const activeChakra = getChakraData(selectedId);
  const activeColor = adaptiveColors[selectedId] || activeChakra?.color || '#00FF66';
  const activeGradient = chakraInlineGradients[selectedId] || chakraInlineGradients.heart;
  const gradientClasses = chakraGradients[selectedId] || chakraGradients.heart;

  useEffect(() => {
    if (isPlaying) {
      playSolfeggioTone(activeChakra.frequencyNumber || 528);
    } else {
      stopSolfeggioTone();
    }
    return () => stopSolfeggioTone();
  }, [isPlaying, activeChakra]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setShowSelector(false);
    if (onChakraChange) onChakraChange(id);
  };

  const handleBegin = () => {
    setIsHealingActive(true);
    setIsPlaying(true);
    playSolfeggioTone(activeChakra.frequencyNumber || 528);
    setTimeout(() => setIsHealingActive(false), 8000);
  };

  return (
    <div
      className={`w-full relative text-white font-sans select-none transition-all duration-1000 p-6 rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${gradientClasses}`}
      style={{
        background: activeGradient,
        boxShadow: isPlaying 
          ? `inset 0 0 60px ${activeColor}88, 0 0 80px ${activeColor}33` 
          : 'none',
      }}
    >
      {/* Selector Navigation Bar with z-[100] */}
      <div className="w-full flex items-center justify-between backdrop-blur-md bg-black/40 border border-white/20 p-4 rounded-2xl mb-8 shadow-xl relative z-[100]">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 border border-white/30 flex items-center gap-2 text-white font-bold text-xs transition-all shadow-md cursor-pointer font-['Poppins']"
        >
          <span>← Back to Intro</span>
        </button>

        {/* Dropdown Container with relative z-[100] */}
        <div className="relative z-[100]">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/30 backdrop-blur-md shadow-lg text-xs font-extrabold text-white cursor-pointer font-['Poppins']"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: activeColor }} />
            <span>{activeChakra.name}</span>
            <span className="text-[10px] text-white/90">▼</span>
          </button>

          {/* Open Dropdown Overlay with z-[100] floating OVER all cards */}
          {showSelector && (
            <div className="absolute right-0 top-12 w-64 p-2.5 rounded-2xl bg-black/95 backdrop-blur-2xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[100] space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold text-slate-300 border-b border-white/15 mb-1 font-['Poppins']">
                Select Energy Center
              </div>

              {/* Inner List Element with max-h-[220px], overflow-y-auto, pointer-events-auto & subtle scrollbar */}
              <div className="max-h-[220px] overflow-y-auto pointer-events-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-1 pr-1">
                {chakraData.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      item.id === activeChakra.id ? 'bg-white/30 text-white font-bold' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full border border-white/40 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: adaptiveColors[item.id] || item.color }} />
                      <span className="font-['Poppins']">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono font-bold">{item.frequency}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Desktop Widescreen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        {/* Left Column: 3D Mandala & Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <ChakraHero chakra={{ ...activeChakra, color: activeColor }} isPlaying={isPlaying} />

          <section className="space-y-2 max-w-md">
            <div 
              className="text-xs font-extrabold tracking-widest text-purple-300 uppercase font-['Poppins']"
            >
              <span>Heal Me Quickly Solfeggio Therapy</span>
            </div>
            <h1 
              className="text-4xl font-black tracking-tight text-white drop-shadow-md font-['Poppins']"
            >
              {activeChakra.name}
            </h1>
            <p 
              className="text-xs font-extrabold uppercase tracking-wider text-amber-300 font-['Poppins']"
            >
              {activeChakra.sanskrit} • Solfeggio Resonance
            </p>

            <p 
              className="text-sm text-gray-200 leading-relaxed pt-2 font-medium font-['Poppins']"
            >
              {activeChakra.description}
            </p>
          </section>

          <div className="w-full max-w-md">
            <HealingButton
              chakra={{ ...activeChakra, color: activeColor }}
              onClick={handleBegin}
              isHealing={isHealingActive}
            />
          </div>
        </div>

        {/* Right Column: Audio-Visual Control Suite */}
        <div className="flex flex-col space-y-6">
          <AudioVisualCard
            chakra={{ ...activeChakra, color: activeColor }}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        </div>

      </div>

    </div>
  );
}
