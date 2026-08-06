import React from 'react';

export default function SacredGeometryMandala({ color }) {
  const activeColor = color || '#00FF66';

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
      style={{
        transform: 'perspective(600px) rotateX(20deg)',
        transformStyle: 'preserve-3d',
        opacity: 0.85,
        mixBlendMode: 'screen',
      }}
    >
      <svg 
        className="w-[340px] h-[340px] md:w-[440px] md:h-[440px] overflow-visible pointer-events-none" 
        viewBox="0 0 400 400" 
        fill="none" 
        style={{ 
          filter: `drop-shadow(0 0 25px ${activeColor}) drop-shadow(0 0 50px ${activeColor}88)` 
        }}
      >
        {/* Outer Layer: Slowly Rotates COUNTER-CLOCKWISE over 40s */}
        <g className="mandala-outer" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="190" stroke={activeColor} strokeWidth="1.8" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="175" stroke={activeColor} strokeWidth="1.2" />
          
          {Array.from({ length: 16 }).map((_, i) => (
            <g key={`outer-${i}`} transform={`rotate(${i * 22.5} 200 200)`}>
              <path d="M200 10 C215 40 215 60 200 80 C185 60 185 40 200 10 Z" stroke={activeColor} strokeWidth="1.2" />
              <circle cx="200" cy="22" r="3" fill={activeColor} />
            </g>
          ))}

          <polygon points="200,25 351,112 351,287 200,375 49,287 49,112" stroke={activeColor} strokeWidth="1.2" />
          <polygon points="200,375 351,287 351,112 200,25 49,112 49,287" stroke={activeColor} strokeWidth="1.2" />
        </g>

        {/* Inner Layer: Slowly Rotates CLOCKWISE over 25s */}
        <g className="mandala-inner" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="130" stroke={activeColor} strokeWidth="1.8" />
          <circle cx="200" cy="200" r="90" stroke={activeColor} strokeWidth="1.2" strokeDasharray="4 4" />
          
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={`inner-${i}`} transform={`rotate(${i * 45} 200 200)`}>
              <ellipse cx="200" cy="135" rx="20" ry="45" stroke={activeColor} strokeWidth="1.2" />
            </g>
          ))}

          <polygon points="200,70 312,265 88,265" stroke={activeColor} strokeWidth="1.8" />
          <polygon points="200,330 312,135 88,135" stroke={activeColor} strokeWidth="1.8" />
          
          <circle cx="200" cy="200" r="6" fill={activeColor} />
          <circle cx="200" cy="200" r="24" stroke={activeColor} strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
