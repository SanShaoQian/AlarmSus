"use client"

import * as Location from "expo-location"
import { Suspense, useEffect, useState } from "react"
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { fetchNearbyAEDs } from "../services/aed/aedService"
import { AED } from "../types/aed"
import { getNearbyEntities } from '../backend/utils/supabaseClient'

// React Native Maps (only used on native)
import MapView, { Marker as RNMarker } from 'react-native-maps'

let MapContainer: any = View;
let TileLayer: any = View;
let Marker: any = View;
let Popup: any = View;
let L: any = null;

if (Platform.OS === 'web') {
  const leaflet = require('react-leaflet');
  const leafletBase = require('leaflet');
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  Marker = leaflet.Marker;
  Popup = leaflet.Popup;
  L = leafletBase.default;

  require('leaflet/dist/leaflet.css');

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
}

type Props = {
  showAEDs: boolean
}

interface MapEntity {
  id: string;
  type: string;
  title: string;
  latitude: number;
  longitude: number;
  distance: number;
}

const WebMap = ({ entities, showAEDs, center }: { entities: MapEntity[], showAEDs: boolean, center: [number, number] }) => (
  <div style={{ height: '100%', width: '100%' }}>
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {entities
        .filter(entity => entity.type === 'report' || (showAEDs && entity.type === 'aed'))
        .map(entity => (
          <Marker
            key={`${entity.type}-${entity.id}`}
            position={[entity.latitude, entity.longitude]}
            icon={L.icon({
              iconUrl: entity.type === 'aed'
                ? 'https://yourdomain.com/markers/aed-marker.svg'
                : 'https://yourdomain.com/markers/report-marker.svg',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div>
                <strong>{entity.title}</strong>
                <div>{`${Math.round(entity.distance)}m away`}</div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  </div>
)

const NativeMap = ({ entities, showAEDs, center }: { entities: MapEntity[], showAEDs: boolean, center: [number, number] }) => (
  <MapView
    style={{ flex: 1 }}
    initialRegion={{
      latitude: center[0],
      longitude: center[1],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    {entities
      .filter(entity => entity.type === 'report' || (showAEDs && entity.type === 'aed'))
      .map(entity => (
        <RNMarker
          key={`${entity.type}-${entity.id}`}
          coordinate={{
            latitude: entity.latitude,
            longitude: entity.longitude,
          }}
          title={entity.title}
          description={`${Math.round(entity.distance)}m away`}
        />
      ))}
  </MapView>
)

export default function CustomMap({ showAEDs }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [nearbyAeds, setNearbyAeds] = useState<AED[]>([])
  const [searchRadius, setSearchRadius] = useState(500)
  const [entities, setEntities] = useState<MapEntity[]>([])
  const [center, setCenter] = useState<[number, number]>([1.3521, 103.8198]) // Default: Singapore

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.")
          return
        }

        const loc = await Location.getCurrentPositionAsync({})
        setLocation(loc)
        setCenter([loc.coords.latitude, loc.coords.longitude])
        setEntities(prev => [
          ...prev.filter(e => e.type !== "user_location"),
          {
            id: "user",
            type: "user_location",
            title: "You are here",
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            distance: 0
          }
        ]);
        
      } catch (error) {
        console.log("Location error:", error)
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

  useEffect(() => {
    const loadEntities = async () => {
      if (!location) return

      try {
        const data = await getNearbyEntities(location.coords.longitude, location.coords.latitude, 5000)
        if (data) {
          setEntities(data)
        }
      } catch (error) {
        console.error('Error loading map entities:', error)
      }
    }

    loadEntities()
  }, [location])

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
        {Platform.OS === 'web' ? (
          <WebMap entities={entities} showAEDs={showAEDs} center={center} />
        ) : (
          <NativeMap entities={entities} showAEDs={showAEDs} center={center} />
        )}
      </Suspense>

      {showAEDs && (
        <View style={styles.controlsOverlay}>
          <View style={styles.controlsContainer}>
            <Text style={styles.radiusText}>Search Radius: {searchRadius}m</Text>
            <View style={styles.radiusControls}>
              <TouchableOpacity style={styles.radiusButton} onPress={() => adjustSearchRadius(false)}>
                <Text style={styles.radiusButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radiusButton} onPress={() => adjustSearchRadius(true)}>
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
