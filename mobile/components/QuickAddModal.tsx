import React from "react"
import { View, StyleSheet, Pressable } from "react-native"
import { router } from "expo-router"
import { Wrench, FileText, ClipboardList } from "lucide-react-native"
import { Modal } from "./Modal"
import { Text } from "./Text"
import { colors, spacing, borderRadius } from "@/constants/theme"

interface QuickAddModalProps {
  visible: boolean
  onClose: () => void
  isCustomer?: boolean
}

interface ActionItemProps {
  icon: React.ReactNode
  title: string
  description: string
  onPress: () => void
}

function ActionItem({ icon, title, description, onPress }: ActionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionContent}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="muted">
          {description}
        </Text>
      </View>
    </Pressable>
  )
}

export function QuickAddModal({ visible, onClose, isCustomer = false }: QuickAddModalProps) {
  const handleNewJob = () => {
    onClose()
    router.push("/jobs/new")
  }

  const handleNewQuote = () => {
    onClose()
    // For now, go to jobs - later this could go to a quick quote flow
    router.push("/jobs")
  }

  const handlePostJob = () => {
    onClose()
    router.push("/requests/new")
  }

  if (isCustomer) {
    return (
      <Modal visible={visible} onClose={onClose} title="Quick add">
        <View style={styles.actions}>
          <ActionItem
            icon={<ClipboardList size={24} color={colors.teal} strokeWidth={2} />}
            title="Post a job"
            description="Find local tradespeople for your job"
            onPress={handlePostJob}
          />
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Quick add">
      <View style={styles.actions}>
        <ActionItem
          icon={<Wrench size={24} color={colors.teal} strokeWidth={2} />}
          title="New job"
          description="Log a job from a call or referral"
          onPress={handleNewJob}
        />
        <ActionItem
          icon={<FileText size={24} color={colors.orange} strokeWidth={2} />}
          title="New quote"
          description="Create and send a quote"
          onPress={handleNewQuote}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  actionItemPressed: {
    opacity: 0.7,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
})
