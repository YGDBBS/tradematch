import React from "react"
import { View, StyleSheet, ViewStyle } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { semantic, spacing } from "@/constants/theme"

export interface ScreenProps {
  children: React.ReactNode
  /** If true, content scrolls; otherwise it's a plain View. Caller can pass a ScrollView as child. */
  padded?: boolean
  style?: ViewStyle
  /** Background color for the safe area (status bar region). Defaults to screen background. */
  safeAreaColor?: string
}

/** Wrapper for each screen: safe area + background. Use at root of every screen. */
export function Screen({ children, padded = true, style, safeAreaColor }: ScreenProps) {
  return (
    <SafeAreaView
      style={[styles.safe, safeAreaColor ? { backgroundColor: safeAreaColor } : undefined]}
      edges={["top", "left", "right"]}
    >
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semantic.screen.background,
  },
  inner: {
    flex: 1,
    backgroundColor: semantic.screen.background,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
})
