import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import Svg, { Path, Defs, Filter, FeGaussianBlur } from "react-native-svg";

interface RainbowArcProps {
  isDaytime: boolean;
  userMood: "happy" | "neutral" | "sad" | string;
  /** Container width from parent onLayout — avoids Dimensions.get('window') web bug */
  containerW: number;
  /** Container height from parent onLayout — avoids Dimensions.get('window') web bug */
  containerH: number;
}

export function RainbowArc({ isDaytime, userMood, containerW, containerH }: RainbowArcProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const shouldShow = isDaytime && userMood === "happy";

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
    }

    if (shouldShow) {
      // Sequence: Smooth 3s fade in -> Hold for 32 seconds (admire duration) -> 5s slow fade out
      animRef.current = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 3000,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.delay(32000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]);
      animRef.current.start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }

    return () => {
      if (animRef.current) animRef.current.stop();
    };
  }, [shouldShow]);

  // Construct wide, realistic SVG Semicircle Arc Path (∩) spanning upper sky
  const w = containerW || 380;
  const startX = -35;
  const endX = w + 35;
  const baseBaselineY = 175;

  // Helper to build wide, overlapping concentric dome arc paths
  const getArcPath = (offset: number) => {
    const rx = (w / 2) + 35 - offset;
    const ry = 125 - offset;
    const baselineY = baseBaselineY - offset * 0.45;
    return `M ${startX + offset} ${baselineY} A ${rx} ${ry} 0 0 1 ${endX - offset} ${baselineY}`;
  };

  // Wide, blended spectral bands (Red outer -> Violet inner)
  const colors = [
    { color: "rgba(255, 45, 45, 0.65)", offset: 0 },    // Red outer
    { color: "rgba(255, 140, 0, 0.62)", offset: 6 },    // Orange
    { color: "rgba(255, 230, 40, 0.58)", offset: 12 },   // Yellow
    { color: "rgba(40, 220, 90, 0.52)", offset: 18 },   // Green
    { color: "rgba(35, 145, 255, 0.48)", offset: 24 },  // Blue
    { color: "rgba(135, 45, 245, 0.42)", offset: 30 },  // Violet inner
  ];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    >
      <Svg
        width={w}
        height={containerH || 800}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          {/* Soft Gaussian blur filter for realistic photorealistic rainbow blending */}
          <Filter id="rainbowSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="5.5" />
          </Filter>
        </Defs>

        {colors.map((c, i) => (
          <Path
            key={i}
            d={getArcPath(c.offset)}
            fill="none"
            stroke={c.color}
            strokeWidth={9}
            strokeLinecap="round"
            filter="url(#rainbowSoftBlur)"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
