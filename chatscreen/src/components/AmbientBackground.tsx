import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Ellipse, Polygon, Line, Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Filter, FeGaussianBlur, Path } from "react-native-svg";
import { AuroraCurtains } from "./AuroraCurtains";
import { AuroraShaderBackground } from "./AuroraShaderBackground";
import { RainBackground } from "./RainBackground";
import { RainbowArc } from "./RainbowArc";
import { AuroraSky } from "./AuroraSky";
import type { SolarState } from "../hooks/useSolarAmbience";

const AURORA_SKY_COLORS: [string, string, string, string] = ["#03251e", "#051c22", "#0a152e", "#0c0d16"];

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

/** 4-Second Sparkling Starlight Twinkle Burst Hook */
function useTwinkleBurst(trigger: boolean) {
  const val = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    if (trigger) {
      val.setValue(0.35);
      Animated.sequence([
        Animated.timing(val, { toValue: 1.0, duration: 1200, useNativeDriver: false }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue: 0.50, duration: 750, useNativeDriver: false }),
            Animated.timing(val, { toValue: 1.0, duration: 850, useNativeDriver: false }),
            Animated.timing(val, { toValue: 0.60, duration: 700, useNativeDriver: false }),
            Animated.timing(val, { toValue: 0.95, duration: 800, useNativeDriver: false }),
          ]),
          { iterations: 10 } // ~33 seconds of continuous starlight twinkling burst!
        ),
        Animated.timing(val, { toValue: 0.35, duration: 4000, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.timing(val, { toValue: 0.35, duration: 1500, useNativeDriver: false }).start();
    }
  }, [trigger, val]);
  return val;
}

