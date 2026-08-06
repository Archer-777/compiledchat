export default function PassiveIncomeBadge({ size = 130, className = "" }) {
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
        <defs>
          <path id="topArcPI" d="M 22,80 A 58,58 0 0,1 138,80" fill="none" />
          <path id="bottomArcPI" d="M 138,80 A 58,58 0 0,1 22,80" fill="none" />
        </defs>

        <text fill="#FFFFFF" fontSize="14" fontWeight="700" letterSpacing="3" className="uppercase font-sans">
          <textPath href="#topArcPI" startOffset="50%" textAnchor="middle">PASSIVE</textPath>
        </text>

        <text fill="#FFFFFF" fontSize="14" fontWeight="700" letterSpacing="3" className="uppercase font-sans">
          <textPath href="#bottomArcPI" startOffset="50%" textAnchor="middle">INCOME</textPath>
        </text>

        <polygon points="32,80 34,83 37,83 34.5,85 35.5,88 32,86 28.5,88 29.5,85 27,83 30,83" fill="#FFFFFF" />
        <polygon points="128,80 130,83 133,83 130.5,85 131.5,88 128,86 124.5,88 125.5,85 123,83 126,83" fill="#FFFFFF" />

        <text x="80" y="95" fill="#FFFFFF" fontSize="44" fontWeight="300" textAnchor="middle" className="font-serif">$</text>
      </svg>
    </div>
  );
}
