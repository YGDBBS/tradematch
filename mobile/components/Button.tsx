import React from "react"
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  PressableProps,
  ViewStyle,
} from "react-native"
import { semantic, spacing, borderRadius, typography } from "@/constants/theme"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant
  title: string
  onPress: () => void
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: object }
> = {
  primary: {
    container: {
      backgroundColor: semantic.buttonPrimary.bg,
    },
    text: {
      ...typography.label,
      color: semantic.buttonPrimary.text,
      fontSize: 16,
    },
  },
  secondary: {
    container: {
      backgroundColor: semantic.buttonSecondary.bg,
      borderWidth: 1.5,
      borderColor: semantic.buttonSecondary.border,
    },
    text: {
      ...typography.label,
      color: semantic.buttonSecondary.text,
      fontSize: 16,
    },
  },
  ghost: {
    container: {
      backgroundColor: semantic.buttonGhost.bg,
    },
    text: {
      ...typography.label,
      color: semantic.buttonGhost.text,
      fontSize: 16,
    },
  },
  destructive: {
    container: {
      backgroundColor: semantic.buttonDestructive.bg,
      borderWidth: 1.5,
      borderColor: semantic.buttonDestructive.border,
    },
    text: {
      ...typography.label,
      color: semantic.buttonDestructive.text,
      fontSize: 16,
    },
  },
}

export function Button({
  variant = "primary",
  title,
  onPress,
  disabled = false,
  fullWidth,
  style,
  ...rest
}: ButtonProps) {
  const { container, text } = variantStyles[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      <Text style={[styles.text, text]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {},
})
