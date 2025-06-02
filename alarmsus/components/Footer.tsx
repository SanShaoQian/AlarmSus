"use client"

import { Ionicons } from "@expo/vector-icons"
import { usePathname, useRouter } from "expo-router"
import type React from "react"
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native"

interface FooterTab {
  name: string
  path: string
  icon: keyof typeof Ionicons.glyphMap
  label: string
}

interface FooterProps {
  style?: ViewStyle
}

const Footer: React.FC<FooterProps> = ({ style }) => {
  const router = useRouter()
  const pathname = usePathname()

  console.log("Footer rendering, current pathname:", pathname)

  const footerTabs: FooterTab[] = [
    { name: "Map", path: "/map", icon: "location-outline", label: "Map" },
    { name: "Forum", path: "/forum", icon: "book-outline", label: "Forum" },
    { name: "Report", path: "/Report", icon: "camera-outline", label: "Report" },
    { name: "News", path: "/", icon: "newspaper-outline", label: "News" }, // Changed to '/' for index
    { name: "Account", path: "/account", icon: "person-outline", label: "Account" },
  ]

  const handleTabPress = (path: string): void => {
    console.log("Tab pressed:", path, "Current pathname:", pathname)

    // Don't navigate if already on the current tab
    if (path === pathname) {
      console.log("Already on this tab, not navigating")
      return
    }

    console.log("Navigating to:", path)
    router.push(path as any)
  }

  const renderFooterTab = (tab: FooterTab): React.ReactElement => {
    // Handle both '/' and '/news' as active for the News tab
    const isActive = tab.path === pathname || (tab.name === "News" && (pathname === "/" || pathname === "/news"))

    console.log(`Tab ${tab.name}: isActive = ${isActive}, tab.path = ${tab.path}, pathname = ${pathname}`)

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.footerTab}
        onPress={() => handleTabPress(tab.path)}
        activeOpacity={0.7}
      >
        <Ionicons name={tab.icon} size={24} color={isActive ? "#000000" : "#999999"} />
        <Text style={isActive ? styles.footerTabTextActive : styles.footerTabTextInactive}>{tab.label}</Text>
      </TouchableOpacity>
    )
  }

  return <View style={[styles.footer, style]}>{footerTabs.map(renderFooterTab)}</View>
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingBottom: 34,
    justifyContent: "space-between",
    minHeight: 60,
  },
  footerTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerTabTextActive: {
    fontSize: 12,
    color: "#000000",
    marginTop: 4,
    fontWeight: "500",
  },
  footerTabTextInactive: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    fontWeight: "400",
  },
})

export default Footer
