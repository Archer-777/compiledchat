import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';

export default function EmpowerPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const communities = [
    { id: 1, title: 'Nobel Laureate & AI Advisory Room', members: '1,420 Active', category: 'advisory', tag: 'Live Session' },
    { id: 2, title: 'Mindfulness & High Vibrational Energy', members: '3,890 Active', category: 'meditation', tag: 'Chakra Group' },
    { id: 3, title: 'Collective Consciousness Research', members: '840 Active', category: 'research', tag: 'Quantum Science' },
    { id: 4, title: 'King Wind Turbine & Clean Energy Tech', members: '2,150 Active', category: 'tech', tag: 'Sustainability' },
  ];

  return (
    <AmbientBackground>
      <div className="relative min-h-screen text-white font-sans overflow-x-hidden pt-6 pb-24">
        
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
                  Empower Community
                </h1>
                <p className="text-xs text-purple-300">
                  Global Collective Advisory Rooms & Peer Networks
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/wish')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-xs text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              + Create Wish / Proposal
            </button>
          </div>

          {/* 2-Pane Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT PANE (Col 7): Active Community Feed ── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['all', 'advisory', 'meditation', 'research', 'tech'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {communities
                .filter((c) => activeCategory === 'all' || c.category === activeCategory)
                .map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4 hover:border-white/25 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2 inline-block">
                          {comm.tag}
                        </span>
                        <h3 className="text-lg font-bold text-white font-['Poppins']">
                          {comm.title}
                        </h3>
                      </div>

                      <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 cursor-pointer">
                        Join Room
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3">
                      <span>👥 {comm.members}</span>
                      <span className="text-purple-300 font-mono">Live Telemetry Active</span>
                    </div>
                  </div>
                ))}

            </div>

            {/* ── RIGHT PANE (Col 5): Live Advisory & Nobel Laureate Room ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
                  <span>🎙️</span> Live Audio Advisory Room
                </h3>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-lg">
                      👑
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Nobel Laureate Consultation</h4>
                      <p className="text-[11px] text-purple-300">King Wind Turbine & Clean Energy Tech</p>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg cursor-pointer hover:opacity-90">
                    Connect Live Audio Stream
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </AmbientBackground>
  );
}
