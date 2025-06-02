"use client"

import { useState } from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import CustomMap from "../components/CustomMap"
import FilterPanel from "../components/FilterPanel"
import Footer from "../components/Footer"
import SearchBar from "../components/SearchBar"

export default function MapScreen() {
  const [showAEDs, setShowAEDs] = useState<boolean>(true)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <CustomMap showAEDs={showAEDs} />
        <SearchBar />
        <FilterPanel showAEDs={showAEDs} setShowAEDs={setShowAEDs} />
      </View>
      <Footer />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
})
