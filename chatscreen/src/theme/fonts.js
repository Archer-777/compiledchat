import { Platform } from 'react-native';

/**
 * Next Archer Prototype Typography System
 * - Body Text: Inter (Clean modern grotesque styling)
 * - Headers & Small Caps: Poppins (Geometric Sans-Serif)
 */
export const Fonts = {
  body: Platform.select({
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'Inter',
  }),
  header: Platform.select({
    web: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'Poppins',
  }),
  inter: Platform.select({
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'Inter',
  }),
  poppins: Platform.select({
    web: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'Poppins',
  }),
};
