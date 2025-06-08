"use client"

import * as Location from "expo-location"
import { Suspense, lazy, useEffect, useState } from "react"
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { fetchNearbyAEDs } from "../services/aed/aedService"
import { AED } from "../types/aed"

const MapView = lazy(() => import('react-native-maps'))
const Marker = lazy(() => import('react-native-maps').then(mod => ({ default: mod.Marker })))

type Props = {
  showAEDs: boolean
}

export default function CustomMap({ showAEDs }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [nearbyAeds, setNearbyAeds] = useState<AED[]>([])
  const [searchRadius, setSearchRadius] = useState(500)

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
        // Default to Singapore center coordinates
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
      fetchNearbyAEDs(
        location.coords.latitude,
        location.coords.longitude,
        searchRadius
      ).then(setNearbyAeds)
    } else {
      setNearbyAeds([])
    }
  }, [showAEDs, location, searchRadius])

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    Linking.openURL(url)
  }

  const adjustSearchRadius = (increase: boolean) => {
    setSearchRadius(prev => {
      const newRadius = increase ? prev + 500 : Math.max(500, prev - 500)
      return newRadius
    })
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={<View style={styles.loadingContainer}><Text>Loading map...</Text></View>}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          {showAEDs && nearbyAeds.map((aed) => (
            <Marker
              key={aed.id}
              coordinate={{
                latitude: aed.latitude,
                longitude: aed.longitude,
              }}
              title={aed.building_name}
              description={`${aed.location_description}\nDistance: ${(aed.distance_km * 1000).toFixed(0)}m`}
              onCalloutPress={() => openInGoogleMaps(aed.latitude, aed.longitude)}
            />
          ))}
        </MapView>
      </Suspense>

      {showAEDs && (
        <View style={styles.controlsOverlay}>
          <View style={styles.controlsContainer}>
            <Text style={styles.radiusText}>Search Radius: {searchRadius}m</Text>
            <View style={styles.radiusControls}>
              <TouchableOpacity 
                style={styles.radiusButton} 
                onPress={() => adjustSearchRadius(false)}
              >
                <Text style={styles.radiusButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.radiusButton} 
                onPress={() => adjustSearchRadius(true)}
              >
                <Text style={styles.radiusButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.aedCountText}>
            {nearbyAeds.length > 0 
              ? `Found ${nearbyAeds.length} AEDs nearby`
              : `No AEDs found within ${searchRadius}m`}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  controlsContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  radiusText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  radiusControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  radiusButton: {
    width: 40,
    height: 40,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  radiusButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  aedCountText: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 4,
    fontSize: 14,
    color: "#333",
  },
})
