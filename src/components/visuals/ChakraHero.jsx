import SacredGeometryMandala from '@/components/visuals/SacredGeometryMandala';

export default function ChakraHero({ chakra, isPlaying }) {
  const imagePath = chakra?.imagePath || '/chakras/heart_chakra_green-removebg-preview.png';
  const color = chakra?.color || '#00FF66';

  return (
    <div className="relative w-full flex flex-col items-center justify-center pt-3 pb-6 px-4 overflow-hidden bg-transparent">
      <div className="relative z-10 mb-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xl border border-white/25 shadow-lg">
          <span className="text-amber-300">⚡</span>
          <span 
            className="text-[11px] font-black tracking-widest text-amber-300 uppercase"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            10th Minute • Supercharge
          </span>
        </div>
        <span 
          className="text-[11px] text-white/90 font-medium drop-shadow-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Instant Online Spiritual Healing
        </span>
      </div>

      <div className="relative z-10 my-3 flex items-center justify-center min-h-[230px] w-full bg-transparent">
        <SacredGeometryMandala color={color} />

        <div 
          className="relative flex items-center justify-center p-0 z-10"
          style={{ background: 'transparent' }}
        >
          <img
            src={imagePath}
            alt={chakra?.name}
            className="w-52 h-52 md:w-60 md:h-60 object-contain"
            style={{
              filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.35))',
              WebkitMaskImage: 'radial-gradient(circle at center, black 70%, transparent 98%)',
              maskImage: 'radial-gradient(circle at center, black 70%, transparent 98%)',
              background: 'transparent',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mt-3 px-3.5 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 shadow-md">
        <span 
          className="text-[10px] uppercase font-bold tracking-widest text-white"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Mantra: <span className="text-amber-300 font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>{chakra?.mantra}</span> • Element: <span style={{ fontFamily: "'Poppins', sans-serif" }}>{chakra?.element}</span>
        </span>
      </div>
    </div>
  );
}
