"use client"

import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { fetchAEDs } from "../services/onemap"

const { width, height } = Dimensions.get("window")

type Props = {
  showAEDs: boolean
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371e3 // in meters

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) // in meters
}

export default function CustomMap({ showAEDs }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [nearbyAeds, setNearbyAeds] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.")
          return
        }

        const loc = await Location.getCurrentPositionAsync({})
        setLocation(loc)
      } catch (error) {
        console.log("Location error:", error)
        // Set a default location for demo purposes
        setLocation({
          coords: {
            latitude: 1.3521,
            longitude: 103.8198,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        })
      }
    })()
  }, [])

  useEffect(() => {
    if (showAEDs && location) {
      fetchAEDs().then((allAeds) => {
        const nearby = allAeds.filter((aed: any) => {
          const lat = Number.parseFloat(aed.LATITUDE)
          const lon = Number.parseFloat(aed.LONGITUDE)
          if (isNaN(lat) || isNaN(lon)) return false
          return haversineDistance(lat, lon, location.coords.latitude, location.coords.longitude) < 500 // 500m
        })
        setNearbyAeds(nearby)
      })
    } else {
      setNearbyAeds([])
    }
  }, [showAEDs, location])

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    Linking.openURL(url)
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>Interactive Map</Text>
        {location && (
          <Text style={styles.locationText}>
            Current Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}

        <Text style={styles.mapNote}>Map will display here in native app</Text>

        {showAEDs && nearbyAeds.length > 0 && (
          <View style={styles.aedList}>
            <Text style={styles.aedTitle}>Nearby AEDs ({nearbyAeds.length})</Text>
            {nearbyAeds.slice(0, 3).map((aed, index) => (
              <TouchableOpacity
                key={index}
                style={styles.aedItem}
                onPress={() => {
                  const lat = Number.parseFloat(aed.LATITUDE)
                  const lon = Number.parseFloat(aed.LONGITUDE)
                  openInGoogleMaps(lat, lon)
                }}
              >
                <Text style={styles.aedName}>{aed.DESCRIPTION || "AED"}</Text>
                <Text style={styles.aedAddress}>{aed.ADDRESS || "No address info"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showAEDs && nearbyAeds.length === 0 && location && (
          <Text style={styles.noAedsText}>No AEDs found within 500m</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  mapNote: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  aedList: {
    width: "100%",
    maxWidth: 300,
  },
  aedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  aedItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  },
  noAedsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
})
