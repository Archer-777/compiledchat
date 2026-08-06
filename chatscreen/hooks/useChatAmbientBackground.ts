import { useEffect, useRef, useState } from "react";

export type TimeMode = "day" | "evening" | "night";

interface Options {
  testAurora?: boolean;
  now?: () => Date;
  auroraDelayMs?: number;
  clockPollMs?: number;
}

function getTimeMode(hour: number): TimeMode {
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function useChatAmbientBackground({
  testAurora = false,
  now = () => new Date(),
  auroraDelayMs = 180_000,
  clockPollMs = 60_000,
}: Options = {}) {
  const [timeMode, setTimeMode] = useState<TimeMode>(() => getTimeMode(now().getHours()));
  const [auroraActive, setAuroraActive] = useState(testAurora);

  useEffect(() => {
    const tick = () => setTimeMode(getTimeMode(now().getHours()));
    tick();
    const id = setInterval(tick, clockPollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockPollMs]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testAurora, auroraDelayMs]);

  return { timeMode, auroraActive };
}
