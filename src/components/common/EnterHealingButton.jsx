import React from 'react';

export default function EnterHealingButton({ onClick }) {
  return (
    <div 
      className="relative group w-full max-w-sm mx-auto my-4 flex items-center justify-center text-center" 
    >
      {/* Orbit Container strictly hugging the button */}
      <div 
        className="absolute w-[112%] h-[95px] pointer-events-none z-0 flex items-center justify-center"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Track 1: Cyan Energy Track */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            transform: 'rotateX(72deg) rotateZ(-22deg)',
            willChange: 'transform',
          }}
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
            <defs>
              <linearGradient id="cyanBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f3ff" stopOpacity="1" />
                <stop offset="60%" stopColor="#00f3ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="180" cy="50" rx="170" ry="42" fill="none" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1.5" />
            <ellipse cx="180" cy="50" rx="170" ry="42" fill="none" stroke="url(#cyanBeamGrad)" strokeWidth="3" strokeDasharray="110 630" strokeLinecap="round" className="travel-beam-1" />
          </svg>
        </div>

        {/* Track 2: Purple / Magenta Energy Track */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            transform: 'rotateX(64deg) rotateZ(32deg)',
            willChange: 'transform',
          }}
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
            <defs>
              <linearGradient id="purpleBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" stopOpacity="1" />
                <stop offset="60%" stopColor="#c084fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="180" cy="50" rx="172" ry="44" fill="none" stroke="rgba(192, 132, 252, 0.2)" strokeWidth="1.5" />
            <ellipse cx="180" cy="50" rx="172" ry="44" fill="none" stroke="url(#purpleBeamGrad)" strokeWidth="3" strokeDasharray="95 645" strokeLinecap="round" className="travel-beam-2" />
          </svg>
        </div>

        {/* Track 3: White / Gold Energy Track */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            transform: 'rotateX(78deg) rotateZ(6deg)',
            willChange: 'transform',
          }}
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
            <defs>
              <linearGradient id="whiteBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="60%" stopColor="#e0e7ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="180" cy="50" rx="165" ry="40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
            <ellipse cx="180" cy="50" rx="165" ry="40" fill="none" stroke="url(#whiteBeamGrad)" strokeWidth="2.5" strokeDasharray="85 640" strokeLinecap="round" className="travel-beam-3" />
          </svg>
        </div>
      </div>

      {/* Main Glassmorphism Button Body */}
      <button
        onClick={onClick}
        className="relative w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#130b2c]/90 via-[#27154d]/90 to-[#130b2c]/90 border border-white/80 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.4),inset_0_0_15px_rgba(255,255,255,0.25)] flex items-center justify-center gap-3 text-white font-bold tracking-tight text-xs sm:text-sm uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_35px_rgba(192,132,252,0.6),inset_0_0_20px_rgba(255,255,255,0.4)] cursor-pointer font-['Poppins']"
      >
        {/* Left Side Cosmic Orbital Sparkle Icon */}
        <div className="flex-shrink-0 flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_#00f3ff]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-28 12 12)" stroke="#a855f7" strokeWidth="1.5" />
            <path d="M12 4l1 2.5L15.5 7.5 13 8.5 12 11l-1-2.5L8.5 7.5 11 6.5z" fill="#ffffff" stroke="none" />
          </svg>
        </div>

        {/* Button Text with Poppins bold tracking-tight */}
        <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-tight text-white font-bold font-['Poppins']">
          ENTER HEALING EXPERIENCE
        </span>
      </button>
    </div>
  );
}
