import React from "react"
import type { ViewStyle } from "react-native"
import { View, Pressable, StyleSheet } from "react-native"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  testID?: string
}

/** Base container: white surface, padding, optional shadow. Use for list items and content blocks. */
export function Card({ children, onPress, style, testID }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        testID={testID}
      >
        {children}
      </Pressable>
    )
  }
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semantic.card.bg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: semantic.card.border,
    shadowColor: semantic.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.95,
  },
})
