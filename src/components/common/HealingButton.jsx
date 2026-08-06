export default function HealingButton({ chakra, onClick, isHealing }) {
  return (
    <div className="w-full relative">
      <button
        onClick={onClick}
        className="relative w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 text-white font-black text-base tracking-wide shadow-2xl transition-all duration-300 border border-white/40 backdrop-blur-xl bg-black/25 hover:bg-black/45 cursor-pointer"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <span className="text-xl">{isHealing ? '✨' : '▶'}</span>
        <span className="uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {isHealing ? 'Healing Sound Active...' : 'Begin Healing'}
        </span>
      </button>
    </div>
  );
}
