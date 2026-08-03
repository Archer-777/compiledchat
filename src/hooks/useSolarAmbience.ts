import { useEffect, useRef, useState } from "react";
import { daylightWindow } from "./solarMath";
import { getLatitudeForCountry } from "./countryLatitude";

/** One sky "keyframe": at this hour (0-24, can repeat past 24 for wrap
 *  interpolation), the sky's [top, mid, horizon] gradient looks like this. */
interface SkyKeyframe {
  hour: number;
  colors: [string, string, string];
}

/**
 * 24h color ramp. Add/adjust stops here — everything else (crossfade,
 * sun arc, moon/star fades) derives from this single timeline.
 */
const SKY_KEYFRAMES: SkyKeyframe[] = [
  { hour: 0,    colors: ["#04060e", "#090d1a", "#04060e"] },   // midnight space
  { hour: 4.5,  colors: ["#070912", "#0f1629", "#1d1933"] },   // pre-dawn
  { hour: 6,    colors: ["#2d5b88", "#5a9fd4", "#d49b6a"] },   // sunrise
  { hour: 8,    colors: ["#3b95d6", "#6ab3e2", "#d49b6a"] },   // morning cerulean sky (0 pink)
  { hour: 12,   colors: ["#3b95d6", "#6ab3e2", "#d49b6a"] },   // solar noon cerulean sky (0 pink)
  { hour: 15.5, colors: ["#3b95d6", "#6ab3e2", "#d49b6a"] },   // afternoon cerulean sky (0 pink)
  { hour: 17.5, colors: ["#2c4d75", "#5a9fd4", "#d49b6a"] },   // early dusk
  { hour: 19,   colors: ["#1c1836", "#5a3a68", "#d98a52"] },   // sunset
  { hour: 20.5, colors: ["#090c1a", "#10152b", "#171d38"] },   // late dusk
  { hour: 24,   colors: ["#04060e", "#090d1a", "#04060e"] },   // wraps to midnight
];

const GENERIC_SUNRISE_HOUR = 6;
const GENERIC_SUNSET_HOUR = 19;
const EDGE_FADE_HOURS = 0.5; // sun/moon crossfade window at each horizon

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: [number, number, number]) {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerpColor(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/** Interpolates the 3-stop sky gradient for an arbitrary fractional hour (0-24). */
function skyColorsAt(hour: number): [string, string, string] {
  const h = ((hour % 24) + 24) % 24;
  let lower = SKY_KEYFRAMES[0];
  let upper = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1];
  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (h >= SKY_KEYFRAMES[i].hour && h <= SKY_KEYFRAMES[i + 1].hour) {
      lower = SKY_KEYFRAMES[i];
      upper = SKY_KEYFRAMES[i + 1];
      break;
    }
  }
  const span = upper.hour - lower.hour || 1;
  const t = (h - lower.hour) / span;
  return [
    lerpColor(lower.colors[0], upper.colors[0], t),
    lerpColor(lower.colors[1], upper.colors[1], t),
    lerpColor(lower.colors[2], upper.colors[2], t),
  ];
}

/** ease-in-out, used for the sun's rise/set arc so it hangs near the
 *  horizon and moves faster through the middle of the sky — matches how
 *  the sun visually appears to move in real life. */
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export interface SolarState {
  /** Current [top, mid, horizon] sky colors for this instant. */
  skyColors: [string, string, string];
  /** 0 = at horizon, 1 = directly overhead. Use to place the sun/moon vertically. */
  sunAltitude: number;
  /** 0 = at sunrise edge (east), 1 = at sunset edge (west). Horizontal placement. */
  sunProgress: number;
  /** 0-1 fade for the sun disc/glow (handles the rise/set edge crossfade). */
  sunOpacity: number;
  /** 0-1 fade for moon + stars (roughly the inverse of sunOpacity, softened). */
  nightOpacity: number;
  /** raw fractional hour, 0-24, for anything custom you want to derive. */
  fractionalHour: number;
}

