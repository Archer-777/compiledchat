import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';

export default function WishPage() {
  const navigate = useNavigate();
  const [wishText, setWishText] = useState('');
  const [submittedWishes, setSubmittedWishes] = useState([
    { id: 1, text: 'Clean Energy wind turbine installation for rural empowerment', votes: 142, status: 'Active' },
    { id: 2, text: 'Collective 528Hz Solfeggio sound therapy for anxiety relief', votes: 89, status: 'In Review' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wishText.trim()) {
      setSubmittedWishes([
        { id: Date.now(), text: wishText, votes: 1, status: 'Submitted' },
        ...submittedWishes,
      ]);
      setWishText('');
    }
  };

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
                  Wish Manifestation
                </h1>
                <p className="text-xs text-purple-300">
                  Broadcast Intentions to the Collective Soul Matrix
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
              ⭐ Manifestation Power: 95%
            </div>
          </div>

          {/* 2-Pane Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT PANE (Col 7): Wish Input & Intention Form ── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <form
                onSubmit={handleSubmit}
                className="bg-[#0D0A21]/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-4"
              >
                <h2 className="text-lg font-bold text-white font-['Poppins'] flex items-center gap-2">
                  <span>✨</span> Express Your Wish or Intention
                </h2>

                <textarea
                  rows={5}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Describe your vision, intention, or collective project..."
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm font-sans"
                />

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-sm text-white shadow-lg cursor-pointer hover:opacity-95 transition-all"
                >
                  🚀 TRANSMIT TO SOUL MATRIX
                </button>
              </form>

            </div>

            {/* ── RIGHT PANE (Col 5): Manifested Wishes Feed ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
                  <span>📜</span> Manifested Wishes Feed
                </h3>

                <div className="flex flex-col gap-3">
                  {submittedWishes.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2"
                    >
                      <p className="text-xs text-gray-200">{w.text}</p>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-2">
                        <span>👍 {w.votes} Votes</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                          {w.status}
                        </span>
                      </div>
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
