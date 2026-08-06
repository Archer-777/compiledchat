import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';

export default function ClarityPage() {
  const navigate = useNavigate();
  const [selectedInteraction, setSelectedInteraction] = useState('voice');
  const [sessionDuration, setSessionDuration] = useState(11);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatTime = (min) => `${min < 10 ? '0' + min : min}:11`;

  return (
    <AmbientBackground>
      <div className="relative min-h-screen text-white font-sans overflow-x-hidden pt-6 pb-24">
        
        {/* Main Desktop Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8 bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Poppins']">
                  Clarity On Demand
                </h1>
                <p className="text-xs text-purple-300">
                  Real-time Solfeggio Audio & AI Guided Reflection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-900/40 px-4 py-2 rounded-full border border-purple-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-200 font-mono">11:11 Solfeggio Sync</span>
            </div>
          </div>

          {/* 2-Pane Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT PANE (Col 7): Audio Player & Mode Selector ── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Main Audio Player Card */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(147,51,234,0.15)] flex flex-col items-center text-center">
                
                {/* Glowing Pulse Orb */}
                <div className="relative w-48 h-48 my-6 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-amber-400 blur-xl opacity-60 ${isPlaying ? 'animate-pulse scale-110' : ''}`} />
                  <div className="relative w-40 h-40 rounded-full bg-[#06060C] border border-white/20 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl mb-1">{isPlaying ? '🧘' : '✨'}</span>
                    <span className="text-xl font-extrabold text-white font-mono">{formatTime(sessionDuration)}</span>
                    <span className="text-[10px] text-purple-300 uppercase tracking-widest mt-1">528 Hz • Miracles</span>
                  </div>
                </div>

                {/* Playback Control Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-full max-w-sm py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-black shadow-amber-500/40 hover:bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-cyan-500/40 hover:opacity-95'
                  }`}
                >
                  {isPlaying ? '⏸ PAUSE CLARITY SESSION' : '▶ BEGIN 11:11 CLARITY SESSION'}
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-around">
                {[
                  { id: 'voice', label: 'Voice Reflection', icon: '🎙️' },
                  { id: 'text', label: 'Text Chat', icon: '💬' },
                  { id: 'video', label: 'Spiritual Vision', icon: '👁️' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedInteraction(mode.id)}
                    className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl transition-all cursor-pointer ${
                      selectedInteraction === mode.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    <span className="text-xs font-bold">{mode.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* ── RIGHT PANE (Col 5): Session Controls & Presets ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Duration Slider Card */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-white font-['Poppins'] flex items-center gap-2">
                    <span>⏱️</span> Session Duration
                  </h3>
                  <span className="text-sm font-bold font-mono text-cyan-300">{sessionDuration} Mins</span>
                </div>

                <input
                  type="range"
                  min="3"
                  max="45"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-2"
                />

                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>3m Quick Reset</span>
                  <span>11m Synchronicity</span>
                  <span>45m Deep Vision</span>
                </div>
              </div>

              {/* Solfeggio Frequency Presets */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
                  <span>🎵</span> Frequency Presets
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { freq: '396 Hz', name: 'Liberation', color: 'from-red-600/30 to-red-900/10' },
                    { freq: '417 Hz', name: 'Facilitating Change', color: 'from-orange-600/30 to-orange-900/10' },
                    { freq: '528 Hz', name: 'Transformation', color: 'from-emerald-600/30 to-emerald-900/10' },
                    { freq: '639 Hz', name: 'Relationships', color: 'from-cyan-600/30 to-cyan-900/10' },
                    { freq: '741 Hz', name: 'Awakening Intuition', color: 'from-indigo-600/30 to-indigo-900/10' },
                    { freq: '852 Hz', name: 'Spiritual Order', color: 'from-purple-600/30 to-purple-900/10' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 flex flex-col justify-between cursor-pointer hover:border-white/30 transition-all`}
                    >
                      <span className="text-sm font-extrabold font-mono text-white">{item.freq}</span>
                      <span className="text-[10px] text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </AmbientBackground>
  );
}
