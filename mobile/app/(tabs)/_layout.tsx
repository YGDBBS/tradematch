import { Tabs } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { semantic } from "@/constants/theme"

export default function TabsLayout() {
  const { session } = useAuth()
  const { profile } = useProfile(session?.access_token ?? undefined)
  const isContractor = profile?.role === "contractor"

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semantic.buttonPrimary.bg,
        tabBarInactiveTintColor: semantic.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          href: isContractor ? "/jobs" : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  )
}
