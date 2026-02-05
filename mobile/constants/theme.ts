/**
 * TradeMatch Design System
 * Target: UK tradespeople - clear, chunky, trustworthy UI
 * Font: Work Sans
 */

export const colors = {
  // Brand
  navy: "#1a2e40",
  teal: "#0891b2",
  orange: "#ea580c",

  // Functional
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",

  // Neutrals (Stone palette - warmer than grey)
  background: "#f5f5f4", // stone-100
  surface: "#ffffff",
  border: "#d6d3d1", // stone-300
  borderStrong: "#a8a29e", // stone-400
  textMuted: "#78716c", // stone-500

  // Utility
  white: "#ffffff",
  black: "#000000",
  shadow: "#000000",
} as const

/** Semantic tokens for UI components */
export const semantic = {
  // Buttons
  buttonPrimary: {
    bg: colors.teal,
    text: colors.white,
  },
  buttonSecondary: {
    bg: colors.surface,
    border: colors.navy,
    text: colors.navy,
  },
  buttonGhost: {
    bg: "transparent" as const,
    text: colors.textMuted,
  },
  buttonDestructive: {
    bg: "transparent" as const,
    border: colors.error,
    text: colors.error,
  },
  buttonHighlight: {
    bg: colors.orange,
    text: colors.white,
  },

  // Inputs
  input: {
    bg: colors.surface,
    border: colors.border,
    borderFocus: colors.teal,
    text: colors.navy,
    placeholder: colors.textMuted,
  },

  // States
  loading: colors.teal,
  error: colors.error,
  success: colors.success,
  warning: colors.warning,

  // Surfaces
  screen: {
    background: colors.background,
  },
  card: {
    bg: colors.surface,
    border: colors.border,
    shadow: colors.shadow,
  },
  surface: colors.surface,
  border: colors.border,

  // Text
  textPrimary: colors.navy,
  textSecondary: colors.textMuted,
  textAccent: colors.teal,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

/** Typography scale - uses Work Sans when loaded */
export const typography = {
  // Font family set by FontProvider after loading
  fontFamily: undefined as string | undefined,
  fontFamilyBold: undefined as string | undefined,

  hero: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.navy,
    lineHeight: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: colors.navy,
    lineHeight: 28,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.navy,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: colors.navy,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.navy,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.textMuted,
    lineHeight: 20,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.textMuted,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.navy,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: colors.textMuted,
    lineHeight: 16,
  },
} as const

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
} as const

export const theme = {
  colors,
  semantic,
  spacing,
  borderRadius,
  typography,
  shadows,
} as const

export type Theme = typeof theme
