import React from "react"
import type { PressableProps, ViewStyle, TextStyle } from "react-native"
import { Pressable, Text, StyleSheet } from "react-native"
import { semantic, spacing, borderRadius, typography } from "@/constants/theme"
import { useFontContext } from "@/contexts/FontContext"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "highlight"

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant
  title: string
  onPress: () => void
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: semantic.buttonPrimary.bg,
    },
    text: {
      color: semantic.buttonPrimary.text,
    },
  },
  secondary: {
    container: {
      backgroundColor: semantic.buttonSecondary.bg,
      borderWidth: 1.5,
      borderColor: semantic.buttonSecondary.border,
    },
    text: {
      color: semantic.buttonSecondary.text,
    },
  },
  ghost: {
    container: {
      backgroundColor: semantic.buttonGhost.bg,
    },
    text: {
      color: semantic.buttonGhost.text,
    },
  },
  destructive: {
    container: {
      backgroundColor: semantic.buttonDestructive.bg,
      borderWidth: 1.5,
      borderColor: semantic.buttonDestructive.border,
    },
    text: {
      color: semantic.buttonDestructive.text,
    },
  },
  highlight: {
    container: {
      backgroundColor: semantic.buttonHighlight.bg,
    },
    text: {
      color: semantic.buttonHighlight.text,
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
  const { fontFamilySemiBold } = useFontContext()
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
      <Text style={[styles.text, { fontFamily: fontFamilySemiBold }, text]}>{title}</Text>
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
    minHeight: 56, // Increased for better touch targets
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.label.fontSize,
    lineHeight: typography.label.lineHeight,
  },
})
