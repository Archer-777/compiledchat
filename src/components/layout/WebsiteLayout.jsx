import React, { useState, useEffect } from 'react';

export default function WebsiteLayout({ children, showFooter = true }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate 120 cosmic twinkling stars across layout
    const generated = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      top: `${(Math.random() * 100).toFixed(2)}%`,
      size: `${(0.8 + Math.random() * 1.5).toFixed(2)}px`,
      duration: `${(2 + Math.random() * 4).toFixed(2)}s`,
      delay: `${(Math.random() * 5).toFixed(2)}s`,
      opacity: 0.2 + Math.random() * 0.7,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#06060E] text-white flex flex-col selection:bg-purple-500 selection:text-white overflow-x-hidden font-['Poppins']">
      {/* ── Cosmic Starfield & Background Ambient FX ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
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
      {showFooter && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0A0910]/80 backdrop-blur-xl border-t border-white/10 py-3.5 px-6 flex items-center justify-center">
          <p className="font-semibold tracking-tight text-xs uppercase text-gray-300 font-['Poppins'] flex items-center justify-center gap-1.5 text-center">
            <span>🛡️</span>
            <span>I AM NOT PERFECT, LET'S TRANSCEND CONSCIOUSNESS</span>
          </p>
        </footer>
      )}
    </div>
  );
}
