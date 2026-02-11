import { useState, useCallback } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { Tabs } from "expo-router"
import { colors } from "@/constants/theme"
import { QuickAddModal } from "@/components/QuickAddModal"
import { CustomTabBar } from "@/components/CustomTabBar"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"

export default function TabsLayout() {
  const [quickAddVisible, setQuickAddVisible] = useState(false)
  const { session } = useAuth()
  const { profile, loading: profileLoading } = useProfile(session?.access_token ?? undefined)

  const isCustomer = profile?.role === "customer"

  const handleAddPress = useCallback(() => {
    setQuickAddVisible(true)
  }, [])

  // Show loading while profile is being fetched to prevent tab flash
  if (profileLoading && !profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    )
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <CustomTabBar {...props} onAddPress={handleAddPress} isCustomer={isCustomer} />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="requests" />
        <Tabs.Screen name="jobs" />
        <Tabs.Screen name="leads" />
        <Tabs.Screen name="add" options={{ href: null }} />
        <Tabs.Screen name="money" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <QuickAddModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        isCustomer={isCustomer}
      />
    </>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
})
