"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type React from "react"
import { useState } from "react"
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface RedeemOption {
  id: string
  partner: string
  value: string
  points: number
  logo: string
}

interface EarnOption {
  id: string
  title: string
  description: string
  imageUrl: string
}

const AccountScreen: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"redeem" | "earn">("redeem")
  const [userPoints] = useState(0)
  const [isLoggedIn] = useState(false)

  const redeemOptions: RedeemOption[] = [
    {
      id: "1",
      partner: "Grab",
      value: "$5",
      points: 100,
      logo: "https://static.vecteezy.com/system/resources/previews/030/527/914/original/grab-logo-transparent-free-png.png",
    },
    {
      id: "2",
      partner: "Grab",
      value: "$2",
      points: 50,
      logo: "https://static.vecteezy.com/system/resources/previews/030/527/914/original/grab-logo-transparent-free-png.png",
    },
    {
      id: "3",
      partner: "Starbucks",
      value: "$5",
      points: 100,
      logo: "https://images.seeklogo.com/logo-png/16/2/starbucks-logo-png_seeklogo-168511.png",
    },
    {
      id: "4",
      partner: "NTUC Fairprice",
      value: "$5",
      points: 100,
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ85l7fXjM5gRnEzD8xSyHh2vkXHCVN_HKS1Q&s",
    },
  ]

  const earnOptions: EarnOption[] = [
    {
      id: "1",
      title: "Earn 30 points",
      description: "Head down to your local community club and take the CPR-AED course",
      imageUrl:
        "https://www.shutterstock.com/image-vector/aedautomated-external-defibrillator-aed-sign-600nw-2317306487.jpg",
    },
    {
      id: "2",
      title: "Earn up to 50 points",
      description: "Be a first responder on site and help someone else",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/90/90584.png",
    },
    {
      id: "3",
      title: "Earn points",
      description: "report an incident/suspicious activity or verify activities reported by others",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/8992/8992509.png",
    },
  ]

  const handleLogin = () => {
    // Navigate to login screen (to be implemented)
    console.log("Navigate to login screen")
  }

  const handleRedeemOption = (option: RedeemOption) => {
    console.log("Redeem option selected:", option)
  }

  const handleEarnOption = (option: EarnOption) => {
    console.log("Earn option selected:", option)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            {isLoggedIn ? (
              <Image source={{ uri: "https://via.placeholder.com/40" }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={24} color="#666666" />
            )}
          </View>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pointsText}>{userPoints} pts</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "redeem" && styles.activeTab]}
          onPress={() => setActiveTab("redeem")}
        >
          <Text style={[styles.tabText, activeTab === "redeem" && styles.activeTabText]}>Redeem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "earn" && styles.activeTab]}
          onPress={() => setActiveTab("earn")}
        >
          <Text style={[styles.tabText, activeTab === "earn" && styles.activeTabText]}>Earn pts</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "redeem" ? (
          <View style={styles.redeemContent}>
            {redeemOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.redeemOption} onPress={() => handleRedeemOption(option)}>
                <View style={styles.redeemLogo}>
                  <Image source={{ uri: option.logo }} style={styles.logoImage} resizeMode="contain" />
                </View>
                <View style={styles.redeemDetails}>
                  <Text style={styles.redeemTitle}>
                    {option.partner} {option.value} vouchers
                  </Text>
                  <Text style={styles.redeemPoints}>{option.points} points</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.earnContent}>
            {earnOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.earnOption} onPress={() => handleEarnOption(option)}>
                <View style={styles.earnImageContainer}>
                  <Image source={{ uri: option.imageUrl }} style={styles.earnImage} resizeMode="contain" />
                </View>
                <View style={styles.earnDetails}>
                  <Text style={styles.earnTitle}>{option.title}</Text>
                  <Text style={styles.earnDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 50,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 60,
  },
  loginText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
  },
  pointsText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    marginRight: 12,
    backgroundColor: "#ffffff",
  },
  activeTab: {
    backgroundColor: "#000000",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  activeTabText: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  redeemContent: {
    paddingBottom: 100,
  },
  redeemOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  redeemLogo: {
    width: 60,
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  redeemDetails: {
    flex: 1,
  },
  redeemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  redeemPoints: {
    fontSize: 14,
    color: "#666666",
  },
  earnContent: {
    paddingBottom: 100,
  },
  earnOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  earnImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#f8f8f8",
  },
  earnImage: {
    width: 50,
    height: 50,
  },
  earnDetails: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  earnDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
})

export default AccountScreen
