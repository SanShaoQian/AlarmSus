"use client"

import { useState } from "react"
import { Button, StyleSheet, TextInput, View } from "react-native"
import { searchAddress } from "../services/aed/bin/onemap"

export default function SearchBar() {
  const [query, setQuery] = useState("")

  const handleSearch = async () => {
    const results = await searchAddress(query)
    console.log(results) // Integrate with map later
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search address..." value={query} onChangeText={setQuery} />
      <Button title="Search" onPress={handleSearch} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
})
