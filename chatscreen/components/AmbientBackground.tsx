import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Ellipse, Defs, RadialGradient, Stop } from "react-native-svg";
import { TimeMode } from "./useChatAmbientBackground";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const GRADIENTS: Record<TimeMode, string[]> = {
  day: ["#8fb8d8", "#c9ddb8", "#f2e2b8"],       // soft daylight haze, sky -> warm horizon
  evening: ["#3d1f52", "#8a4a6b", "#e8a15c"],   // dusk purple -> warm twilight orange
  night: ["#050507", "#0a0a12", "#10142b"],     // obsidian -> midnight blue
};

function useLoopingDrift(duration: number, distance = 24) {
  const val = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(val, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [val, duration]);
  return val.interpolate({ inputRange: [0, 1], outputRange: [-distance, distance] });
}

function useFade(active: boolean, duration = 1500) {
  const val = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(val, { toValue: active ? 1 : 0, duration, useNativeDriver: true }).start();
  }, [active, duration, val]);
  return val;
}

/** Sun + two drifting cloud layers for the day scene. */
function DayScene() {
  const cloud1X = useLoopingDrift(14000, 30);
  const cloud2X = useLoopingDrift(19000, 22);

  return (
    <>
      <Svg width={SCREEN_W} height={200} style={{ position: "absolute", top: 40, left: SCREEN_W / 2 - 60 }}>
        <Defs>
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff6d8" stopOpacity="1" />
            <Stop offset="60%" stopColor="#ffe08a" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="60" cy="60" r="55" fill="url(#sunGlow)" />
        <Circle cx="60" cy="60" r="26" fill="#fff3c4" />
      </Svg>

      <Animated.View style={[styles.cloudLayer, { top: 90, transform: [{ translateX: cloud1X }] }]}>
        <CloudShape opacity={0.9} scale={1} />
      </Animated.View>
      <Animated.View style={[styles.cloudLayer, { top: 160, left: SCREEN_W * 0.4, transform: [{ translateX: cloud2X }] }]}>
        <CloudShape opacity={0.75} scale={0.75} />
      </Animated.View>
    </>
  );
}

function CloudShape({ opacity = 1, scale = 1 }: { opacity?: number; scale?: number }) {
  return (
    <Svg width={160 * scale} height={60 * scale} viewBox="0 0 160 60">
      <Ellipse cx="55" cy="35" rx="45" ry="22" fill="#ffffff" opacity={opacity} />
      <Ellipse cx="95" cy="28" rx="35" ry="18" fill="#ffffff" opacity={opacity} />
      <Ellipse cx="75" cy="20" rx="30" ry="16" fill="#ffffff" opacity={opacity} />
    </Svg>
  );
}

/** Simple twinkling star field for the night scene. */
function NightScene() {
  const stars = useRef(
    Array.from({ length: 24 }).map(() => ({
      x: Math.random() * SCREEN_W,
      y: Math.random() * (SCREEN_H * 0.5),
      r: Math.random() * 1.4 + 0.6,
      delay: Math.random() * 3000,
    }))
  ).current;

  return (
    <Svg width={SCREEN_W} height={SCREEN_H * 0.5} style={{ position: "absolute", top: 0, left: 0 }}>
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={0.7} />
      ))}
    </Svg>
  );
}

/** 4 blurred-look glow blobs used for the 3-minute aurora reveal. */
function AuroraBlobs({ auroraActive }: { auroraActive: boolean }) {
  const fade = useFade(auroraActive);
  const drift1 = useLoopingDrift(9000, 18);
  const drift2 = useLoopingDrift(13000, 26);
  const drift3 = useLoopingDrift(11000, 20);
  const drift4 = useLoopingDrift(15000, 24);

  const blob = (color: string, size: number, top: number, left: number, driftX: Animated.AnimatedInterpolation<number>) => (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: Animated.multiply(fade, 0.55),
        transform: [{ translateX: driftX }],
      }}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {blob("#8b5cf6", 260, -40, -40, drift1)}
      {blob("#4f46e5", 300, 30, SCREEN_W - 220, drift2)}
      {blob("#d4af5a55" as string, 220, SCREEN_H * 0.55, 60, drift3)}
      {blob("#2dd4bf", 240, SCREEN_H * 0.6, SCREEN_W - 260, drift4)}
    </View>
  );
}

interface AmbientBackgroundProps {
  timeMode: TimeMode;
  auroraActive: boolean;
}

/** Full-bleed background: put this as the FIRST child, absolutely filled,
 *  then render your chat UI on top of it (see integration notes). */
export function AmbientBackground({ timeMode, auroraActive }: AmbientBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={GRADIENTS[timeMode]} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      {timeMode === "day" && <DayScene />}
      {timeMode === "night" && <NightScene />}
      <AuroraBlobs auroraActive={auroraActive} />
    </View>
  );
}

const styles = StyleSheet.create({
  cloudLayer: {
    position: "absolute",
  },
});
