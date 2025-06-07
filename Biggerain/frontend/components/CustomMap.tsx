"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native"

const { width, height } = Dimensions.get("window")

interface AED {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
}

interface CustomMapProps {
  userLocation?: {
    latitude: number
    longitude: number
  }
  aeds?: AED[]
  onAEDPress?: (aed: AED) => void
}

const CustomMap: React.FC<CustomMapProps> = ({ userLocation, aeds = [], onAEDPress }) => {
  const [mapError, setMapError] = useState<string | null>(null)

  // For web platform, we'll use a simple placeholder
  if (Platform.OS === "web") {
    return (
      <View style={styles.webMapContainer}>
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapTitle}>Map View</Text>
          {userLocation && (
            <Text style={styles.webMapText}>
              Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          )}
          {aeds.length > 0 && (
            <View style={styles.aedList}>
              <Text style={styles.aedListTitle}>Nearby AEDs:</Text>
              {aeds.slice(0, 3).map((aed) => (
                <Text key={aed.id} style={styles.aedItem}>
                  📍 {aed.name} - {aed.address}
                </Text>
              ))}
            </View>
          )}
          <Text style={styles.webMapNote}>Note: Interactive map requires mobile app</Text>
        </View>
      </View>
    )
  }

  // For mobile platforms, show a placeholder until react-native-maps is properly set up
  return (
    <View style={styles.mobileMapContainer}>
      <View style={styles.mobileMapPlaceholder}>
        <Text style={styles.mobileMapTitle}>Map Component</Text>
        <Text style={styles.mobileMapText}>
          Map functionality will be available when react-native-maps is configured
        </Text>
        {userLocation && (
          <Text style={styles.mobileMapText}>
            Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  webMapContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e8f4f8",
    borderWidth: 2,
    borderColor: "#b0d4e3",
    borderStyle: "dashed",
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c5282",
    marginBottom: 10,
  },
  webMapText: {
    fontSize: 14,
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 8,
  },
  webMapNote: {
    fontSize: 12,
    color: "#718096",
    fontStyle: "italic",
    marginTop: 10,
  },
  aedList: {
    marginTop: 15,
    width: "100%",
  },
  aedListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c5282",
    marginBottom: 8,
    textAlign: "center",
  },
  aedItem: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 4,
    textAlign: "center",
  },
  mobileMapContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    overflow: "hidden",
  },
  mobileMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#edf2f7",
    borderWidth: 1,
    borderColor: "#cbd5e0",
  },
  mobileMapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 10,
  },
  mobileMapText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 8,
  },
})

export default CustomMap
