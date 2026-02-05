import React from "react"
import type { PressableProps } from "react-native"
import { Pressable, View, StyleSheet } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "@/constants/theme"

export type BackButtonColor = "navy" | "white" | "muted"

export interface BackButtonProps extends Omit<PressableProps, "children"> {
  onPress: () => void
  label?: string
  color?: BackButtonColor
  showLabel?: boolean
}

const colorMap: Record<BackButtonColor, string> = {
  navy: colors.navy,
  white: colors.white,
  muted: colors.textMuted,
}

/** Chevron left + optional label. Use in Header for navigation. */
export function BackButton({
  onPress,
  label = "Back",
  color = "navy",
  showLabel = true,
  ...rest
}: BackButtonProps) {
  const resolvedColor = colorMap[color]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label || "Go back"}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...rest}
    >
      <View style={styles.chevron}>
        <Text style={[styles.chevronText, { color: resolvedColor }]}>‹</Text>
      </View>
      {showLabel && label ? (
        <Text variant="body" style={{ color: resolvedColor }}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    marginLeft: -spacing.xs,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
  chevron: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronText: {
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
  },
})
