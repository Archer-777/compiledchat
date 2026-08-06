export default function FreeClockBadge({ size = 130, className = "" }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none"
      >
        <circle cx="72" cy="88" r="54" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <circle cx="72" cy="88" r="48" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" fill="none" />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 72 + Math.sin(angle) * 44;
          const y1 = 88 - Math.cos(angle) * 44;
          const x2 = 72 + Math.sin(angle) * 51;
          const y2 = 88 - Math.cos(angle) * 51;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFFFFF"
              strokeWidth={i % 3 === 0 ? "2.5" : "1"}
              strokeLinecap="round"
            />
          );
        })}

        <line x1="72" y1="88" x2="48" y2="88" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="72" y1="88" x2="85" y2="56" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="72" cy="88" r="4.5" fill="#FFFFFF" />

        <g transform="translate(90, 18)">
          <rect x="0" y="0" width="58" height="32" rx="3" stroke="#FFFFFF" strokeWidth="2" fill="#06060C" />
          <path d="M 6 32 L 0 42 L 16 32 Z" fill="#06060C" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 6 31 L 16 31" stroke="#06060C" strokeWidth="3" />
          <text x="29" y="21" fill="#FFFFFF" fontSize="15" fontWeight="800" letterSpacing="2" textAnchor="middle" className="font-sans uppercase">FREE</text>
        </g>
      </svg>
    </div>
  );
}
