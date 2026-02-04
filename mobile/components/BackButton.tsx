import React from "react"
import type { PressableProps } from "react-native"
import { Pressable, View, StyleSheet } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "@/constants/theme"

export interface BackButtonProps extends Omit<PressableProps, "children"> {
  onPress: () => void
  label?: string
}

/** Chevron left + optional "Back" label. Use in Header for navigation. */
export function BackButton({ onPress, label = "Back", ...rest }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>‹</Text>
      </View>
      {label ? (
        <Text variant="body" style={styles.label}>
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
    marginLeft: -spacing.sm,
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
    color: colors.primary,
    lineHeight: 32,
  },
  label: {
    color: colors.primary,
  },
})
