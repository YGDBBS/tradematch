import React from "react"
import type { ViewStyle } from "react-native"
import { View, StyleSheet } from "react-native"
import { Text } from "./Text"
import { BackButton } from "./BackButton"
import { spacing } from "@/constants/theme"

export interface HeaderProps {
  title: string
  onBack?: () => void
  backLabel?: string
  rightAction?: React.ReactNode
  style?: ViewStyle
}

/** Back (left) + title (centre) + optional right action. Use at top of screens. */
export function Header({ title, onBack, backLabel = "Back", rightAction, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {onBack ? (
          <BackButton onPress={onBack} label={backLabel} />
        ) : (
          <View style={styles.leftPlaceholder} />
        )}
      </View>
      <View style={styles.center}>
        <Text variant="titleSmall" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.right}>{rightAction ?? <View style={styles.rightPlaceholder} />}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  left: {
    minWidth: 80,
    alignItems: "flex-start",
  },
  leftPlaceholder: {
    width: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  right: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  rightPlaceholder: {
    width: 1,
  },
})
