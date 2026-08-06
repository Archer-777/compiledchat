/**
 * Simplified solar-declination sunrise/sunset model. Returns fractional
 * local hours (e.g. 6.25 = 6:15am), centered on solar noon = 12:00.
 *
 * Trade-off, stated plainly: this ignores longitude-within-timezone and
 * the equation of time, so it can be off by up to ~30-60 min versus the
 * *exact* clock time of sunrise/sunset at a specific point. For a
 * stylistic ambient background (not a scientific almanac) that's a fine
 * trade for staying fully offline/free with no API dependency. If exact
 * precision ever matters, swap this for a sunrise-sunset API call.
 */
export function daylightWindow(latitudeDeg: number, date: Date): { sunrise: number; sunset: number } {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86_400_000);

  const phi = (latitudeDeg * Math.PI) / 180;
  const declinationDeg = 23.44 * Math.sin(((360 / 365) * (dayOfYear + 284) * Math.PI) / 180);
  const delta = (declinationDeg * Math.PI) / 180;

  const cosOmega = -Math.tan(phi) * Math.tan(delta);

  if (cosOmega <= -1) {
    // polar day: sun never sets
    return { sunrise: 0, sunset: 24 };
  }
  if (cosOmega >= 1) {
    // polar night: sun never rises
    return { sunrise: 12, sunset: 12 };
  }

  const omega0Deg = (Math.acos(cosOmega) * 180) / Math.PI;
  const dayLengthHours = (2 * omega0Deg) / 15;

  return {
    sunrise: 12 - dayLengthHours / 2,
    sunset: 12 + dayLengthHours / 2,
  };
}
