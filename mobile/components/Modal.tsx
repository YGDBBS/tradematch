import React from "react"
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Text } from "./Text"
import { colors, spacing, borderRadius, shadows } from "@/constants/theme"

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** Show close X button in header */
  showClose?: boolean
}

export function Modal({ visible, onClose, title, children, showClose = true }: ModalProps) {
  const insets = useSafeAreaInsets()

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleSmall">{title}</Text>
              {showClose && (
                <Pressable
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.closeIcon}>×</Text>
                </Pressable>
              )}
            </View>

            {/* Body */}
            <View style={styles.body}>{children}</View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  keyboardView: {
    width: "100%",
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -spacing.xs,
  },
  closeIcon: {
    fontSize: 28,
    color: colors.textMuted,
    lineHeight: 32,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
