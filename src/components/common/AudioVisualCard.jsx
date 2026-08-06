export default function AudioVisualCard({ chakra, isPlaying, onTogglePlay }) {
  const barHeights = [40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 50];

  return (
    <div className="w-full relative rounded-3xl overflow-hidden p-5 transition-all backdrop-blur-2xl border shadow-2xl bg-black/20 border-white/30">
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Experience Audio Visuals
          </span>
        </div>
        <button
          onClick={onTogglePlay}
          className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black/30 hover:bg-black/50 border border-white/30 text-white transition-all shadow-md cursor-pointer"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {isPlaying ? '🔊 PLAYING SOUND' : '🔇 TAP TO HEAR'}
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-black/20 border border-white/20">
          <span className="text-2xl mb-1">🎧</span>
          <span className="text-xs font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Spatial Headphones</span>
          <span className="text-[10px] text-amber-300 font-bold mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{chakra?.frequency}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-black/20 border border-white/20">
          <span className="text-2xl mb-1">👁️</span>
          <span className="text-xs font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Visual Aura</span>
          <span className="text-[10px] text-slate-100 mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Light Spectrum</span>
        </div>
      </div>

      <div className="relative z-10 bg-black/30 rounded-2xl p-3 border border-white/20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Solfeggio Sound Therapy</span>
          <span className="text-[11px] font-mono text-amber-300 font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{chakra?.frequency}</span>
        </div>

        <div className="h-10 flex items-end justify-between gap-1 pt-1">
          {barHeights.map((h, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: isPlaying ? `${Math.max(20, (h * (idx % 2 ? 0.9 : 0.6)))}%` : '30%',
                backgroundColor: '#FFFFFF',
                boxShadow: `0 0 8px #FFFFFF`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
