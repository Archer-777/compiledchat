# WebGL Aurora Effect — Code Implementation Guide

Share this guide with your friend to compile the new WebGL Aurora shader and background depth layout.

---

### File 1: Create `src/components/AuroraShaderBackground.web.tsx`
Create this new file to handle the WebGL rendering loop and GLSL shaders on the web platform:

```tsx
/**
 * AuroraShaderBackground.web.tsx
 *
 * Web-only component that runs the WebGL GLSL aurora shader directly on a DOM canvas.
 * Platform-specific file — only bundled on Expo Web (`.web.tsx` suffix).
 */
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface Props {
  opacity: Animated.Value | number;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = v_texCoord;

    // Rich cosmic background gradient with highly visible depth in the bottom half
    vec3 skyTop    = vec3(0.02, 0.11, 0.15);   // bright glowing auroral teal
    vec3 skyMid    = vec3(0.04, 0.03, 0.09);   // twilight indigo/purple
    vec3 skyBottom = vec3(0.01, 0.025, 0.05);  // deep glowing teal-blue/indigo

    vec3 baseSky = uv.y > 0.5 
      ? mix(skyMid, skyTop, (uv.y - 0.5) * 2.0)
      : mix(skyBottom, skyMid, uv.y * 2.0);

    // Visible, slow-moving cosmic nebula cloud layer across the entire screen
    float nebNoise = snoise(uv * vec2(0.5, 0.3) + vec2(u_time * 0.012, -u_time * 0.006));
    vec3 nebTeal   = vec3(0.015, 0.08, 0.10);
    vec3 nebPurple = vec3(0.05, 0.02, 0.08);
    vec3 nebulaColor = mix(nebTeal, nebPurple, nebNoise * 0.5 + 0.5);

    // Overlay nebula with 55% intensity across the entire screen (including bottom)
    vec3 backgroundColor = baseSky + nebulaColor * 0.55;

    // Twinkling starfield
    float starSelection = fract(sin(dot(uv * 120.0, vec2(12.9898, 78.233))) * 43758.5453);
    float starIntensity = smoothstep(0.996, 1.0, starSelection);
    starIntensity *= (0.7 + 0.3 * sin(u_time * 1.5 + starSelection * 20.0));
    // Stars slightly dimmer where aurora is (top half)
    starIntensity *= 1.0 - smoothstep(0.50, 1.0, uv.y) * 0.55;
    vec3 stars = vec3(starIntensity);

    // Aurora curtain layers — top 40% only, with super-soft linear dissolve into sky
    vec3 finalAurora = vec3(0.0);
    for(float i = 0.0; i < 4.0; i++) {
      float t = u_time * (0.1 + i * 0.02);
      
      // Calculate noise and folds for the curtain shape
      float n1 = snoise(uv * vec2(1.0, 0.2) + vec2(t, t * 0.1));
      float n2 = snoise(uv * vec2(2.5, 0.5) - vec2(t * 1.2, -t * 0.05));
      float fold = sin(uv.x * 4.0 + n1 * 2.0 + t);
      float mask = smoothstep(0.15, 0.5, abs(n1 + n2 * 0.5 + fold * 0.2));

      // 1. Soft vertical fade-out: starts fading at y=0.85, completely gone at y=0.45
      // 2. Linear scaling (applied AFTER pow) gives a super-soft natural blending edge
      float heightFade = smoothstep(0.45, 0.85, uv.y);

      // Vivid green, icy blue, and deep violet colors
      vec3 green  = vec3(0.05, 0.95, 0.35);  // vibrant emerald green
      vec3 blue   = vec3(0.02, 0.55, 1.00);  // deep icy blue
      vec3 violet = vec3(0.50, 0.15, 0.90);  // magical violet

      // Spatial & Temporal color blending:
      // Mix green and blue horizontally along folds AND vertically by altitude
      float colorNoise = snoise(uv * vec2(1.2, 0.6) + vec2(t * 0.4, -t * 0.1));
      float horizontalMix = sin(uv.x * 3.5 + colorNoise * 1.5 + t * 0.6) * 0.5 + 0.5;
      float verticalMix = smoothstep(0.50, 0.88, uv.y); // blue/violet higher up, green lower down

      // Combine mixes: 60% horizontal wave pattern, 40% vertical altitude gradient
      float mixFactor = mix(horizontalMix, verticalMix, 0.4);
      vec3 layerCol = mix(green, blue, mixFactor);

      // Add violet tint near the top edge and bottom dissolve boundary
      float violetMix = (1.0 - heightFade) * 0.25 + smoothstep(0.85, 1.0, uv.y) * 0.20;
      layerCol = mix(layerCol, violet, violetMix);

      // Apply pow to the mask for sharp folds, then multiply by linear heightFade for soft blending
      float intensity = pow(mask, 2.2) * heightFade;

      // Brightness: 0.42 (perfect balance of vividness and transparency)
      finalAurora += layerCol * intensity * (0.42 / (i + 1.0));
    }

    vec3 color = backgroundColor + stars + finalAurora;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function AuroraShaderBackground({ opacity }: Props) {
  const containerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const opacityValRef = useRef<number>(0);

  useEffect(() => {
    // Keep track of opacity to throttle/skip drawing when invisible
    let listenerId: string | null = null;
    if (opacity instanceof Animated.Value) {
      opacityValRef.current = (opacity as any)._value ?? 0;
      listenerId = opacity.addListener(({ value }) => {
        opacityValRef.current = value;
      });
    } else if (typeof opacity === "number") {
      opacityValRef.current = opacity;
    }

    return () => {
      if (listenerId && opacity instanceof Animated.Value) {
        opacity.removeListener(listenerId);
      }
    };
  }, [opacity]);

  useEffect(() => {
    // Get the underlying DOM node from the React Native View ref
    const container: HTMLElement | null = containerRef.current;
    if (!container) return;

    // Create a canvas and append it to the container
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      container.removeChild(canvas);
      return;
    }

    // Size sync
    function syncSize() {
      const w = container!.clientWidth || window.innerWidth;
      const h = container!.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    window.addEventListener("resize", syncSize);
    syncSize();

    // Build program
    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let lastActive = true;

    // Render loop
    function render(t: number) {
      // If opacity is 0, clear WebGL canvas once and halt shader computation
      if (opacityValRef.current <= 0) {
        if (lastActive) {
          gl!.clearColor(0, 0, 0, 0);
          gl!.clear(gl!.COLOR_BUFFER_BIT);
          lastActive = false;
        }
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      
      lastActive = true;
      syncSize();
      gl!.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl!.uniform1f(uTime, t * 0.001);
      if (uRes) gl!.uniform2f(uRes, canvas.width, canvas.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", syncSize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <Animated.View
      ref={containerRef}
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    />
  );
}
```

