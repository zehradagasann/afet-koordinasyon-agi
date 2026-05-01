/**
 * RESQ Design System
 *
 * Tailwind/NativeWind ile aynı renk tokenlarını JS koduna ihraç eder.
 * Inline `style={{ color: ... }}` gibi NativeWind dışı kullanımlar veya
 * `ActivityIndicator color`, harita marker rengi gibi durumlar için kullanılır.
 *
 * Tek kaynak: tailwind.config.js
 */

export const Colors = {
  primary: "#E63946",
  primaryDark: "#C5202D",
  primaryLight: "#FCBFC5",
  secondary: "#FF6B6B",

  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceCard: "#F9FAFB",
  surfaceMuted: "#F3F4F6",

  textPrimary: "#1A1A1A",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  border: "#E5E7EB",
  borderStrong: "#D1D5DB",

  statusActive: "#10B981",
  statusPending: "#F59E0B",
  statusUrgent: "#DC2626",
  statusResolved: "#3B82F6",
  statusInfo: "#0EA5E9",
} as const;

export const Radius = {
  input: 8,
  card: 12,
  button: 24,
  modal: 20,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSizes = {
  caption: 12,
  body: 15,
  titleMd: 18,
  titleLg: 22,
  titleXl: 28,
} as const;

export type ColorName = keyof typeof Colors;
