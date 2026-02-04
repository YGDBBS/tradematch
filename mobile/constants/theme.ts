/**
 * TradeMatch design tokens – Option 1: Trust-first, professional.
 * Single source of truth: no hardcoded colours in components.
 * Use semantic.* for UI (buttons, inputs, CTAs); use colors.* only via semantic or for one-offs.
 */

export const colors = {
  primary: "#1e3a5f",
  secondary: "#64748b",
  accent: "#0d9488",
  accentGreen: "#16a34a",
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  error: "#dc2626",
  success: "#16a34a",
  /** Neutral for shadows; keep consistent with theme */
  shadow: "#000000",
} as const

/** Semantic tokens: map UI roles to colors. Buttons, CTAs, inputs use these only. */
export const semantic = {
  /** Primary CTA (e.g. "Get started", "Sign in", "Save") */
  buttonPrimary: {
    bg: colors.accent,
    text: colors.surface,
  },
  /** Secondary action (e.g. "Cancel", "Sign out", "Back") */
  buttonSecondary: {
    bg: "transparent" as const,
    border: colors.borderStrong,
    text: colors.primary,
  },
  /** Ghost / low emphasis (e.g. "Skip", "Copy number") */
  buttonGhost: {
    bg: "transparent" as const,
    text: colors.secondary,
  },
  /** Destructive (e.g. "Delete account") – reuse error for now */
  buttonDestructive: {
    bg: "transparent" as const,
    border: colors.error,
    text: colors.error,
  },
  input: {
    bg: colors.surface,
    border: colors.border,
    text: colors.primary,
    placeholder: colors.secondary,
  },
  /** Spinner, progress */
  loading: colors.accent,
  /** Error message text, error state borders */
  error: colors.error,
  /** Success state, "approved" badges */
  success: colors.success,
  screen: {
    background: colors.background,
  },
  card: {
    bg: colors.surface,
    border: colors.border,
    shadow: colors.shadow,
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const

/** Typography: one family, clear weights. */
export const typography = {
  fontFamily: undefined as string | undefined,
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.primary,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: colors.primary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.secondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: colors.secondary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.primary,
  },
} as const

export const theme = {
  colors,
  semantic,
  spacing,
  borderRadius,
  typography,
} as const

export type Theme = typeof theme
