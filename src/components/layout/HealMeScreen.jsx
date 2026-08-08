import React from 'react';
import EnterHealingButton from '@/components/common/EnterHealingButton';

export default function HealMeScreen({ onProceed }) {
  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center text-white select-none py-6">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest font-['Poppins'] shadow-md">
          <span>⚙️ Universal Energy Sanctuary</span>
        </div>

        {/* Hero Image */}
        <div 
          className="cursor-pointer flex flex-col items-center group my-2"
          onClick={() => onProceed && onProceed('universal')}
        >
          <div className="relative flex items-center justify-center p-0 group-hover:scale-105 transition-transform bg-[#06060C] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)]">
            <img
              src="/heal_me_logo.png"
              alt="Heal Me Quickly Logo"
              className="w-56 h-48 md:w-64 md:h-52 lg:w-72 lg:h-56 object-cover mix-blend-screen scale-105"
              style={{
                WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                filter: 'contrast(110%) brightness(105%)',
              }}
            />
          </div>
        </div>

        {/* Text Container */}
        <div className="space-y-3 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-['Poppins']">
            Harmonize Your Spirit & Consciousness
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal font-['Poppins']">
            It feels like your energy center could use some extra care and grounding. Experience real-time Solfeggio sound frequency therapy.
          </p>
        </div>

        {/* ENTER HEALING EXPERIENCE BUTTON */}
        <div className="w-full max-w-md mx-auto flex justify-center items-center pt-4">
          <EnterHealingButton
            onClick={() => onProceed && onProceed('heart')}
          />
        </div>

      </div>
    </div>
  );
}
