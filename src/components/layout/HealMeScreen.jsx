import { useState } from 'react';
import EnterHealingButton from '@/components/common/EnterHealingButton';

export default function HealMeScreen({ onProceed, onTravel, onBack }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onProceed) onProceed(message);
  };

  const samplePrompts = [
    "I need emotional grounding and calm.",
    "Help me release stress and anxiety.",
    "Balance my Heart Chakra energy.",
    "Guide me into deep meditation.",
  ];

  return (
    <div className="w-full relative text-white flex flex-col justify-between font-sans select-none">
      
      {/* Balanced 12-Column Desktop Grid Container (max-w-7xl mx-auto px-8 gap-12) */}
      <div className="w-full grid grid-cols-12 max-w-7xl mx-auto px-8 gap-12 items-center my-auto py-6">
        
        {/* Left Panel: col-span-12 lg:col-span-6 flex flex-col justify-center items-start */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center items-start text-left space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest font-['Poppins'] shadow-md">
            <span>⚙️ Universal Energy Sanctuary</span>
          </div>

          {/* Left Hero Image (Kept EXACTLY as it is with smooth background blend) */}
          <div 
            className="cursor-pointer flex flex-col items-start group"
            onClick={() => onProceed && onProceed('universal')}
          >
            <div className="relative flex items-center justify-center p-0 group-hover:scale-105 transition-transform bg-[#06060C] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)]">
              <img
                src="/heal_me_logo.png"
                alt="Heal Me Quickly Logo"
                className="w-56 h-48 md:w-72 md:h-60 lg:w-80 lg:h-64 object-cover mix-blend-screen scale-105"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                  maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                  filter: 'contrast(110%) brightness(105%)',
                }}
              />
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            {/* Header Title in Poppins Bold, Tracking Tight */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-['Poppins']">
              Harmonize Your Spirit & Consciousness
            </h1>

            {/* Body Description in Inter Regular, 16px / 1.6 Line Height */}
            <p className="text-gray-300 text-base leading-[1.6] font-normal font-['Poppins']">
              It feels like your energy center could use some extra care and grounding. Experience real-time Solfeggio sound frequency therapy.
            </p>
          </div>

          {/* ENTER HEALING EXPERIENCE BUTTON */}
          <div className="w-full max-w-md pt-2">
            <EnterHealingButton
              onClick={() => onProceed && onProceed(message || 'heart')}
            />
          </div>

        </div>

        {/* Right Panel: col-span-12 lg:col-span-6 flex flex-col justify-center */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
          
          {/* Card Glassmorphic Container: bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.1)] */}
          <div className="flex flex-col space-y-6 bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                {/* Card Header in Poppins Bold, Tracking Tight */}
                <span className="text-sm font-bold uppercase tracking-tight text-purple-200 font-['Poppins']">
                  AI WELLNESS SANCTUARY CHAT
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">Spatial Solfeggio Ready</span>
            </div>

            {/* Prompt Suggestions */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-tight font-['Poppins']">
                Suggested Focus Prompts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessage(prompt);
                      if (onProceed) onProceed(prompt);
                    }}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer text-xs sm:text-sm text-left text-gray-200 font-normal font-['Poppins']"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Glassmorphic Message Input Box */}
            <form onSubmit={handleSubmit} className="w-full bg-[#080B26]/80 border border-white/15 rounded-2xl p-2.5 flex items-center gap-2 shadow-xl focus-within:border-purple-400 transition-all">
              <input 
                type="text" 
                placeholder="Talk about grief, anxiety, or spiritual healing..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-gray-400 flex-1 px-3 text-sm font-normal font-['Poppins']"
              />
              <button 
                type="button"
                onClick={onTravel}
                className="px-3.5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-['Poppins'] uppercase tracking-tight transition-colors cursor-pointer flex items-center gap-1 shadow-lg whitespace-nowrap"
              >
                <span>✈️ TRAVEL MODE</span>
              </button>
              <button 
                type="submit" 
                className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-['Poppins'] uppercase tracking-tight transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg whitespace-nowrap"
              >
                <span>BEGIN SESSION</span>
                <span>→</span>
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
