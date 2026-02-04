import React from "react"
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  ViewProps,
} from "react-native"
import { semantic, spacing, borderRadius } from "@/constants/theme"

export interface CardProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

/** Base container: white surface, padding, optional shadow. Use for list items and content blocks. */
export function Card({ children, onPress, style, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        {...(rest as any)}
      >
        {children}
      </Pressable>
    )
  }
  return (
    <View style={[styles.card, style]} {...rest}>
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
