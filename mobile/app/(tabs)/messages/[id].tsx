import { useState, useRef, useEffect } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Send } from "lucide-react-native"
import { Screen, Text, Header } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useMessages } from "@/hooks/useMessages"
import { colors, spacing, borderRadius } from "@/constants/theme"
import type { MessageWithSender } from "@/lib/types"

function MessageBubble({ message, isOwn }: { message: MessageWithSender; isOwn: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <View style={[styles.bubbleContainer, isOwn && styles.bubbleContainerOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && message.sender?.full_name && (
          <Text variant="caption" color="accent" style={styles.senderName}>
            {message.sender.full_name}
          </Text>
        )}
        <Text variant="body" style={isOwn ? styles.textOwn : undefined}>
          {message.body}
        </Text>
        <Text variant="small" style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {time}
        </Text>
      </View>
    </View>
  )
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const { messages, loading, error, sendMessage, isSending } = useMessages(
    id,
    session?.access_token
  )
  const [text, setText] = useState("")
  const flatListRef = useRef<FlatList>(null)

  const userId = session?.user?.id

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    setText("")
    try {
      await sendMessage(trimmed)
    } catch {
      // Error handled by hook
      setText(trimmed) // Restore text on error
    }
  }

  if (loading) {
    return (
      <Screen>
        <Header title="Chat" onBack={() => router.back()} backLabel="Back" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padded={false}>
      <Header title="Chat" onBack={() => router.back()} backLabel="Back" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text variant="bodySmall" color="error">
              {error.message}
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.sender_id === userId} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color="muted" align="center">
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || isSending}
            style={({ pressed }) => [
              styles.sendButton,
              (!text.trim() || isSending) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Send size={20} color={colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBanner: {
    backgroundColor: `${colors.error}20`,
    padding: spacing.sm,
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  bubbleContainer: {
    marginVertical: spacing.xs,
    flexDirection: "row",
  },
  bubbleContainerOwn: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleOwn: {
    backgroundColor: colors.teal,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
  },
  senderName: {
    marginBottom: spacing.xs,
  },
  textOwn: {
    color: colors.white,
  },
  time: {
    marginTop: spacing.xs,
    alignSelf: "flex-end",
  },
  timeOwn: {
    color: `${colors.white}99`,
  },
  timeOther: {
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
})
