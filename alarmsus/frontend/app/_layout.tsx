import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="report" options={{ title: "Report Incident" }} />
        <Stack.Screen name="map" options={{ title: "Find AEDs" }} />
        <Stack.Screen name="forum" options={{ title: "Forum", headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
