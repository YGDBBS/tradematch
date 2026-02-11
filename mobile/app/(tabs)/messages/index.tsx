import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronRight, MessageCircle, User } from "lucide-react-native"
import { Screen, Text, Card } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useConversations, type Conversation } from "@/hooks/useConversations"
import { colors, spacing } from "@/constants/theme"

function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: Conversation
  onPress: () => void
}) {
  const otherPartyName = conversation.other_party?.full_name || "Unknown"
  const roleLabel = conversation.role === "customer" ? "Contractor" : "Customer"

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <User size={24} color={colors.teal} />
          </View>
          <View style={styles.textContent}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {otherPartyName}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {roleLabel} · {conversation.title}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  )
}

export default function MessagesListScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const { conversations, loading, refreshing, error, refetch } = useConversations(
    session?.access_token
  )

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text variant="hero">Messages</Text>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text variant="body" color="error">
            {error.message}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.request_id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => router.push(`/messages/${item.request_id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={colors.textMuted} strokeWidth={1.5} />
              <Text variant="titleSmall" align="center" style={styles.emptyTitle}>
                No messages yet
              </Text>
              <Text variant="body" color="muted" align="center">
                When you connect with {"\n"}contractors or customers, your{"\n"}conversations will
                appear here
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.teal}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  errorBlock: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
})
