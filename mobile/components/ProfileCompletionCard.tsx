import React from "react"
import type { ViewStyle } from "react-native"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Card } from "./Card"
import { Text } from "./Text"
import { spacing, semantic, borderRadius } from "@/constants/theme"

export interface ProfileCompletionItem {
  id: string
  label: string
  completed?: boolean
  onPress?: () => void
}

export interface ProfileCompletionCardProps {
  title?: string
  items: ProfileCompletionItem[]
  style?: ViewStyle
}

/** Checklist card for profile setup (logo, cover, services, review, photos). Parent controls state and navigation. */
export function ProfileCompletionCard({
  title = "Complete your profile",
  items,
  style,
}: ProfileCompletionCardProps) {
  const completedCount = items.filter((i) => i.completed).length
  const total = items.length

  return (
    <Card style={style}>
      <Text variant="titleSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodySmall" style={styles.progress}>
        {completedCount}/{total} completed
      </Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={item.onPress}
          style={styles.row}
          activeOpacity={item.onPress ? 0.7 : 1}
          disabled={!item.onPress}
        >
          <View style={[styles.bullet, item.completed && styles.bulletDone]}>
            {item.completed ? (
              <Text variant="caption" style={styles.checkmark}>
                ✓
              </Text>
            ) : null}
          </View>
          <Text variant="body" style={[styles.label, item.completed && styles.labelDone]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  progress: {
    color: semantic.buttonGhost.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: semantic.card.border,
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: semantic.input.border,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletDone: {
    backgroundColor: semantic.success,
    borderColor: semantic.success,
  },
  checkmark: {
    color: semantic.card.bg,
    fontWeight: "700",
  },
  label: {},
  labelDone: {
    color: semantic.buttonGhost.text,
  },
})
