import React from "react";
import { Platform } from "react-native";
import { Stars } from "./Stars";

/**
 * Aurora curtains — soft, atmospheric glow. Bands are heavily blurred and
 * feathered at both edges so nothing reads as a geometric strip; the light
 * dissolves into the gradient sky.
 */

const curtains = [
  {
    id: "curtain-far",
    d: "M -160 260 C 140 140 360 330 640 210 C 880 130 1060 290 1360 170 L 1360 -120 C 1060 -30 880 -110 640 0 C 360 -90 140 30 -160 -20 Z",
    d2: "M -160 260 C 140 220 360 210 640 290 C 880 210 1060 200 1360 170 L 1360 -120 C 1060 20 880 -40 640 -60 C 360 -10 140 -60 -160 -20 Z",
    y0: 265, y1: -120,
    from: "var(--aurora-violet)", mid: "var(--aurora-violet)", to: "var(--aurora-violet)",
    opacity: 0.38, duration: "7s", delay: "-1.5s", blur: 35,
  },
  {
    id: "curtain-mid",
    d: "M -160 310 C 120 180 340 380 620 240 C 850 160 1050 330 1360 210 L 1360 -80 C 1050 0 850 -70 620 40 C 340 -50 120 60 -160 10 Z",
    d2: "M -160 310 C 120 260 340 270 620 320 C 850 240 1050 250 1360 210 L 1360 -80 C 1050 50 850 0 620 -20 C 340 20 120 -20 -160 10 Z",
    y0: 315, y1: -80,
    from: "var(--aurora-violet)", mid: "var(--aurora-teal)", to: "var(--aurora-teal)",
    opacity: 0.52, duration: "5.5s", delay: "-3s", blur: 24,
  },
  {
    id: "curtain-near",
    d: "M -160 350 C 80 220 320 420 600 270 C 820 190 1030 370 1360 250 L 1360 -40 C 1030 40 820 -30 600 80 C 320 -10 80 100 -160 50 Z",
    d2: "M -160 350 C 80 300 320 310 600 350 C 820 270 1030 290 1360 250 L 1360 -40 C 1030 90 820 40 600 20 C 320 60 80 20 -160 50 Z",
    y0: 355, y1: -40,
    from: "var(--aurora-teal)", mid: "var(--aurora-green)", to: "var(--aurora-lime)",
    opacity: 0.65, duration: "4.2s", delay: "-0.8s", blur: 18,
  },
] as const;

export function AuroraSky() {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden sky-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", backgroundImage: "linear-gradient(180deg, oklch(0.11 0.03 268) 0%, oklch(0.19 0.05 258) 45%, oklch(0.15 0.04 230) 78%, oklch(0.09 0.02 240) 100%)" }}>
      <Stars layer="deep" />
      <Stars layer="bright" />

      <svg
        className="absolute inset-0 h-full w-full"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* very soft vertical variation — hints of rays, no hard stripes */}
          <pattern id="aurora-rays" width="220" height="800" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="220" height="800" fill="#8a8a8a" />
            <rect x="24" y="0" width="34" height="800" fill="#dcdcdc" />
            <rect x="96" y="0" width="22" height="800" fill="#ffffff" />
            <rect x="158" y="0" width="30" height="800" fill="#c4c4c4" />
          </pattern>

          <mask id="aurora-ray-mask" maskUnits="userSpaceOnUse" x="-200" y="-100" width="1600" height="1000">
            <rect
              x="-200" y="-100" width="1600" height="1000"
              fill="url(#aurora-rays)"
              style={{ filter: "blur(28px)" }}
            />
          </mask>

          {curtains.map((c) => (
            <linearGradient
              key={c.id}
              id={`grad-${c.id}`}
              x1="0" y1={c.y0} x2="0" y2={c.y1}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={c.to} stopOpacity="0" />
              <stop offset="30%" stopColor={c.to} stopOpacity="0.75" />
              <stop offset="50%" stopColor={c.mid} stopOpacity="0.65" />
              <stop offset="70%" stopColor={c.from} stopOpacity="0" />
              <stop offset="100%" stopColor={c.from} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {curtains.map((c) => (
          <g
            key={c.id}
            className="aurora-curtain"
            style={{ animationDuration: c.duration, animationDelay: c.delay }}
          >
            {/* wide atmospheric bloom */}
            <path
              d={c.d}
              fill={`url(#grad-${c.id})`}
              opacity={c.opacity * 0.75}
              style={{ filter: `blur(${c.blur * 1.9}px)` }}
            >
              <animate
                attributeName="d"
                dur={c.duration}
                repeatCount="indefinite"
                values={`${c.d}; ${c.d2}; ${c.d}`}
              />
            </path>
            {/* softly ray-modulated core, still diffuse */}
            <path
              d={c.d}
              fill={`url(#grad-${c.id})`}
              opacity={c.opacity * 0.85}
              mask="url(#aurora-ray-mask)"
              style={{ filter: `blur(${c.blur}px)` }}
            >
              <animate
                attributeName="d"
                dur={c.duration}
                repeatCount="indefinite"
                values={`${c.d}; ${c.d2}; ${c.d}`}
              />
            </path>
          </g>
        ))}
      </svg>

      {/* readability haze */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_35%,var(--sky-haze)_100%)]" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,var(--sky-deep),transparent)]" style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }} />
    </div>
  );
}
