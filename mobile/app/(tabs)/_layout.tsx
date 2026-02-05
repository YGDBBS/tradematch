import { useState } from "react"
import { View, StyleSheet, Pressable } from "react-native"
import { Tabs } from "expo-router"
import { LayoutDashboard, Wrench, Plus, PoundSterling, User } from "lucide-react-native"
import { colors, spacing } from "@/constants/theme"
import { QuickAddModal } from "@/components/QuickAddModal"

function TabBarIcon({
  Icon,
  color,
  size = 24,
}: {
  Icon: typeof LayoutDashboard
  color: string
  size?: number
}) {
  return <Icon size={size} color={color} strokeWidth={2} />
}

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
      accessibilityLabel="Quick add"
      accessibilityRole="button"
    >
      <Plus size={28} color={colors.white} strokeWidth={2.5} />
    </Pressable>
  )
}

export default function TabsLayout() {
  const [quickAddVisible, setQuickAddVisible] = useState(false)

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <TabBarIcon Icon={LayoutDashboard} color={color} />,
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: "Jobs",
            tabBarIcon: ({ color }) => <TabBarIcon Icon={Wrench} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarButton: () => (
              <View style={styles.addButtonContainer}>
                <AddButton onPress={() => setQuickAddVisible(true)} />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              setQuickAddVisible(true)
            },
          }}
        />
        <Tabs.Screen
          name="money"
          options={{
            title: "Money",
            tabBarIcon: ({ color }) => <TabBarIcon Icon={PoundSterling} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <TabBarIcon Icon={User} color={color} />,
          }}
        />
      </Tabs>

      <QuickAddModal visible={quickAddVisible} onClose={() => setQuickAddVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 88,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  addButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
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