---

### File 2: Create `src/components/AuroraShaderBackground.tsx`
Create this new file to act as the native platform no-op fallback so the app compiles on mobile (where svg curtains are used):

```tsx
/**
 * AuroraShaderBackground.tsx  (Native fallback)
 *
 * On iOS/Android, we don't have a DOM canvas, so this is a no-op.
 * The native AuroraCurtains component is used instead (in AmbientBackground.tsx).
 */
import React from "react";

interface Props {
  opacity?: number;
}

export function AuroraShaderBackground(_props: Props) {
  // Native: aurora is rendered by AuroraCurtains — nothing to render here.
  return null;
}
```

---

### File 3: Modify `src/components/AmbientBackground.tsx`
Apply the following diff modifications:

```diff
 import { AuroraCurtains } from "./AuroraCurtains";
+import { AuroraShaderBackground } from "./AuroraShaderBackground";
 import { RainBackground } from "./RainBackground";
 
...
 
-      {/* 10. Aurora Curtains (Fades in on top of sky/stars/clouds, extending beautifully down to 40% height) */}
-      {Platform.OS !== "web" && <AuroraCurtains opacity={auroraFade} />}
+      {/* 10. Aurora — WebGL shader on web, animated curtains on native */}
+      {Platform.OS === "web"
+        ? <AuroraShaderBackground opacity={auroraFade} />
+        : <AuroraCurtains opacity={auroraFade} />}
```
