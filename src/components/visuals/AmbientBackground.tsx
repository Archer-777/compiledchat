import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Ellipse, Defs, RadialGradient, Stop } from "react-native-svg";
import { AuroraCurtains } from '@/components/visuals/AuroraCurtains';
import { RainBackground } from '@/components/visuals/RainBackground';
import type { SolarState } from '@/hooks/useSolarAmbience';

const AURORA_SKY_COLORS: [string, string, string] = ["#040814", "#081026", "#040814"];

function useEasedValue(target: number, durationMs: number) {
  const val = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    Animated.timing(val, {
      toValue: target,
      duration: durationMs,
      useNativeDriver: false,
    }).start();
  }, [target, durationMs, val]);
  return val;
}

function useStaggeredEasedValue(target: number, durationMs: number, delayMs = 0) {
  const val = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delayMs),
      Animated.timing(val, {
        toValue: target,
        duration: durationMs,
        useNativeDriver: false,
      }),
    ]).start();
  }, [target, durationMs, delayMs, val]);
  return val;
}

function CrossfadedGradient({
  colors,
  easeMs,
}: {
  colors: [string, string, string];
  easeMs: number;
}) {
  const [committed, setCommitted] = useState<[string, string, string]>(colors);
  const [next, setNext] = useState<[string, string, string] | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const colorsKey = colors.join("|");

  useEffect(() => {
    setNext(colors);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: easeMs,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setCommitted(colors);
        setNext(null);
        fade.setValue(0);
      }
    });
  }, [colorsKey, easeMs]);

  return (
    <>
      <LinearGradient
        colors={committed}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {next && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <LinearGradient
            colors={next}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      )}
    </>
  );
}

function useDrift(durationMs: number, distancePx = 32, delayMs = 0) {
  const val = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(val, { toValue: 1, duration: durationMs, delay: delayMs, useNativeDriver: false }),
        Animated.timing(val, { toValue: 0, duration: durationMs, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [val, durationMs, delayMs]);
  return val.interpolate({ inputRange: [0, 1], outputRange: [-distancePx, distancePx] });
}

// ── Sub-components ──────────────────────────────────────────────────────────

/**
 * Top Corner Sun: Sun disc appears first, Golden Aura expands & glows second!
 */
function GlowingCornerSun({ discOpacity, auraOpacity }: { discOpacity: Animated.Value; auraOpacity: Animated.Value }) {
  return (
    <Animated.View
      style={{ position: "absolute", top: 20, right: 20, opacity: discOpacity }}
      pointerEvents="none"
    >
      <Svg width={140} height={140} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id="happySunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff8cd" stopOpacity="1" />
            <Stop offset="45%" stopColor="#ffb703" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#fb8500" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Phase 2: Radiant Golden Aura expands and glows after a few seconds */}
        <Circle cx="60" cy="60" r="55" fill="url(#happySunGlow)" />

        {/* Phase 1: Sun Disc emerges cleanly */}
        <Circle cx="60" cy="60" r="22" fill="#ffffff" />
      </Svg>
    </Animated.View>
  );
}

function Moon({ opacity, happyNightOpacity, x }: { opacity: Animated.Value; happyNightOpacity: Animated.Value; x: number }) {
  return (
    <Animated.View
      style={{ position: "absolute", top: 45, left: x - 40, opacity }}
      pointerEvents="none"
    >
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#dfe6ff" stopOpacity="0.9" />
            <Stop offset="60%" stopColor="#b9c4f0" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#b9c4f0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="happyMoonAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffea9f" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#ffd166" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="42" fill="url(#moonGlow)" />
        <Circle cx="50" cy="50" r="48" fill="url(#happyMoonAura)" />
        <Circle cx="50" cy="50" r="20" fill="#eef1ff" />
        <Circle cx="56" cy="44" r="3.5" fill="#c9cfe8" opacity={0.6} />
      </Svg>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: happyNightOpacity,
            borderRadius: 50,
            backgroundColor: "rgba(255, 183, 3, 0.15)",
          },
        ]}
      />
    </Animated.View>
  );
}

function Stars({ opacity, happyNightOpacity, w, h }: { opacity: Animated.Value; happyNightOpacity: Animated.Value; w: number; h: number }) {
  const stars = useRef(
    Array.from({ length: 48 }).map(() => ({
      px: Math.random(),
      py: Math.random() * 0.75,
      r: Math.random() * 1.3 + 0.5,
    }))
  ).current;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width={w} height={h * 0.75}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.px * w} cy={s.py * h} r={s.r} fill="#ffffff" opacity={0.75} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function FluffyCloud({ opacity = 1, tint = "#ffffff", scale = 1 }: { opacity?: number; tint?: string; scale?: number }) {
  return (
    <Svg width={160 * scale} height={60 * scale} viewBox="0 0 160 60">
      <Ellipse cx="55" cy="35" rx="45" ry="22" fill={tint} opacity={opacity} />
      <Ellipse cx="95" cy="28" rx="35" ry="18" fill={tint} opacity={opacity} />
      <Ellipse cx="75" cy="20" rx="30" ry="16" fill={tint} opacity={opacity} />
    </Svg>
  );
}

// ── Main Ambient Background Component ───────────────────────────────────────

export interface AmbientBackgroundProps extends SolarState {
  auroraActive: boolean;
  weatherState?: "clear" | "happy" | "rain";
  easeMs?: number;
}

