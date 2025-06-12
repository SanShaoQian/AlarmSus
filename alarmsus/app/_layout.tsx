"use client"

import { Tabs } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Footer from "../components/Footer"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => <Footer />}
      />
    </SafeAreaProvider>
  )
}
