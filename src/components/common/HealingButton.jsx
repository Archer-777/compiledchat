export default function HealingButton({ chakra, onClick, isHealing }) {
  return (
    <div className="w-full relative">
      <button
        onClick={onClick}
        className={`relative w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 text-white font-black text-base tracking-wide shadow-2xl transition-all duration-300 border backdrop-blur-xl cursor-pointer ${
          isHealing
            ? 'bg-red-950/70 hover:bg-red-900/80 border-red-500/80 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : 'bg-black/25 hover:bg-black/45 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
        }`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <span className="text-xl">{isHealing ? '⏹' : '▶'}</span>
        <span className="uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {isHealing ? 'Stop Healing' : 'Begin Healing'}
        </span>
      </button>
    </div>
  );
}
