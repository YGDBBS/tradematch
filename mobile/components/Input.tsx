import React, { useState } from "react"
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing, borderRadius, typography } from "@/constants/theme"
import { useFontContext } from "@/contexts/FontContext"

export interface InputProps extends Omit<TextInputProps, "style"> {
  label: string
  error?: string
  helper?: string
  containerStyle?: ViewStyle
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { fontFamily } = useFontContext()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const borderColor = error ? colors.error : isFocused ? colors.teal : colors.border

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, { fontFamily, borderColor }, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error ? (
        <Text variant="small" color="error" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" color="muted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.navy,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  helper: {
    marginTop: spacing.xs,
  },
})
