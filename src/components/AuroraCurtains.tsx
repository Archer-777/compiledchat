import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import Svg, { Path, G } from "react-native-svg";

const STRANDS = [
  {
    d: "M-100 240 C 120 180, 220 100, 380 40 S 620 -40, 760 -80",
    color: "rgba(70,255,160,0.85)",
    width: 70,
    blur: 28,
    animCss: "aurora-sway-a 22s ease-in-out infinite",
    opacity: 0.9,
    nativeDuration: 22000,
    nativeDistX: 20,
    nativeDistY: -10,
  },
  {
    d: "M-120 280 C 100 200, 260 140, 420 70 S 680 10, 840 -20",
    color: "rgba(140,255,190,0.75)",
    width: 36,
    blur: 14,
    animCss: "aurora-sway-b 17s ease-in-out infinite",
    opacity: 1,
    nativeDuration: 17000,
    nativeDistX: -15,
    nativeDistY: 10,
  },
  {
    d: "M-60 300 C 160 240, 300 180, 470 110 S 700 40, 900 10",
    color: "rgba(30,220,255,0.6)",
    width: 48,
    blur: 22,
    animCss: "aurora-sway-c 29s ease-in-out infinite",
    opacity: 0.8,
    nativeDuration: 29000,
    nativeDistX: 22,
    nativeDistY: -14,
  },
  {
    d: "M-140 200 C 60 150, 200 90, 330 20 S 520 -60, 640 -100",
    color: "rgba(150,110,255,0.5)",
    width: 80,
    blur: 35,
    animCss: "aurora-sway-b 35s ease-in-out infinite reverse",
    opacity: 0.75,
    nativeDuration: 35000,
    nativeDistX: -18,
    nativeDistY: 12,
  },
  {
    d: "M-80 320 C 200 260, 380 200, 560 130 S 820 60, 980 30",
    color: "rgba(90,255,140,0.65)",
    width: 22,
    blur: 8,
    animCss: "aurora-sway-a 26s ease-in-out infinite reverse",
    opacity: 0.95,
    nativeDuration: 26000,
    nativeDistX: 16,
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
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMin slice"
      >
        <Path
          d={strand.d}
          fill="none"
          stroke={strand.color}
          strokeWidth={strand.width}
          strokeLinecap="round"
          opacity={strand.opacity}
        />
      </Svg>
    </Animated.View>
  );
}

interface AuroraCurtainsProps {
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
}

/**
 * AuroraCurtains: Framed in Top 30% of screen.
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
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMin slice"
        >
          <G style={{ mixBlendMode: "screen" } as any}>
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
                  style={{ filter: `blur(${s.blur}px)` } as any}
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
    height: "30%", // Exactly 30% of screen height
    overflow: "hidden",
    zIndex: 1,
  },
});
