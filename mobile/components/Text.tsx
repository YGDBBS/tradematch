import React from "react"
import type { TextProps as RNTextProps } from "react-native"
import { Text as RNText } from "react-native"
import { colors, typography } from "@/constants/theme"
import { useFontContext } from "@/contexts/FontContext"

export type TextVariant =
  | "hero"
  | "title"
  | "titleSmall"
  | "body"
  | "bodyStrong"
  | "bodySmall"
  | "caption"
  | "label"
  | "small"

export interface TextProps extends RNTextProps {
  variant?: TextVariant
  color?: "navy" | "muted" | "accent" | "error" | "success" | "white" | "warning"
  align?: "left" | "center" | "right"
}

const colorMap = {
  navy: colors.navy,
  muted: colors.textMuted,
  accent: colors.teal,
  error: colors.error,
  success: colors.success,
  warning: colors.warning,
  white: colors.white,
}

export function Text({ variant = "body", color, align, style, children, ...rest }: TextProps) {
  const { fontFamily, fontFamilySemiBold, fontFamilyBold } = useFontContext()

  const variantStyle = typography[variant]

  // Map font weight to loaded font family
  const weight = variantStyle.fontWeight
  let resolvedFontFamily = fontFamily
  if (weight === "600") resolvedFontFamily = fontFamilySemiBold
  if (weight === "700") resolvedFontFamily = fontFamilyBold

  const textColor = color ? colorMap[color] : variantStyle.color

  return (
    <RNText
      style={[
        {
          fontFamily: resolvedFontFamily,
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          color: textColor,
        },
        align && { textAlign: align },
        style,
      ]}
      allowFontScaling={true}
      {...rest}
    >
      {children}
    </RNText>
  )
}