function CrossfadedGradient({
  colors,
  easeMs,
  fractionalHour,
}: {
  colors: [string, string, string];
  easeMs: number;
  fractionalHour: number;
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

  // Construct smooth 4-stop color ramp for seamless natural gradient blending
  const make4Stops = (c: [string, string, string]): [string, string, string, string] => {
    // Robust check using fractionalHour:
    // Night: 20.5 (8:30pm) to 5.0 (5:00am)
    // Evening (Dusk/Purple): 17.5 (5:30pm) to 20.5 (8:30pm)
    // Day/Sunrise: 5.0 to 17.5
    const isNightSky = fractionalHour >= 20.5 || fractionalHour < 5.0;
    const isPurpleSky = fractionalHour >= 17.5 && fractionalHour < 20.5;

    if (isNightSky) {
      return [
        c[0], // Deep midnight space top
        c[1], // Rich twilight indigo-navy mid
        "#16203a", // Mid-lower deep navy
        "#223157", // Soft midnight dusk navy bottom near input capsule
      ];
    }
    if (isPurpleSky) {
      return [
        c[0], // Deep dark twilight purple top
        c[1], // Rich dusk purple mid
        "#4a2c56", // Lighter purplish-lavender dusk
        "#6b3c60", // Soft purplish dusk bottom near input capsule
      ];
    }
    return [
      c[0], // cerulean top
      c[1], // soft sky blue
      "#dfccbe", // atmospheric white-peach blend
      c[2], // warm dusty horizon
    ];
  };

  return (
    <>
      <LinearGradient
        colors={make4Stops(committed)}
        locations={[0, 0.40, 0.78, 1.0]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {next && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <LinearGradient
            colors={make4Stops(next)}
            locations={[0, 0.40, 0.78, 1.0]}
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
 * Top-Right Sunburst with Soft-Blurred Borderless Hexagonal Flares Sweeping to "Hey User"
 */
function GlowingCornerSun({ discOpacity, auraOpacity }: { discOpacity: Animated.Value; auraOpacity: Animated.Value }) {
  return (
    <Animated.View
      style={{ position: "absolute", top: -50, right: -50, width: 420, height: 420, opacity: discOpacity }}
      pointerEvents="none"
    >
      {/* 1. Starburst Rays (Provides the long sharp rays) */}
      <Image
        source={require("../../assets/real_sunburst_transparent.png")}
        style={{ width: 420, height: 420 }}
        resizeMode="contain"
      />

      {/* 2. White-Hot Core, Warm Glow Aura, and Golden Hexagonal Lens Flares */}
      <Svg width={420} height={420} viewBox="0 0 420 420" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Filter id="flareSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="2.5" />
          </Filter>
          <Filter id="sunBulbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="20" />
          </Filter>
          <Filter id="sunCoreBlur" x="-30%" y="-30%" width="160%" height="160%">
            <FeGaussianBlur stdDeviation="3" />
          </Filter>
          
          <RadialGradient id="sunSolarAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fffae6" stopOpacity="0.95" />
            <Stop offset="25%" stopColor="#ffd966" stopOpacity="0.75" />
            <Stop offset="60%" stopColor="#f6b26b" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#e69138" stopOpacity="0" />
          </RadialGradient>
          
          <RadialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="70%" stopColor="#fffae0" stopOpacity="0.9" />
            <Stop offset="90%" stopColor="#ffd966" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#ffd966" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Large, Blazing Solar Aura (Pixel-precise alignment to sunburst center) */}
        <Circle cx="328" cy="90" r="130" fill="url(#sunSolarAura)" filter="url(#sunBulbGlow)" opacity={0.75} />

        {/* 3. Original Hexagonal Lens Flares stretching diagonally */}
        {/* Prism 1: Original soft teal hexagon */}
        <Polygon
          points="312,95 301,76 279,76 268,95 279,114 301,114"
          fill="rgba(120, 220, 220, 0.48)"
          stroke="none"
          filter="url(#flareSoftBlur)"
        />

        {/* Prism 2: Original soft cyan hexagon */}
        <Polygon
          points="247,115 231,87 199,87 183,115 199,143 231,143"
          fill="rgba(140, 225, 210, 0.38)"
          stroke="none"
          filter="url(#flareSoftBlur)"
        />

        {/* Prism 3: Original translucent green-teal hexagon */}
        <Polygon
          points="177,135 156,98 114,98 93,135 114,172 156,172"
          fill="rgba(165, 235, 215, 0.25)"
          stroke="none"
          filter="url(#flareSoftBlur)"
        />
      </Svg>

      {/* 2. Realistic Glowing Circle Sun Image from Sun.jpeg with glow effect */}
      <View
        style={{
          position: "absolute",
          left: 328 - 32,
          top: 90 - 32,
          width: 64,
          height: 64,
          borderRadius: 32,
          overflow: "visible", // Allowed for shadow
          alignItems: "center",
          justifyContent: "center",
          // Glowing effect
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 25,
          elevation: 12,
        }}
      >
        <Image
          source={require("../../assets/Sun.jpeg")}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            opacity: 1, // Full opacity for the new sun
          }}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
}

function Moon({ opacity, happyNightOpacity }: { opacity: Animated.Value; happyNightOpacity: Animated.Value }) {
  return (
    <Animated.View
      style={{ position: "absolute", top: 12, right: 12, opacity }}
      pointerEvents="none"
    >
      {/* 1. Atmospheric Light-Bulb Soft Blur Outward Glow (Zero hard circle edges) */}
      <Svg width={380} height={380} viewBox="0 0 380 380" style={{ position: "absolute", top: -147, right: -147 }}>
        <Defs>
          <Filter id="bulbLightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="22" />
          </Filter>
          <RadialGradient id="lunarSkyRadiance" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff8eb" stopOpacity="0.55" />
            <Stop offset="40%" stopColor="#ebd6b0" stopOpacity="0.30" />
            <Stop offset="75%" stopColor="#9682ba" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#9682ba" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Soft Blurry Light Bulb Glow Outwards */}
        <Circle cx="190" cy="190" r="150" fill="url(#lunarSkyRadiance)" filter="url(#bulbLightGlow)" />
        <Circle cx="190" cy="190" r="70" fill="rgba(255, 250, 235, 0.45)" filter="url(#bulbLightGlow)" />
      </Svg>

      {/* 2. Soft, Blended Photorealistic Moon Disc */}
      <Image
        source={require("../../assets/real_moon_transparent.png")}
        style={{
          width: 86,
          height: 86,
          opacity: 0.72,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

function Stars({
  opacity,
  twinkleOpacity,
  w,
  h,
}: {
  opacity: Animated.Value;
  twinkleOpacity: Animated.Value;
  w: number;
  h: number;
}) {
  const stars = useRef(
    Array.from({ length: 38 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * (h * 0.55),
      r: Math.random() * 1.5 + 0.6,
      sparkleFactor: 0.4 + Math.random() * 0.6,
    }))
  ).current;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {/* Base Still Starlight (0.35 Opacity - Zero Twinkling Normally) */}
      <Svg width={w} height={h * 0.55}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={0.35} />
        ))}
      </Svg>
      {/* Happy-Only Random Individual Star Twinkle Burst (35-40 Second Sparkle) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: twinkleOpacity }]}>
        <Svg width={w} height={h * 0.55}>
          {stars.map((s, i) => (
            <Circle
              key={`t-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r * (1 + s.sparkleFactor * 0.6)}
              fill="#ffffff"
              opacity={s.sparkleFactor}
            />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * 35-40 Second Smooth Shooting Star / Meteor Shower Effect
 * Triggered ONLY during Evening or Night HAPPY mood
 */
function MeteorShower({ trigger, w, h }: { trigger: boolean; w: number; h: number }) {
  if (!trigger) return null;

  // Slow speed, delicate shorter streak path high in the top sky
  const meteors = [
    // 1. Enters top sky (startX: w * 0.60, startY: -15), gliding gently down a short path to (endX: w * 0.40, endY: 95)
    { startX: w * 0.60, startY: -15, endX: w * 0.40, endY: 95,  duration: 900, delay: 1000,  len: 85 },
    // 2. Enters upper-left (startX: w * 0.45, startY: -20), gliding gently down to (endX: w * 0.25, endY: 90)
    { startX: w * 0.45, startY: -20, endX: w * 0.25, endY: 90,  duration: 950, delay: 6500,  len: 90 },
    // 3. Enters top center (startX: w * 0.55, startY: -15), gliding gently down to (endX: w * 0.35, endY: 100)
    { startX: w * 0.55, startY: -15, endX: w * 0.35, endY: 100, duration: 850, delay: 13000, len: 80 },
    // 4. Enters upper right (startX: w * 0.65, startY: -20), gliding gently down to (endX: w * 0.45, endY: 105)
    { startX: w * 0.65, startY: -20, endX: w * 0.45, endY: 105, duration: 920, delay: 20500, len: 88 },
    // 5. Enters top center (startX: w * 0.50, startY: -15), gliding gently down to (endX: w * 0.30, endY: 95)
    { startX: w * 0.50, startY: -15, endX: w * 0.30, endY: 95,  duration: 900, delay: 28500, len: 85 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {meteors.map((m, idx) => (
        <ShootingStarItem
          key={idx}
          startX={m.startX}
          startY={m.startY}
          endX={m.endX}
          endY={m.endY}
          duration={m.duration}
          delay={m.delay}
          len={m.len}
        />
      ))}
    </View>
  );
}

function ShootingStarItem({ startX, startY, endX, endY, duration, delay, len }: { startX: number; startY: number; endX: number; endY: number; duration: number; delay: number; len: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay, duration]);

  // Silky smooth fading curve: Gentle fade-in as it enters from top edge, hold, smooth fade-out as it glides down
  const opacity = anim.interpolate({
    inputRange: [0, 0.15, 0.70, 1],
    outputRange: [0, 0.75, 0.75, 0],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, endY],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: len,
        height: 2,
        opacity,
        ...(Platform.OS === 'web' ? { filter: 'blur(1px)' } : {}),
        transform: [
          { translateX },
          { translateY },
          { rotate: "-35deg" },
        ],
      }}
      pointerEvents="none"
    >
      {/* Smooth Luminous Tapered Tail: Bright White Core -> Feathered Cyan Glow -> Soft Dissolve */}
      <LinearGradient
        colors={["#ffffff", "rgba(180, 240, 255, 0.85)", "rgba(100, 200, 255, 0.35)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          flex: 1,
          borderRadius: 2,
        }}
      />
    </Animated.View>
  );
}

function FluffyCloud({ opacity = 1, tint = "#ffffff", scale = 1 }: { opacity?: number; tint?: string; scale?: number }) {
  return (
    <Image
      source={require("../../assets/real_cloud_transparent.png")}
      style={{
        width: 240 * scale,
        height: 120 * scale,
        opacity,
      }}
      tintColor={tint === "#ffffff" ? undefined : tint}
      resizeMode="contain"
    />
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
  fractionalHour,
  weatherState = "clear",
  easeMs = 20_000,
}: AmbientBackgroundProps) {
  const [containerW, setContainerW] = useState(400);
  const [containerH, setContainerH] = useState(800);

  // Solar Time Check: Daytime vs Nighttime
  const isDaytime = nightOpacity < 0.4 && sunOpacity > 0.3;

  const auroraFade = useEasedValue(auroraActive ? 1 : 0, 2600);

  // --- Slow, Luxurious Rain Transition (4.5s Easing) ---
  const isRain = weatherState === "rain";
  const rainGloomyDimFade = useEasedValue(isRain ? 0.45 : 0, 4500);
  const rainDownpourFade = useEasedValue(isRain ? 1 : 0, 4500);

  // --- Daytime Ambient Sun & Golden Hour Shine (Happy State) ---
  const daytimeSunFade = useEasedValue(isDaytime ? (weatherState === "happy" ? 1.0 : 0.65) : 0, 2000);
  const showHappySun = weatherState === "happy" && isDaytime;
  const happySunAuraFade = useStaggeredEasedValue(showHappySun ? 1 : 0, 3000, showHappySun ? 1000 : 0);
  const goldenHourShineFade = useEasedValue(showHappySun ? 0.45 : 0, 2500);

  // --- Nighttime Happy Sentiment: 4-Second Sparkling Starlight Twinkle Burst & Moon Aura ---
  const showHappyNight = weatherState === "happy" && !isDaytime;
  const starTwinkleBurst = useTwinkleBurst(showHappyNight);
  const happyNightFade = useEasedValue(showHappyNight ? 1 : 0, 1500);

  const sunOpacEased = useEasedValue(auroraActive ? 0 : sunOpacity, easeMs);
  const nightOpEased = useEasedValue(Math.max(nightOpacity, auroraActive ? 1 : 0), easeMs);

  // Fade out Moon and Sun when Aurora is active
  const sunOpacityControlled = Animated.multiply(
    daytimeSunFade,
    auroraFade.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  );

  const moonOpacityControlled = Animated.multiply(
    nightOpEased,
    auroraFade.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  );

  // Cloud opacity completely fades to 0 when Aurora is active
  const cloudOpacityMultiplier = auroraFade.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  // 6-Layer Cloud Parallax Drift
  const cloud1X = useDrift(16000, 35);
  const cloud2X = useDrift(22000, 26, 700);
  const cloud3X = useDrift(28000, 42, 1200);
  const cloud4X = useDrift(19000, 20, 400);
  const cloud5X = useDrift(24000, 30, 900);
  const cloud6X = useDrift(31000, 25, 1500);

  const isNight = nightOpacity > 0.4;
  const isWarm = sunProgress > 0.55;
  const cloudTint = isNight ? "#8fa0b8" : isWarm ? "#fff3e2" : "#ffffff";

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
      <CrossfadedGradient colors={skyColors} easeMs={easeMs} fractionalHour={fractionalHour} />

      {/* 2. Aurora Dark Sky Overlay (Matches the exact Night Sky color ramp stops on Native; renders the high-fidelity HTML/CSS AuroraSky on Web) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: auroraFade }]} pointerEvents="none">
        {Platform.OS === "web" ? (
          <AuroraSky />
        ) : (
          <LinearGradient
            colors={AURORA_SKY_COLORS}
            locations={[0, 0.40, 0.78, 1.0]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        )}
      </Animated.View>

      {/* 3. Deep Space: Stars (Always visible on night sky background, even with Aurora active) */}
      <Stars
        opacity={nightOpEased}
        twinkleOpacity={starTwinkleBurst}
        w={containerW}
        h={containerH}
      />

      {/* 4. Deep Space: Shooting Star / Meteor Shower (Triggered when user is happy at night/evening) */}
      <MeteorShower
        trigger={showHappyNight}
        w={containerW}
        h={containerH}
      />

      {/* 5. Celestial bodies: Sun & Moon (Controlled to fade out completely when Aurora is active) */}
      <GlowingCornerSun discOpacity={sunOpacityControlled} auraOpacity={happySunAuraFade} />
      <Moon opacity={moonOpacityControlled} happyNightOpacity={happyNightFade} />

      {/* 6. Atmosphere Layer: Clouds (Layered on top of stars/celestial bodies. Opacity fades to 0 when Aurora is active) */}
      <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={{
            position: "absolute",
            top: 10,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.85),
            transform: [{ translateX: cloud1X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.85} tint={cloudTint} scale={1} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 75,
            left: containerW * 0.38,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.78),
            transform: [{ translateX: cloud2X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.78} tint={cloudTint} scale={0.92} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 140,
            left: containerW * 0.1,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.45),
            transform: [{ translateX: cloud3X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.45} tint={cloudTint} scale={0.82} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 195,
            left: containerW * 0.52,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.35),
            transform: [{ translateX: cloud4X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.35} tint={cloudTint} scale={0.75} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 255,
            left: containerW * 0.05,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.28),
            transform: [{ translateX: cloud5X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.28} tint={cloudTint} scale={0.85} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 335,
            left: containerW * 0.48,
            opacity: Animated.multiply(cloudOpacityMultiplier, 0.20),
            transform: [{ translateX: cloud6X }],
          }}
          pointerEvents="none"
        >
          <FluffyCloud opacity={0.20} tint={cloudTint} scale={0.78} />
        </Animated.View>
      </Animated.View>

      {/* 7. Rainbow Arc (daytime happy only) */}
      <RainbowArc
        isDaytime={isDaytime}
        userMood={weatherState}
        containerW={containerW}
        containerH={containerH}
      />

      {/* 8. Gloomy weather / Overcast Sky Veil */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#0b1329", opacity: rainGloomyDimFade },
        ]}
        pointerEvents="none"
      />

      {/* 9. Downpour Rainstorm Engine */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: rainDownpourFade }]} pointerEvents="none">
        <RainBackground active={weatherState === "rain"} />
      </Animated.View>

      {/* 10. Aurora — WebGL shader on web, animated curtains on native */}
      {Platform.OS === "web"
        ? <AuroraShaderBackground opacity={auroraFade} />
        : <AuroraCurtains opacity={auroraFade} />}

      {/* 11. Mountain Skyline (native only) */}
      {Platform.OS !== "web" && <MountainSkyline opacity={Animated.multiply(auroraFade, 0.85)} w={containerW} h={containerH} />}
    </View>
  );
}

