import { useState } from 'react';
import { playSolfeggioTone, stopSolfeggioTone } from '@/utils/audio';

export default function TravelModeScreen({ onBack, onNavigateNext }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepDuration, setStepDuration] = useState(30);
  const [frequency, setFrequency] = useState(528);
  const [selectedServices, setSelectedServices] = useState({
    spatialAudio: true,
    auraVisuals: true,
    groundingPulse: true,
  });

  const solfeggioFrequencies = [396, 417, 528, 639, 741, 852, 963];

  const toggleService = (key) => {
    setSelectedServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSolfeggioTone();
      setIsPlaying(false);
    } else {
      playSolfeggioTone(frequency);
      setIsPlaying(true);
    }
  };

  const handleFrequencySelect = (freq) => {
    setFrequency(freq);
    if (isPlaying) {
      playSolfeggioTone(freq);
    }
  };

  return (
    <div className="w-full relative text-white font-sans select-none p-6 rounded-3xl bg-[#080614]/80 border border-white/10 backdrop-blur-xl">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <button onClick={onBack} className="text-white hover:opacity-70 transition-opacity p-2 rounded-full bg-white/10 border border-white/15 cursor-pointer font-['Poppins'] text-xs font-bold flex items-center gap-2">
          <span>← Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-sm tracking-tight text-white font-['Poppins']">Travel Healing Sanctuary Mode</span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* 2-Column Widescreen Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-6">
        
        {/* Left Column: Intro & Interactive Checkboxes */}
        <div className="flex flex-col space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest font-['Poppins']">
              <span>✈️ On-The-Go Healing Sanctuary</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Poppins']">
              Spiritual Travel Sanctuary
            </h2>
            <p className="text-gray-300 text-sm lg:text-base leading-relaxed font-['Poppins']">
              Tune your frequency while traveling. Select your active solfeggio therapy channels and session step duration below.
            </p>
          </div>

          <div className="space-y-3 bg-[#0D0B1E] p-6 rounded-3xl border border-purple-500/20 shadow-2xl">
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-widest font-['Poppins']">
              ⚙️ Active Healing Channels
            </span>

            <div className="grid grid-cols-1 gap-3 pt-1">
              <div 
                onClick={() => toggleService('spatialAudio')}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-lg font-bold">{selectedServices.spatialAudio ? '☑' : '☐'}</span>
                  <span className="text-sm font-semibold text-white font-['Poppins']">Spatial Solfeggio Audio</span>
                </div>
                <span className="text-xs text-purple-300 font-mono font-bold">{frequency} Hz</span>
              </div>

              <div 
                onClick={() => toggleService('auraVisuals')}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-lg font-bold">{selectedServices.auraVisuals ? '☑' : '☐'}</span>
                  <span className="text-sm font-semibold text-white font-['Poppins']">Cosmic Aura Light Spectrum</span>
                </div>
                <span className="text-xs text-cyan-300 font-mono font-bold">Active</span>
              </div>

              <div 
                onClick={() => toggleService('groundingPulse')}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-lg font-bold">{selectedServices.groundingPulse ? '☑' : '☐'}</span>
                  <span className="text-sm font-semibold text-white font-['Poppins']">Earth Grounding Pulse</span>
                </div>
                <span className="text-xs text-amber-300 font-mono font-bold">7.83 Hz</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Step Sliders, Frequency Selector & Player Controls */}
        <div className="flex flex-col space-y-6 bg-[#0D0B1E] p-6 lg:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl">
          
          {/* Duration Step Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-300 uppercase tracking-widest font-['Poppins']">
                Session Duration Step Slider
              </span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">
                {stepDuration} Minutes
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-black/50 p-2 rounded-2xl border border-white/10">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setStepDuration(mins)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-['Poppins'] ${
                    stepDuration === mins
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Selection Pills */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-widest font-['Poppins']">
                Solfeggio Frequency Selector
              </span>
              <span className="text-sm font-extrabold text-cyan-300 font-mono">
                {frequency} Hz
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {solfeggioFrequencies.map((freq) => (
                <button
                  key={freq}
                  onClick={() => handleFrequencySelect(freq)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer font-mono ${
                    frequency === freq
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {freq} Hz
                </button>
              ))}
            </div>
          </div>

          {/* Player Controls Card */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/15 shadow-inner">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 text-xl font-bold transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white font-['Poppins']">
                    {isPlaying ? 'Solfeggio Audio Active' : 'Start Travel Healing'}
                  </span>
                  <span className="text-xs text-gray-400 font-['Poppins']">
                    {frequency} Hz Tone • {stepDuration} min session
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                <span className="text-xs font-mono text-emerald-300 font-extrabold">
                  {isPlaying ? 'PLAYING' : 'READY'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
