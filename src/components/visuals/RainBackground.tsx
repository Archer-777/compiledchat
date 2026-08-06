import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  thickness: number;
  alpha: number;
};

type Splash = { x: number; y: number; r: number; life: number; max: number };

type Cloud = {
  x: number;
  y: number;
  scale: number;
  speed: number;
  alpha: number;
  blobs: { dx: number; dy: number; r: number }[];
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Lovable's HTML5 Canvas 60 FPS Live Downpour Rain Engine.
 * Features: 7-blob radial dark storm clouds, slanted rainfall with shimmer,
 * bottom splash ripples, and subtle lightning flashes.
 */
export function RainBackground({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let drops: Drop[] = [];
    let clouds: Cloud[] = [];
    let splashes: Splash[] = [];
    let raf = 0;
    let last = performance.now();
    let flash = 0;
    let nextFlash = rand(4000, 12000);

    const makeCloud = (offscreen: boolean): Cloud => {
      const scale = rand(0.7, 1.6);
      const blobs = Array.from({ length: 7 }, () => ({
        dx: rand(-1, 1) * 140 * scale,
        dy: rand(-0.3, 0.25) * 55 * scale,
        r: rand(55, 120) * scale,
      }));
      return {
        x: offscreen ? width + rand(200, 700) : rand(-200, width + 200),
        y: rand(-50, height * 0.28),
        scale,
        speed: rand(2, 6) * scale * 0.5,
        alpha: rand(0.4, 0.75),
        blobs,
      };
    };

    const makeDrop = (top: boolean): Drop => {
      const depth = Math.random();
      return {
        x: rand(-0.15 * width, width * 1.05),
        y: top ? rand(-height, 0) : rand(0, height),
        len: rand(6, 12) + depth * 16,
        speed: 130 + depth * 220,
        thickness: 0.5 + depth * 0.9,
        alpha: 0.18 + depth * 0.4,
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dropCount = Math.round(
        Math.min(340, Math.max(120, (width * height) / 3400)),
      );
      drops = Array.from({ length: dropCount }, () => makeDrop(false));
      clouds = Array.from({ length: 5 }, () => makeCloud(false));
      splashes = [];
    };

    const drawCloud = (c: Cloud) => {
      ctx.save();
      ctx.globalAlpha = c.alpha;
      for (const b of c.blobs) {
        const x = c.x + b.dx;
        const y = c.y + b.dy;
        const g = ctx.createRadialGradient(
          x,
          y - b.r * 0.35,
          b.r * 0.1,
          x,
          y,
          b.r,
        );
        g.addColorStop(0, "rgba(112, 128, 156, 0.85)");
        g.addColorStop(0.45, "rgba(72, 85, 110, 0.5)");
        g.addColorStop(1, "rgba(40, 48, 66, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, width, height);

      for (const c of clouds) {
        c.x -= c.speed * dt;
        if (c.x < -350 * c.scale) {
          Object.assign(c, makeCloud(true));
        }
        drawCloud(c);
      }

      nextFlash -= dt * 1000;
      if (nextFlash <= 0) {
        flash = 1;
        nextFlash = rand(6000, 16000);
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(190, 205, 230, ${flash * 0.1})`;
        ctx.fillRect(0, 0, width, height);
        flash = Math.max(0, flash - dt * 3.2);
      }

      const slant = 0.16;
      ctx.lineCap = "round";
      for (const d of drops) {
        d.y += d.speed * dt;
        d.x += d.speed * dt * slant;

        const shimmer = 0.6 + 0.4 * Math.sin(now * 0.006 + d.x * 0.05 + d.y * 0.02);
        ctx.strokeStyle = `rgba(214, 230, 250, ${d.alpha * shimmer})`;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * slant, d.y - d.len);
        ctx.stroke();

        if (d.y > height) {
          if (Math.random() < 0.18 && splashes.length < 60) {
            splashes.push({
              x: d.x,
              y: height - rand(0, 6),
              r: 0,
              life: 0,
              max: rand(0.35, 0.7),
            });
          }

          Object.assign(d, makeDrop(true));
          d.y = rand(-height * 0.4, -10);
        }
        if (d.x > width * 1.1) d.x = -0.1 * width;
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        if (!s) continue;
        s.life += dt;

        const t = s.life / s.max;
        if (t >= 1) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(200, 220, 245, ${(1 - t) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 2 + t * 12, (2 + t * 12) * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      frame(last);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  if (!active || Platform.OS !== "web") return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0b0f16" }]} />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </View>
  );
}

export default RainBackground;
