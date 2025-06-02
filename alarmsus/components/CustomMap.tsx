import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Alert } from 'react-native';
import { fetchAEDs } from '../services/onemap';
import { Text, View, Linking, Button } from 'react-native';


const { width, height } = Dimensions.get('window');

type Props = {
  showAEDs: boolean;
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // in meters

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // in meters
}

export default function CustomMap({ showAEDs }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyAeds, setNearbyAeds] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    if (showAEDs && location) {
      fetchAEDs().then((allAeds) => {
        const nearby = allAeds.filter((aed: any) => {
          const lat = parseFloat(aed.LATITUDE);
          const lon = parseFloat(aed.LONGITUDE);
          return haversineDistance(lat, lon, location.coords.latitude, location.coords.longitude) < 500; // 500m
        });
        setNearbyAeds(nearby);
      });
    } else {
      setNearbyAeds([]);
    }
  }, [showAEDs, location]);

  if (!location) return null;

  return (
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
      <UrlTile
        urlTemplate="https://maps-a.onemap.sg/v3/Default/{z}/{x}/{y}.png"
        maximumZ={18}
        tileSize={256}
      />

      {nearbyAeds.map((aed, index) => {
        const latitude = parseFloat(aed.LATITUDE);
        const longitude = parseFloat(aed.LONGITUDE);

        const openInGoogleMaps = () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          Linking.openURL(url);
        };

        return (
          <Marker
            key={index}
            coordinate={{ latitude, longitude }}
            pinColor="blue"
          >
            <Callout tooltip>
              <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 6, maxWidth: 200 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {aed.DESCRIPTION || 'AED'}
                </Text>
                <Text style={{ marginBottom: 6 }}>{aed.ADDRESS || 'No address info'}</Text>
                <Button title="Get Directions" onPress={openInGoogleMaps} />
              </View>
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width,
    height,
  },
});