function computeSolarState(fractionalHour: number, sunriseHour: number, sunsetHour: number): SolarState {
  const h = ((fractionalHour % 24) + 24) % 24;
  const skyColors = skyColorsAt(h);

  const dayLen = Math.max(sunsetHour - sunriseHour, 0.1); // guard against polar-night 0-length
  const dayT = (h - sunriseHour) / dayLen; // <0 before sunrise, >1 after sunset

  let sunAltitude = 0;
  let sunOpacity = 0;
  if (dayT >= -EDGE_FADE_HOURS / dayLen && dayT <= 1 + EDGE_FADE_HOURS / dayLen) {
    const clamped = Math.max(0, Math.min(1, dayT));
    sunAltitude = Math.sin(Math.PI * easeInOutSine(clamped));
    // fade in/out only within the edge window, full opacity mid-day
    const fadeIn = Math.min(1, Math.max(0, dayT / (EDGE_FADE_HOURS / dayLen)));
    const fadeOut = Math.min(1, Math.max(0, (1 - dayT) / (EDGE_FADE_HOURS / dayLen)));
    sunOpacity = Math.min(fadeIn, fadeOut, 1);
  }

  const sunProgress = Math.max(0, Math.min(1, dayT));
  const nightOpacity = 1 - sunOpacity;

  return { skyColors, sunAltitude, sunProgress, sunOpacity, nightOpacity, fractionalHour: h };
}

interface Options {
  testAurora?: boolean;
  auroraDelayMs?: number;
  /** How often (ms, wall-clock) to recompute + smoothly ease toward the
   *  new solar state. Lower = smoother motion, higher CPU. 15-30s is
   *  plenty for a slow sun drift. */
  pollMs?: number;
  /**
   * ISO 3166-1 alpha-2 country code (e.g. "IN", "US", "GB"), typically
   * from the user's login/profile. When provided, sunrise/sunset are
   * computed from that country's approximate latitude + today's date,
   * so the curve shifts with season and location instead of assuming
   * one fixed sunrise/sunset everywhere.
   *
   * Leave undefined for pre-login/anonymous sessions — the hook falls
   * back to a generic 6am/7pm curve rather than guessing or erroring.
   * The moment a country becomes available (post-login), just pass it
   * in and the curve improves automatically on the next render.
   */
  countryCode?: string;
  /**
   * Demo/QA only: if set, a full simulated 24h cycle plays out over this
   * many real milliseconds instead of using the real wall clock — e.g.
   * simulatedDayMs={120_000} compresses a day into 2 minutes so judges
   * can watch the sun move without waiting for real time to pass.
   * Leave undefined in production.
   */
  simulatedDayMs?: number;
  now?: () => Date;
}

export function useSolarAmbience({
  testAurora = false,
  auroraDelayMs = 180_000,
  pollMs = 20_000,
  countryCode,
  simulatedDayMs,
  now = () => new Date(),
}: Options = {}) {
  const simStart = useRef<number>(Date.now());
  const simStartHour = useRef<number>(now().getHours() + now().getMinutes() / 60);

  const getFractionalHour = () => {
    if (!simulatedDayMs) {
      const d = now();
      return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    }
    const elapsed = Date.now() - simStart.current;
    const hoursElapsed = (elapsed / simulatedDayMs) * 24;
    return simStartHour.current + hoursElapsed;
  };

  // Sunrise/sunset only need recomputing when the country changes or the
  // calendar day rolls over — no need to redo the trig on every poll tick.
  const sunWindowRef = useRef<{ sunrise: number; sunset: number }>({
    sunrise: GENERIC_SUNRISE_HOUR,
    sunset: GENERIC_SUNSET_HOUR,
  });
  const lastComputedDayRef = useRef<string | null>(null);

  const refreshSunWindow = () => {
    const today = now();
    const dayKey = `${today.toDateString()}|${countryCode ?? "none"}`;
    if (lastComputedDayRef.current === dayKey) return;
    lastComputedDayRef.current = dayKey;

    const lat = getLatitudeForCountry(countryCode);
    if (lat === undefined) {
      sunWindowRef.current = { sunrise: GENERIC_SUNRISE_HOUR, sunset: GENERIC_SUNSET_HOUR };
      return;
    }
    sunWindowRef.current = daylightWindow(lat, today);
  };

  const [solar, setSolar] = useState<SolarState>(() => {
    refreshSunWindow();
    return computeSolarState(getFractionalHour(), sunWindowRef.current.sunrise, sunWindowRef.current.sunset);
  });

  useEffect(() => {
    const tick = () => {
      refreshSunWindow();
      setSolar(computeSolarState(getFractionalHour(), sunWindowRef.current.sunrise, sunWindowRef.current.sunset));
    };
    const intervalMs = simulatedDayMs ? Math.max(250, simulatedDayMs / 200) : pollMs;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs, simulatedDayMs, countryCode]);

  // --- 3-minute session aurora trigger (resets on screen unmount/remount = new session) ---
  const [auroraActive, setAuroraActive] = useState(testAurora);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (testAurora) {
      setAuroraActive(true);
      return;
    }
    setAuroraActive(false);
    timerRef.current = setTimeout(() => setAuroraActive(true), auroraDelayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [testAurora, auroraDelayMs]);

  return { ...solar, auroraActive };
}
