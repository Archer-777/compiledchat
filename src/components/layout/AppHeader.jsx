import React from 'react';
import { ShieldCheck, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';

export default function AppHeader({
  currentStep,
  setCurrentStep,
  soundEnabled,
  setSoundEnabled,
  isMobileFrame,
  setIsMobileFrame
}) {
  const steps = [
    { id: 1, label: 'Twin Setup' },
    { id: 2, label: 'Soul Card' }
  ];

  return (
    <header className="w-full border-b border-white/10 glass-panel sticky top-0 z-40 backdrop-blur-xl px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => setCurrentStep(1)}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black flex items-center justify-center overflow-hidden group-hover:border-white/50 transition-colors">
            <img 
              src="/logo.png" 
              alt="Next Archer" 
              className="w-6 h-auto filter invert contrast-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs tracking-[0.2em] font-bold text-white uppercase group-hover:text-spiritual-200">
                Next Archer
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-spiritual-400" />
            </div>
            <p className="text-[10px] tracking-wider text-spiritual-400 uppercase">
              Digital Twin Synthesizer
            </p>
          </div>
        </div>

        {/* Center: Step Navigation Indicator */}
        <nav className="hidden md:flex items-center space-x-1 bg-black/60 p-1 rounded-full border border-white/10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`px-4 py-1 rounded-full text-xs transition-all duration-300 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-spiritual-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Controls & Simulator Toggles */}
        <div className="flex items-center space-x-2">
          {/* Sound / Haptic Simulation Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border transition-all ${
              soundEnabled
                ? 'border-white/40 bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                : 'border-white/10 text-spiritual-500 hover:text-white'
            }`}
            title={soundEnabled ? "Mute Ethereal Frequencies" : "Enable Ethereal Soundscape"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`p-2 rounded-full border transition-all flex items-center space-x-1 text-xs ${
              isMobileFrame
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-spiritual-400 hover:text-white'
            }`}
            title={isMobileFrame ? "Switch to Desktop View" : "Switch to Mobile View"}
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">
              {isMobileFrame ? 'Desktop' : 'App Mode'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
