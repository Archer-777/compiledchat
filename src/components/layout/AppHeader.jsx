import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AppHeader({
  currentStep,
  setCurrentStep,
}) {
  const navigate = useNavigate();

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

        {/* Center: Action Button to Proceed to Soul Matrix Card */}
        <div className="flex items-center space-x-2">
          {currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Proceed to Soul Matrix Card</span>
              <span className="text-sm">→</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1.5 border border-white/20 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                <span>← Back to Twin Setup</span>
              </button>
              <button
                onClick={() => navigate('/soul-matrix')}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md hover:scale-105 cursor-pointer"
              >
                <span>Proceed to Soul Matrix</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
