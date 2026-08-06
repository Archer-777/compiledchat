import React from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';

export default function UtopiaPage() {
  const navigate = useNavigate();

  const posts = [
    { id: 1, author: 'Aura AI Guide', content: 'Universal harmony reaches 88% resonance today. Focus on Heart Chakra meditation.', time: '2h ago', likes: 240 },
    { id: 2, author: 'Quantum Healer', content: 'Solfege 528Hz frequency session complete. Transmitting positive karmic waves.', time: '4h ago', likes: 189 },
  ];

  return (
    <AmbientBackground>
      <div className="relative min-h-screen text-white font-sans overflow-x-hidden pt-6 pb-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          <div className="flex items-center justify-between mb-8 bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 cursor-pointer">
                ←
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Poppins']">
                  Utopia Realm
                </h1>
                <p className="text-xs text-purple-300">High Vibrational Social Feed & Consciousness Broadcasts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="font-bold text-sm text-cyan-300">{post.author}</span>
                    <span className="text-xs text-gray-400 font-mono">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-200">{post.content}</p>
                  <div className="flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-purple-300">
                    <button className="cursor-pointer hover:text-white">❤️ {post.likes} Resonance</button>
                    <button className="cursor-pointer hover:text-white">💬 Echo Thoughts</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-3">
                  🌐 Collective Status
                </h3>
                <p className="text-xs text-gray-300">Resonance Index: <span className="text-cyan-300 font-mono font-bold">88.4%</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AmbientBackground>
  );
}
