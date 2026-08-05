export const COLORS = {
  // Core
  background: '#000000',
  surface: '#121212',
  surfaceLight: '#1E1E1E',
  card: '#181818',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  textPlaceholder: '#555555',
  
  // Accents (Monochrome Black & White)
  accent: '#FFFFFF',
  accentLight: '#E0E0E0',
  accentDim: 'rgba(255, 255, 255, 0.12)',
  
  // Borders
  border: '#262626',
  borderLight: '#3A3A3A',
  borderFocused: '#FFFFFF',
  
  // Status
  success: '#FFFFFF',
  successDim: 'rgba(255, 255, 255, 0.15)',
  error: '#FF4D4D',
  errorDim: 'rgba(255, 77, 77, 0.15)',
  
  // Gradients
  gradientStart: '#000000',
  gradientMid: '#0A0A0A',
  gradientEnd: '#050505',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.85)',
  glowAccent: 'rgba(255, 255, 255, 0.25)',
  glowWhite: 'rgba(255, 255, 255, 0.08)',
};

export const FONTS = {
  heading: {
    fontFamily: 'serif',
    fontWeight: '300',
    letterSpacing: 2,
  },
  subheading: {
    fontFamily: 'serif',
    fontWeight: '400',
    letterSpacing: 1,
  },
  body: {
    fontFamily: undefined, // system default sans-serif
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: undefined,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
};
