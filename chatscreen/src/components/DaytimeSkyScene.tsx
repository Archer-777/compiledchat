// DaytimeSkyScene.tsx
// Exact-replica daytime sky matching the reference prototype:
//   - Deep cerulean blue (top) → warm sandy-peach (horizon) gradient
//   - Studio Ghibli-style volumetric clouds with blue-shadow undersides
//   - Sun in top-right corner with bright white lens flare glow
// Rendered as static SVG (no parallax drift) per design request.

import React from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  Rect,
  G,
  Circle,
  ClipPath,
  Image as SvgImage,
} from "react-native-svg";

interface DaytimeSkySceneProps {
  containerW: number;
  containerH: number;
}

/** Single fluffy cloud puff using a radial gradient for volume */
function CloudPuff({
  cx, cy, rx, ry,
  gradId,
}: { cx: number; cy: number; rx: number; ry: number; gradId: string }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${gradId})`} />;
}

export function DaytimeSkyScene({ containerW: W, containerH: H }: DaytimeSkySceneProps) {
  const S = W / 390; // scale factor relative to iPhone 14 reference width

  return (
    <Svg
      width={W}
      height={H}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        {/* ── Sky Gradient ─────────────────────────────────────────────── */}
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor="#2B7CB5" />
          <Stop offset="0.18" stopColor="#3E9BD4" />
          <Stop offset="0.38" stopColor="#6DB9DC" />
          <Stop offset="0.55" stopColor="#99CDE4" />
          <Stop offset="0.68" stopColor="#C8B08A" />
          <Stop offset="0.82" stopColor="#D4956A" />
          <Stop offset="1"    stopColor="#C8836A" />
        </LinearGradient>

        {/* ── Cloud Puff Gradients (white-top, blue-grey shadow) ──────── */}

        {/* Bright top-of-cloud puff */}
        <RadialGradient id="puffBright" cx="0.42" cy="0.3" r="0.7" gradientUnits="objectBoundingBox">
          <Stop offset="0"   stopColor="#FFFFFF" stopOpacity={1}    />
          <Stop offset="0.55" stopColor="#EEF5FA" stopOpacity={1}   />
          <Stop offset="1"   stopColor="#C8D8E8" stopOpacity={0.85} />
        </RadialGradient>

        {/* Mid cloud puff — slightly less bright */}
        <RadialGradient id="puffMid" cx="0.45" cy="0.28" r="0.7" gradientUnits="objectBoundingBox">
          <Stop offset="0"    stopColor="#F4F9FD" stopOpacity={1}    />
          <Stop offset="0.5"  stopColor="#DDE9F2" stopOpacity={1}    />
          <Stop offset="1"    stopColor="#BDD0DF" stopOpacity={0.9}  />
        </RadialGradient>

        {/* Cloud shadow base — blue-grey underside */}
        <RadialGradient id="puffShadow" cx="0.5" cy="0.2" r="0.7" gradientUnits="objectBoundingBox">
          <Stop offset="0"   stopColor="#AECCE0" stopOpacity={0.65} />
          <Stop offset="1"   stopColor="#8BB0C8" stopOpacity={0.45} />
        </RadialGradient>

        {/* Dim right-side cloud (partially behind sun) */}
        <RadialGradient id="puffRightDim" cx="0.38" cy="0.32" r="0.65" gradientUnits="objectBoundingBox">
          <Stop offset="0"   stopColor="#EEF4F8" stopOpacity={0.9}  />
          <Stop offset="0.6" stopColor="#C8D8E8" stopOpacity={0.85} />
          <Stop offset="1"   stopColor="#A8C0D4" stopOpacity={0.7}  />
        </RadialGradient>

        {/* Sun soft glow radial */}
        <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
          <Stop offset="0"    stopColor="#FFFFFF" stopOpacity={0.85} />
          <Stop offset="0.25" stopColor="#FFFDE0" stopOpacity={0.7}  />
          <Stop offset="0.55" stopColor="#FFF5A0" stopOpacity={0.4}  />
          <Stop offset="0.8"  stopColor="#FFDF60" stopOpacity={0.15} />
          <Stop offset="1"    stopColor="#FFFFFF" stopOpacity={0}    />
        </RadialGradient>

        {/* Sun circle clip path */}
        <ClipPath id="sunCircleClip">
          <Circle cx={W * 0.88} cy={H * 0.04} r={S * 26} />
        </ClipPath>
      </Defs>

      {/* ── 1. Sky background gradient ──────────────────────────────────── */}
      <Rect x={0} y={0} width={W} height={H} fill="url(#skyGrad)" />

      {/* ── 2. Sun — top-right corner with realistic glowing circle (Sun.jpeg) ── */}
      {/* Outer soft diffuse glow */}
      <Ellipse cx={W * 0.88} cy={H * 0.04} rx={S * 75} ry={S * 75} fill="url(#sunGlow)" />
      {/* Inner soft halo */}
      <Ellipse cx={W * 0.88} cy={H * 0.04} rx={S * 38} ry={S * 38} fill="url(#sunGlow)" />
      {/* Realistic Glowing Circle Sun Image */}
      <SvgImage
        href={require("../../assets/Sun.jpeg")}
        x={W * 0.88 - S * 26}
        y={H * 0.04 - S * 26}
        width={S * 52}
        height={S * 52}
        clipPath="url(#sunCircleClip)"
        opacity={0.88}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* ── 3. Cloud cluster — upper-left (large) ──────────────────────── */}
      {/* Shadow base */}
      <Ellipse cx={W * -0.08} cy={H * 0.155} rx={S * 175} ry={S * 30} fill="url(#puffShadow)" />
      <Ellipse cx={W * 0.22} cy={H * 0.16} rx={S * 130} ry={S * 24} fill="url(#puffShadow)" />
      {/* Cloud puffs */}
      <Ellipse cx={W * -0.04} cy={H * 0.10} rx={S * 115} ry={S * 55} fill="url(#puffBright)" />
      <Ellipse cx={W * 0.14}  cy={H * 0.08} rx={S * 95}  ry={S * 52} fill="url(#puffBright)" />
      <Ellipse cx={W * 0.28}  cy={H * 0.12} rx={S * 80}  ry={S * 44} fill="url(#puffMid)"    />
      <Ellipse cx={W * 0.08}  cy={H * 0.135} rx={S * 90} ry={S * 30} fill="url(#puffBright)" />
      {/* Small overlapping foreground puff */}
      <Ellipse cx={W * 0.38}  cy={H * 0.14} rx={S * 50}  ry={S * 32} fill="url(#puffMid)"   />

      {/* ── 4. Cloud cluster — upper-center-right (partially behind sun) ── */}
      {/* Shadow */}
      <Ellipse cx={W * 0.62} cy={H * 0.115} rx={S * 100} ry={S * 22} fill="url(#puffShadow)" />
      {/* Puffs */}
      <Ellipse cx={W * 0.58} cy={H * 0.07} rx={S * 72}  ry={S * 40} fill="url(#puffRightDim)" />
      <Ellipse cx={W * 0.72} cy={H * 0.065} rx={S * 60} ry={S * 36} fill="url(#puffRightDim)" />
      <Ellipse cx={W * 0.64} cy={H * 0.09} rx={S * 65}  ry={S * 28} fill="url(#puffRightDim)" />

      {/* ── 5. Cloud cluster — middle-right (large, prominent) ─────────── */}
      {/* Shadow base */}
      <Ellipse cx={W * 0.85} cy={H * 0.305} rx={S * 135} ry={S * 26} fill="url(#puffShadow)" />
      <Ellipse cx={W * 0.68} cy={H * 0.30} rx={S * 80}   ry={S * 20} fill="url(#puffShadow)" />
      {/* Puffs */}
      <Ellipse cx={W * 0.7}  cy={H * 0.25} rx={S * 80}  ry={S * 48} fill="url(#puffMid)"    />
      <Ellipse cx={W * 0.86} cy={H * 0.22} rx={S * 100} ry={S * 55} fill="url(#puffBright)" />
      <Ellipse cx={W * 1.0}  cy={H * 0.26} rx={S * 80}  ry={S * 48} fill="url(#puffBright)" />
      <Ellipse cx={W * 0.78} cy={H * 0.27} rx={S * 65}  ry={S * 32} fill="url(#puffBright)" />
      {/* Bottom smooth merge */}
      <Ellipse cx={W * 0.86} cy={H * 0.295} rx={S * 120} ry={S * 22} fill="url(#puffMid)"   />

      {/* ── 6. Cloud wisps — lower-left (around 50-55% height) ──────────── */}
      {/* Shadow */}
      <Ellipse cx={W * 0.1}  cy={H * 0.485} rx={S * 110} ry={S * 18} fill="url(#puffShadow)" />
      {/* Puffs */}
      <Ellipse cx={W * -0.06} cy={H * 0.45} rx={S * 90}  ry={S * 38} fill="url(#puffMid)"   />
      <Ellipse cx={W * 0.12}  cy={H * 0.43} rx={S * 75}  ry={S * 42} fill="url(#puffBright)" />
      <Ellipse cx={W * 0.26}  cy={H * 0.45} rx={S * 55}  ry={S * 32} fill="url(#puffMid)"   />

      {/* ── 7. Subtle sun-side lens flare artifact (top center-ish) ─────── */}
      <Ellipse
        cx={W * 0.38}
        cy={H * 0.10}
        rx={S * 22}
        ry={S * 22}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={S * 1.5}
        opacity={0.3}
      />
      {/* Hex shimmer (matches reference hexagonal flare) */}
      <Ellipse cx={W * 0.38} cy={H * 0.10} rx={S * 14} ry={S * 14} fill="#D4E8F0" opacity={0.25} />
    </Svg>
  );
}
