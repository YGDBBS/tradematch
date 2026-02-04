import React from "react"
import { View, StyleSheet, ViewStyle } from "react-native"
import { Card } from "./Card"
import { Text } from "./Text"
import { spacing } from "@/constants/theme"

export interface ValuePropCardProps {
  title?: string
  body: string
  style?: ViewStyle
}

/** Value prop / "Why TradeMatch" card. Presentational only. */
export function ValuePropCard({
  title = "Why TradeMatch?",
  body,
  style,
}: ValuePropCardProps) {
  return (
    <Card style={style}>
      <Text variant="titleSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" style={styles.body}>
        {body}
      </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.sm,
  },
  body: {
    lineHeight: 24,
  },
})