function MountainSkyline({ opacity, w, h }: { opacity: any; w: number; h: number }) {
  const mountH = 340; // max mountain height at the bottom
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: mountH,
        opacity,
      }}
      pointerEvents="none"
    >
      <Svg width={w} height={mountH} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Solid deep obsidian black silhouette */}
          <SvgLinearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#03050c" stopOpacity="0.96" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="1.0" />
          </SvgLinearGradient>
          {/* Auroral green/teal rim light highlighting the steep slope edge */}
          <SvgLinearGradient id="mountainRimGrad" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
            <Stop offset="50%" stopColor="#70ffb0" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#00ffcc" stopOpacity="0.6" />
          </SvgLinearGradient>
        </Defs>
        {/* Main slanted mountain silhouette (steep slope slanted bottom-left to top-right) */}
        <Path
          d={`M 0 ${mountH} L 0 ${mountH - 50} Q ${w * 0.4} ${mountH - 100}, ${w} ${mountH - 270} L ${w} ${mountH} Z`}
          fill="url(#mountainGrad)"
        />
        {/* Glowing auroral rim outline along the crest of the steep slope */}
        <Path
          d={`M 0 ${mountH - 50} Q ${w * 0.4} ${mountH - 100}, ${w} ${mountH - 270}`}
          fill="none"
          stroke="url(#mountainRimGrad)"
          strokeWidth="3.5"
          opacity={0.85}
        />
      </Svg>
    </Animated.View>
  );
}
