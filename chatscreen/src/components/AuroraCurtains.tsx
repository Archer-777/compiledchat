import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import Svg, { Path, G, Mask, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Filter, FeGaussianBlur } from "react-native-svg";

const STRANDS = [
  {
    d: "M 150 480 C 220 320, 100 160, 380 -50",
    color: "rgba(60, 255, 150, 0.8)", // glowing emerald green
    width: 65,
    blurId: "blur-18",
    stdDev: 18,
    animCss: "aurora-sway-a 22s ease-in-out infinite",
    opacity: 0.9,
    nativeDuration: 22000,
    nativeDistX: 25,
    nativeDistY: -10,
  },
  {
    d: "M 320 480 C 390 320, 250 160, 550 -50",
    color: "rgba(40, 255, 210, 0.85)", // glowing teal-green
    width: 55,
    blurId: "blur-16",
    stdDev: 16,
    animCss: "aurora-sway-b 17s ease-in-out infinite",
    opacity: 1,
    nativeDuration: 17000,
    nativeDistX: -20,
    nativeDistY: 10,
  },
  {
    d: "M 480 480 C 550 320, 420 160, 720 -50",
    color: "rgba(139, 92, 246, 0.45)", // soft violet wash
    width: 85,
    blurId: "blur-25",
    stdDev: 25,
    animCss: "aurora-sway-c 29s ease-in-out infinite",
    opacity: 0.8,
    nativeDuration: 29000,
    nativeDistX: 30,
    nativeDistY: -15,
  },
  {
    d: "M -20 480 C 40 320, -50 160, 200 -50",
    color: "rgba(80, 255, 120, 0.75)", // lime green
    width: 50,
    blurId: "blur-16",
    stdDev: 16,
    animCss: "aurora-sway-b 35s ease-in-out infinite reverse",
    opacity: 0.75,
    nativeDuration: 35000,
    nativeDistX: -25,
    nativeDistY: 12,
  },
  {
    d: "M 640 480 C 720 320, 580 160, 850 -50",
    color: "rgba(65, 245, 170, 0.65)", // pale mint green
    width: 70,
    blurId: "blur-22",
    stdDev: 22,
    animCss: "aurora-sway-a 26s ease-in-out infinite reverse",
    opacity: 0.95,
    nativeDuration: 26000,
    nativeDistX: 18,
    nativeDistY: -8,
  },
];

function NativeStrandItem({ strand }: { strand: typeof STRANDS[number] }) {
  const val = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(val, {
          toValue: 1,
          duration: strand.nativeDuration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(val, {
          toValue: 0,
          duration: strand.nativeDuration / 2,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [val, strand.nativeDuration]);

  const translateX = val.interpolate({
    inputRange: [0, 1],
    outputRange: [0, strand.nativeDistX],
  });
  const translateY = val.interpolate({
    inputRange: [0, 1],
    outputRange: [0, strand.nativeDistY],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX }, { translateY }] },
      ]}
      pointerEvents="none"
    >
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 800 450"
        preserveAspectRatio="none"
      >
        <Defs>
          {/* Explicit filter bounds relative to user space to prevent clipping with zero-height line boxes */}
          <Filter id={strand.blurId} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="900">
            <FeGaussianBlur stdDeviation={strand.stdDev} />
          </Filter>
          <SvgLinearGradient id="maskGradNative" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <Stop offset="40%" stopColor="#ffffff" stopOpacity="0.80" />
            <Stop offset="75%" stopColor="#ffffff" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </SvgLinearGradient>
          <Mask id="auroraFadeMaskNative" x="0" y="0" width="800" height="450">
            <Rect x="0" y="0" width="800" height="450" fill="url(#maskGradNative)" />
          </Mask>
        </Defs>
        <G mask="url(#auroraFadeMaskNative)">
          <Path
            d={strand.d}
            fill="none"
            stroke={strand.color}
            strokeWidth={strand.width}
            strokeLinecap="round"
            opacity={strand.opacity}
            filter={`url(#${strand.blurId})`}
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

interface AuroraCurtainsProps {
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
}

/**
 * AuroraCurtains: Framed in Top 40% of screen.
 */
export function AuroraCurtains({ opacity }: AuroraCurtainsProps) {
  const isWeb = Platform.OS === "web";

  return (
    <Animated.View
      style={[
        styles.topContainer,
        { opacity },
      ]}
      pointerEvents="none"
    >
      {isWeb ? (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 800 450"
          preserveAspectRatio="none"
        >
          <Defs>
            {STRANDS.map((s) => (
              <Filter id={s.blurId} key={s.blurId} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="900">
                <FeGaussianBlur stdDeviation={s.stdDev} />
              </Filter>
            ))}
            <SvgLinearGradient id="maskGradWeb" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <Stop offset="40%" stopColor="#ffffff" stopOpacity="0.80" />
              <Stop offset="75%" stopColor="#ffffff" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </SvgLinearGradient>
            <Mask id="auroraFadeMaskWeb" x="0" y="0" width="800" height="450">
              <Rect x="0" y="0" width="800" height="450" fill="url(#maskGradWeb)" />
            </Mask>
          </Defs>
          <G style={{ mixBlendMode: "screen" } as any} mask="url(#auroraFadeMaskWeb)">
            {STRANDS.map((s, i) => (
              <G
                key={i}
                className="aurora-strand"
                style={{ animation: s.animCss } as any}
              >
                <Path
                  d={s.d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  opacity={s.opacity}
                  filter={`url(#${s.blurId})`}
                  style={{ filter: `url(#${s.blurId})` } as any}
                />
              </G>
            ))}
          </G>
        </Svg>
      ) : (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {STRANDS.map((s, i) => (
            <NativeStrandItem key={i} strand={s} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%", // Exactly 40% of screen height
    overflow: "hidden",
    zIndex: 1,
  },
});
