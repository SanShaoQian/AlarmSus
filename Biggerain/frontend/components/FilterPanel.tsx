"use client"

import { StyleSheet, Switch, Text, View } from "react-native"

type Props = {
  showAEDs: boolean
  setShowAEDs: (val: boolean) => void
}

export default function FilterPanel({ showAEDs, setShowAEDs }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Show AEDs</Text>
      <Switch value={showAEDs} onValueChange={setShowAEDs} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 110,
    right: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginRight: 8,
    fontSize: 16,
  },
})
