import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  User,
  Pencil,
  MapPin,
  Briefcase,
  Star,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react-native"
import { Screen, Text, Card, Button } from "@/components"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { colors, spacing, borderRadius, shadows } from "@/constants/theme"

function SettingsRow({
  icon: Icon,
  label,
  onPress,
  variant = "default",
}: {
  icon: typeof Settings
  label: string
  onPress: () => void
  variant?: "default" | "danger"
}) {
  const iconColor = variant === "danger" ? colors.error : colors.navy
  const textColor = variant === "danger" ? "error" : undefined

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <Icon size={20} color={iconColor} strokeWidth={2} />
      <Text variant="body" color={textColor} style={styles.settingsLabel}>
        {label}
      </Text>
      {variant === "default" && <ChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { session, signOut } = useAuth()
  const { profile, loading, refreshing, error, refetch } = useProfile(
    session?.access_token ?? undefined
  )

  if (loading && !profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
          <Text variant="body" color="error" style={styles.errorText}>
            {error.message}
          </Text>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} />
        </View>
      </Screen>
    )
  }

  if (!profile) return null

  const displayName = profile.display_name || "Add your name"
  const trade = profile.trade || "Add your trade"
  const postcode = profile.postcode || "Add location"

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.teal} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color={colors.textMuted} strokeWidth={1.5} />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="title" numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.profileMeta}>
              <Briefcase size={14} color={colors.textMuted} />
              <Text variant="caption" color="muted" style={styles.metaText}>
                {trade}
              </Text>
            </View>
            <View style={styles.profileMeta}>
              <MapPin size={14} color={colors.textMuted} />
              <Text variant="caption" color="muted" style={styles.metaText}>
                {postcode}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/profile/edit")}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            accessibilityLabel="Edit profile"
          >
            <Pencil size={20} color={colors.teal} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="titleSmall" color="accent">
              0
            </Text>
            <Text variant="small" color="muted">
              Jobs done
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Star size={16} color={colors.warning} fill={colors.warning} />
              <Text variant="titleSmall" style={styles.ratingText}>
                –
              </Text>
            </View>
            <Text variant="small" color="muted">
              Rating
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="titleSmall">0</Text>
            <Text variant="small" color="muted">
              Reviews
            </Text>
          </View>
        </View>

        {/* Settings */}
        <Text variant="label" color="muted" style={styles.sectionLabel}>
          SETTINGS
        </Text>
        <Card style={styles.settingsCard}>
          <SettingsRow
            icon={Pencil}
            label="Edit profile"
            onPress={() => router.push("/profile/edit")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow icon={Star} label="Reviews" onPress={() => {}} />
          <View style={styles.settingsDivider} />
          <SettingsRow icon={Settings} label="App settings" onPress={() => {}} />
        </Card>

        {/* Sign Out */}
        <Card style={styles.settingsCard}>
          <SettingsRow icon={LogOut} label="Sign out" onPress={() => signOut()} variant="danger" />
        </Card>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
    paddingTop: spacing.xs,
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.teal}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: spacing.xs,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsCard: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  settingsLabel: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 20 + spacing.md,
  },
})
