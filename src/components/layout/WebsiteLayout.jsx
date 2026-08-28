import React, { useRef, useEffect } from 'react';

function CosmicStarfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      if (typeof window !== 'undefined') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const starCount = 55;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 1000),
      radius: Math.random() * 1.3 + 0.6,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.006,
      angle: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.angle += s.pulseSpeed;
        const currentAlpha = Math.max(0.12, Math.min(0.85, s.alpha + Math.sin(s.angle) * 0.28));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.75 }}
    />
  );
}

export default function WebsiteLayout({ children, showFooter = true }) {
  return (
    <div className="relative min-h-screen w-full bg-[#06060E] text-white flex flex-col selection:bg-purple-500 selection:text-white overflow-x-hidden font-['Poppins']">
      {/* ── Cosmic Starfield & Background Ambient FX (GPU-Optimized for iOS) ── */}
      <CosmicStarfield />

      {/* Smooth Ambient Radial Gradients (Replaces high-cost blur filters with native CSS gradients) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 600px 600px at 15% 20%, rgba(88, 28, 135, 0.16) 0%, transparent 70%),
            radial-gradient(ellipse 600px 600px at 85% 75%, rgba(49, 46, 129, 0.16) 0%, transparent 70%),
            radial-gradient(ellipse 700px 700px at 50% 50%, rgba(22, 101, 120, 0.12) 0%, transparent 70%)
          `,
        }}
      />

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