export function AmbientBackground({
  skyColors,
  sunAltitude,
  sunProgress,
  sunOpacity,
  nightOpacity,
  auroraActive,
  weatherState = "clear",
  easeMs = 20_000,
}: AmbientBackgroundProps) {
  const [containerW, setContainerW] = useState(400);
  const [containerH, setContainerH] = useState(800);

  // Solar Time Check: Daytime vs Nighttime
  const isDaytime = nightOpacity < 0.4 && sunOpacity > 0.3;

  const auroraFade = useEasedValue(auroraActive ? 1 : 0, 2600);

  // --- Organic Phased Rain Transition: Gloomy Sky First (0-3s) -> Rain Second (3-6s) ---
  const isRain = weatherState === "rain";
  const rainGloomyDimFade = useEasedValue(isRain ? 0.45 : 0, 3500);
  const rainDownpourFade = useStaggeredEasedValue(isRain ? 1 : 0, 3000, isRain ? 2200 : 0);

  // --- Organic Phased Sun Transition: Sun Disc Emerges First (0-3s) -> Aura Glows Second (3-6s) ---
  const showHappySun = weatherState === "happy" && isDaytime;
  const sunDiscFade = useEasedValue(showHappySun ? 1 : 0, 2500);
  const happySunAuraFade = useStaggeredEasedValue(showHappySun ? 1 : 0, 3000, showHappySun ? 2000 : 0);

  // Happy Night Moon Aura & Twinkle
  const showHappyNight = weatherState === "happy" && !isDaytime;
  const happyNightFade = useEasedValue(showHappyNight ? 1 : 0, 1500);

  const sunOpacEased = useEasedValue(auroraActive ? 0 : sunOpacity, easeMs);
  const nightOpEased = useEasedValue(Math.max(nightOpacity, auroraActive ? 1 : 0), easeMs);

  // 4-Layer Cloud Parallax Drift
  const cloud1X = useDrift(16000, 35);
  const cloud2X = useDrift(22000, 26, 700);
  const cloud3X = useDrift(28000, 42, 1200);
  const cloud4X = useDrift(19000, 20, 400);

  const isWarm = sunProgress > 0.55;
  const cloudTint = isWarm ? "#fff3e2" : "#ffffff";

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0) setContainerW(width);
        if (height > 0) setContainerH(height);
      }}
    >
      {/* 1. Base Solar Sky Gradient */}
      <CrossfadedGradient colors={skyColors} easeMs={easeMs} />

      {/* 2. Layered Ambient Drifting Clouds (4 Layers - 60 FPS Parallax) */}
      {/* Cloud Layer 1 (Upper High Visibility) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 65,
          opacity: 0.85,
          transform: [{ translateX: cloud1X }],
        }}
        pointerEvents="none"
      >
        <FluffyCloud opacity={0.85} tint={cloudTint} scale={1} />
      </Animated.View>

      {/* Cloud Layer 2 (Upper Mid) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 130,
          left: containerW * 0.38,
          opacity: 0.75,
          transform: [{ translateX: cloud2X }],
        }}
        pointerEvents="none"
      >
        <FluffyCloud opacity={0.7} tint={cloudTint} scale={0.9} />
      </Animated.View>

      {/* Cloud Layer 3 (Lower Depth 1 - Translucent Backdrop) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 205,
          left: containerW * 0.1,
          opacity: 0.45,
          transform: [{ translateX: cloud3X }],
        }}
        pointerEvents="none"
      >
        <FluffyCloud opacity={0.45} tint={cloudTint} scale={0.82} />
      </Animated.View>

      {/* Cloud Layer 4 (Lower Depth 2 - Translucent Foreground) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 265,
          left: containerW * 0.52,
          opacity: 0.35,
          transform: [{ translateX: cloud4X }],
        }}
        pointerEvents="none"
      >
        <FluffyCloud opacity={0.35} tint={cloudTint} scale={0.75} />
      </Animated.View>

      {/* 3. Top Corner Glowing Sun (Phased Transition: Sun Disc First -> Aura Glow Second) */}
      <GlowingCornerSun discOpacity={sunDiscFade} auraOpacity={happySunAuraFade} />

      {/* 4. Moon & Stars (Night - Radiant Aura when Happy at Night) */}
      <Moon opacity={nightOpEased} happyNightOpacity={happyNightFade} x={containerW / 2} />
      <Stars opacity={nightOpEased} happyNightOpacity={happyNightFade} w={containerW} h={containerH} />

      {/* 5. Phased Gloomy Overcast Sky Veil (Fades in First 0-3.5s) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#0b1329", opacity: rainGloomyDimFade },
        ]}
        pointerEvents="none"
      />

      {/* 6. Lovable's HTML5 Canvas 60 FPS Downpour Rainstorm Engine (Fades in Second 2.5-5.5s) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: rainDownpourFade }]} pointerEvents="none">
        <RainBackground active={weatherState === "rain"} />
      </Animated.View>

      {/* 7. Aurora Dark Sky Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: auroraFade }]} pointerEvents="none">
        <LinearGradient
          colors={AURORA_SKY_COLORS}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* 8. Compressed Aurora Curtains (30% of Screen Height) */}
      <AuroraCurtains opacity={auroraFade} />
    </View>
  );
}
