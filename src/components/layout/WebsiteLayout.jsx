import React from 'react';

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

      {/* Full-Width Desktop Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 z-20 flex flex-col justify-center min-h-[calc(100vh-60px)]">
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
