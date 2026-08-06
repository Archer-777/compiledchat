import React from "react";
import { Platform } from "react-native";

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(count: number, seed: number, maxSize: number, maxTop: number) {
  const rand = mulberry(seed);
  return Array.from({ length: count }, (_, i) => {
    const size = 0.6 + rand() * maxSize;
    return {
      id: `${seed}-${i}`,
      left: `${rand() * 100}%`,
      top: `${rand() * maxTop}%`,
      size,
      opacity: 0.35 + rand() * 0.65,
      duration: `${2.4 + rand() * 4.5}s`,
      delay: `-${rand() * 6}s`,
    };
  });
}

const deepStars = makeStars(110, 7, 1.1, 92);
const brightStars = makeStars(38, 21, 1.8, 72);

export function Stars({ layer }: { layer: "deep" | "bright" }) {
  if (Platform.OS !== "web") {
    return null;
  }

  const stars = layer === "deep" ? deepStars : brightStars;

  return (
    <div className="pointer-events-none absolute inset-0" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
