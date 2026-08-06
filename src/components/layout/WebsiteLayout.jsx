import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const desktopStars = [
  { top: '5%', left: '8%', size: '2.5px', opacity: 0.6 },
  { top: '12%', left: '88%', size: '3px', opacity: 0.8 },
  { top: '18%', left: '25%', size: '2px', opacity: 0.5 },
  { top: '28%', left: '75%', size: '3px', opacity: 0.7 },
  { top: '35%', left: '12%', size: '2px', opacity: 0.7 },
  { top: '42%', left: '92%', size: '3px', opacity: 0.6 },
  { top: '55%', left: '5%', size: '2.5px', opacity: 0.6 },
  { top: '62%', left: '82%', size: '2px', opacity: 0.7 },
  { top: '72%', left: '18%', size: '3.5px', opacity: 0.8 },
  { top: '80%', left: '90%', size: '2px', opacity: 0.5 },
  { top: '88%', left: '30%', size: '3px', opacity: 0.7 },
  { top: '94%', left: '70%', size: '2px', opacity: 0.5 },
  { top: '8%', left: '48%', size: '2.5px', opacity: 0.5 },
  { top: '22%', left: '60%', size: '2px', opacity: 0.6 },
  { top: '48%', left: '38%', size: '2px', opacity: 0.6 },
  { top: '68%', left: '68%', size: '3px', opacity: 0.8 },
  { top: '78%', left: '42%', size: '2px', opacity: 0.5 },
  { top: '86%', left: '15%', size: '3px', opacity: 0.8 },
];

export default function WebsiteLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHealMe = location.pathname === '/heal-me';
  const isHealing = location.pathname === '/healing';
  const isTravel = location.pathname === '/travel';

  return (
    <div className="min-h-screen bg-[#06060C] text-white flex flex-col relative overflow-x-hidden w-full font-sans pb-16">
      
      {/* Full Desktop Outer Background Space Dust / Stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {desktopStars.map((star, idx) => (
          <div
            key={idx}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.9)',
            }}
          />
        ))}
        {/* Soft Cosmic Radial Ambient Gradients */}
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[160px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-900/15 blur-[180px] pointer-events-none" />
      </div>

      {/* Fixed/Pinned Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0910]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => navigate('/heal-me')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#06060C] rounded-full flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white uppercase font-['Poppins']">
                Heal Me Quickly
              </span>
              <span className="text-[10px] text-purple-300 tracking-widest font-semibold uppercase font-['Poppins']">
                AI Spiritual Wellness & Solfeggio Therapy
              </span>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <nav className="flex items-center gap-2 bg-[#121020]/90 p-1.5 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => navigate('/heal-me')}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all whitespace-nowrap cursor-pointer font-['Poppins'] ${
                isHealMe
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              1. Heal Me
            </button>
            <button
              onClick={() => navigate('/healing')}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all whitespace-nowrap cursor-pointer font-['Poppins'] ${
                isHealing
                  ? 'bg-[#D500F9] text-white shadow-[0_0_20px_rgba(213,0,249,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              2. Chakras
            </button>
            <button
              onClick={() => navigate('/travel')}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all whitespace-nowrap cursor-pointer font-['Poppins'] ${
                isTravel
                  ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              3. Travel Mode
            </button>
          </nav>

          {/* Right Live Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-gray-200 font-mono">10th Min • Supercharge Active</span>
          </div>

        </div>
      </header>

      {/* Full-Width Desktop Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 z-20 flex flex-col justify-center">
        {children}
      </main>

      {/* Fixed/Pinned Bottom Slogan Banner */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0A0910]/80 backdrop-blur-xl border-t border-white/10 py-3.5 px-6 flex items-center justify-center">
        <p className="font-semibold tracking-tight text-xs uppercase text-gray-300 font-['Poppins'] flex items-center justify-center gap-1.5 text-center">
          <span>🛡️</span>
          <span>I AM NOT PERFECT, LET'S TRANSCEND CONSCIOUSNESS</span>
        </p>
      </footer>

    </div>
  );
}
