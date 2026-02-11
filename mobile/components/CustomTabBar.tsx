import { View, Pressable, StyleSheet, Text } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import {
  LayoutDashboard,
  Wrench,
  Plus,
  PoundSterling,
  User,
  ClipboardList,
  Inbox,
  MessageCircle,
} from "lucide-react-native"
import { colors, spacing } from "@/constants/theme"

type TabConfig = {
  name: string
  label: string
  icon: typeof LayoutDashboard
}

const CUSTOMER_TABS: TabConfig[] = [
  { name: "index", label: "Dashboard", icon: LayoutDashboard },
  { name: "requests", label: "Requests", icon: ClipboardList },
]

const CUSTOMER_TABS_RIGHT: TabConfig[] = [
  { name: "messages", label: "Messages", icon: MessageCircle },
  { name: "profile", label: "Profile", icon: User },
]

const CONTRACTOR_TABS: TabConfig[] = [
  { name: "index", label: "Dashboard", icon: LayoutDashboard },
  { name: "jobs", label: "Jobs", icon: Wrench },
  { name: "leads", label: "Leads", icon: Inbox },
]

const CONTRACTOR_TABS_RIGHT: TabConfig[] = [
  { name: "money", label: "Money", icon: PoundSterling },
  { name: "profile", label: "Profile", icon: User },
]

interface CustomTabBarProps extends BottomTabBarProps {
  onAddPress: () => void
  isCustomer: boolean
}

export function CustomTabBar({ state, navigation, onAddPress, isCustomer }: CustomTabBarProps) {
  const leftTabs = isCustomer ? CUSTOMER_TABS : CONTRACTOR_TABS
  const rightTabs = isCustomer ? CUSTOMER_TABS_RIGHT : CONTRACTOR_TABS_RIGHT

  const renderTab = (tab: TabConfig) => {
    const route = state.routes.find((r) => r.name === tab.name)
    if (!route) return null

    const isFocused = state.index === state.routes.findIndex((r) => r.name === tab.name)
    const Icon = tab.icon

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      })

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      }
    }

    return (
      <Pressable
        key={tab.name}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={tab.label}
      >
        <Icon size={24} color={isFocused ? colors.teal : colors.textMuted} strokeWidth={2} />
        <Text style={[styles.label, isFocused && styles.labelFocused]}>{tab.label}</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabGroup}>{leftTabs.map(renderTab)}</View>

      <View style={styles.addButtonWrapper}>
        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          accessibilityLabel="Quick add"
          accessibilityRole="button"
        >
          <Plus size={28} color={colors.white} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.tabGroup}>{rightTabs.map(renderTab)}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 88,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    paddingTop: 4,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 4,
  },
  labelFocused: {
    color: colors.teal,
  },
  addButtonWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 70,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
})
