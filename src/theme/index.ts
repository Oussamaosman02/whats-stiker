import { ViewStyle } from 'react-native';

export const colors = {
  // Deep space background
  background: '#050510',
  backgroundAlt: '#0a0b1e',

  // Glassmorphism surfaces
  glass: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  glassLight: 'rgba(255, 255, 255, 0.03)',

  // Neon accents
  neonCyan: '#00f5ff',
  neonPurple: '#b44aff',
  neonPink: '#ff2d95',
  neonBlue: '#4d7cff',
  neonGreen: '#00ff88',

  // Primary / Secondary
  primary: '#00f5ff',
  primaryMuted: 'rgba(0, 245, 255, 0.15)',
  secondary: '#b44aff',
  secondaryMuted: 'rgba(180, 74, 255, 0.15)',

  // Functional
  accent: '#ffb800',
  accentMuted: 'rgba(255, 184, 0, 0.12)',
  danger: '#ff3b5c',
  dangerMuted: 'rgba(255, 59, 92, 0.12)',
  success: '#00ff88',
  whatsapp: '#25D366',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textMuted: 'rgba(255, 255, 255, 0.35)',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderCyan: 'rgba(0, 245, 255, 0.25)',
  borderPurple: 'rgba(180, 74, 255, 0.25)',

  // Overlay
  overlay: 'rgba(5, 5, 16, 0.85)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 30,
  hero: 38,
};

// Reusable glass card style
export const glassCard: ViewStyle = {
  backgroundColor: colors.glass,
  borderRadius: borderRadius.lg,
  borderWidth: 1,
  borderColor: colors.border,
};

export const glassCardStrong: ViewStyle = {
  backgroundColor: colors.glassMedium,
  borderRadius: borderRadius.lg,
  borderWidth: 1,
  borderColor: colors.border,
};
