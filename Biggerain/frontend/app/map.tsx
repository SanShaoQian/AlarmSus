"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import CustomMap from "../components/CustomMap"
import { fetchNearbyAEDs, type AED } from "../services/aedService"

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [aeds, setAeds] = useState<AED[]>([])
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const getCurrentLocation = async () => {
    setLocationLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required to find nearby AEDs")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      setUserLocation({ latitude, longitude })

      // Fetch nearby AEDs
      setLoading(true)
      const nearbyAEDs = await fetchNearbyAEDs(latitude, longitude)
      setAeds(nearbyAEDs)
    } catch (error) {
      console.error("Error getting location:", error)
      Alert.alert("Error", "Unable to get current location")
    } finally {
      setLocationLoading(false)
      setLoading(false)
    }
  }

  const handleAEDPress = (aed: AED) => {
    Alert.alert(aed.name, `Address: ${aed.address}\nDistance: ${aed.distance?.toFixed(2)} km`, [
      { text: "OK" },
      { text: "Get Directions", onPress: () => openDirections(aed) },
    ])
  }

  const openDirections = (aed: AED) => {
    // This would open directions in a maps app
    Alert.alert("Directions", `Opening directions to ${aed.name}`)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Nearby AEDs</Text>
        <Text style={styles.subtitle}>Automated External Defibrillators</Text>
      </View>

      <View style={styles.locationSection}>
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="location" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.locationButtonText}>{locationLoading ? "Getting Location..." : "Use My Location"}</Text>
        </TouchableOpacity>

        {userLocation && (
          <Text style={styles.locationText}>
            📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.mapSection}>
        <CustomMap userLocation={userLocation} aeds={aeds} onAEDPress={handleAEDPress} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Finding nearby AEDs...</Text>
        </View>
      )}

      {aeds.length > 0 && (
        <View style={styles.aedListSection}>
          <Text style={styles.aedListTitle}>Nearby AEDs ({aeds.length})</Text>
          {aeds.map((aed) => (
            <TouchableOpacity key={aed.id} style={styles.aedItem} onPress={() => handleAEDPress(aed)}>
              <View style={styles.aedIcon}>
                <Ionicons name="medical" size={24} color="#FF3B30" />
              </View>
              <View style={styles.aedInfo}>
                <Text style={styles.aedName}>{aed.name}</Text>
                <Text style={styles.aedAddress}>{aed.address}</Text>
                {aed.distance && <Text style={styles.aedDistance}>{aed.distance.toFixed(2)} km away</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && aeds.length === 0 && userLocation && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color="#ccc" />
          <Text style={styles.noResultsText}>No AEDs found in your area</Text>
          <Text style={styles.noResultsSubtext}>Try expanding your search radius</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  locationSection: {
    padding: 20,
  },
  locationButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  aedListSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aedListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  aedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  aedIcon: {
    marginRight: 15,
  },
  aedInfo: {
    flex: 1,
  },
  aedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  aedAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  aedDistance: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
  noResultsContainer: {
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
  },
})
