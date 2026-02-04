import React from "react"
import type { TextProps as RNTextProps } from "react-native"
import { Text as RNText } from "react-native"
import { colors, typography } from "@/constants/theme"

export type TextVariant = "title" | "titleSmall" | "body" | "bodySmall" | "caption" | "label"

const variantStyles: Record<TextVariant, object> = {
  title: typography.title,
  titleSmall: typography.titleSmall,
  body: typography.body,
  bodySmall: typography.bodySmall,
  caption: typography.caption,
  label: typography.label,
}

export interface TextProps extends RNTextProps {
  variant?: TextVariant
  color?: keyof typeof colors | string
}

export function Text({ variant = "body", color, style, ...rest }: TextProps) {
  const baseStyle = variantStyles[variant]
  const colorStyle = color
    ? {
        color:
          typeof color === "string" && color in colors
            ? (colors as Record<string, string>)[color]
            : color,
      }
    : {}

  return <RNText style={[baseStyle, colorStyle, style]} allowFontScaling={true} {...rest} />
}
