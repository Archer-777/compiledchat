/**
 * Rough latitude per ISO 3166-1 alpha-2 country code (representative
 * capital/major city — this only needs to be right to a few degrees,
 * since it's shaping a stylistic sunrise/sunset curve, not doing precise
 * astronomy). Unmapped codes fall back to the generic default curve in
 * useSolarAmbience — they do NOT throw or silently guess badly.
 *
 * Extend this table as needed; it's intentionally flat data so it's easy
 * for anyone on the team to add a missing country without touching logic.
 */
export const COUNTRY_LATITUDE: Record<string, number> = {
  IN: 22.0,  // India (centroid-ish, New Delhi area)
  US: 38.9,  // Washington D.C.
  GB: 51.5,  // London
  CA: 45.4,  // Ottawa
  AU: -35.3, // Canberra
  DE: 52.5,  // Berlin
  FR: 48.9,  // Paris
  ES: 40.4,  // Madrid
  IT: 41.9,  // Rome
  NL: 52.4,  // Amsterdam
  SE: 59.3,  // Stockholm
  NO: 59.9,  // Oslo
  FI: 60.2,  // Helsinki
  DK: 55.7,  // Copenhagen
  IE: 53.3,  // Dublin
  PT: 38.7,  // Lisbon
  PL: 52.2,  // Warsaw
  RU: 55.8,  // Moscow
  CN: 39.9,  // Beijing
  JP: 35.7,  // Tokyo
  KR: 37.6,  // Seoul
  SG: 1.35,  // Singapore
  MY: 3.1,   // Kuala Lumpur
  TH: 13.8,  // Bangkok
  VN: 21.0,  // Hanoi
  PH: 14.6,  // Manila
  ID: -6.2,  // Jakarta
  PK: 33.7,  // Islamabad
  BD: 23.8,  // Dhaka
  LK: 6.9,   // Colombo
  NP: 27.7,  // Kathmandu
  AE: 24.5,  // Abu Dhabi
  SA: 24.7,  // Riyadh
  IL: 31.8,  // Jerusalem
  TR: 39.9,  // Ankara
  EG: 30.0,  // Cairo
  ZA: -25.7, // Pretoria
  NG: 9.1,   // Abuja
  KE: -1.3,  // Nairobi
  BR: -15.8, // Brasília
  MX: 19.4,  // Mexico City
  AR: -34.6, // Buenos Aires
  CL: -33.4, // Santiago
  CO: 4.7,   // Bogotá
  PE: -12.0, // Lima
  NZ: -41.3, // Wellington
};

export function getLatitudeForCountry(countryCode?: string): number | undefined {
  if (!countryCode) return undefined;
  return COUNTRY_LATITUDE[countryCode.toUpperCase()];
}
