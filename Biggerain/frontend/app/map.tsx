"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CustomMap from "../components/CustomMap"
import Footer from "../components/Footer"

type EmergencySituation = "health" | "security" | "fire" | "others" | null
type EmergencyEquipment = "aed" | "firstaid" | "fireextinguisher" | null

export default function MapScreen() {
  const [showAEDs, setShowAEDs] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSelections, setShowSelections] = useState(false)
  const [selectedSituations, setSelectedSituations] = useState<EmergencySituation[]>([
    "health",
    "security",
    "fire",
    "others",
  ])
  const [selectedEquipments, setSelectedEquipments] = useState<EmergencyEquipment[]>([])

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleSituationSelect = (situation: EmergencySituation) => {
    if (selectedSituations.includes(situation)) {
      setSelectedSituations(selectedSituations.filter((s) => s !== situation))
    } else {
      setSelectedSituations([...selectedSituations, situation])
    }
    // TODO: Implement logic for Health, Security, Fire, Others
    console.log("Selected situations:", selectedSituations)
  }

  const handleEquipmentSelect = (equipment: EmergencyEquipment) => {
    let newSelectedEquipments: EmergencyEquipment[]

    if (selectedEquipments.includes(equipment)) {
      newSelectedEquipments = selectedEquipments.filter((e) => e !== equipment)
    } else {
      newSelectedEquipments = [...selectedEquipments, equipment]
    }

    setSelectedEquipments(newSelectedEquipments)

    // Update AED visibility based on selection
    setShowAEDs(newSelectedEquipments.includes("aed"))

    // TODO: Implement logic for First Aid Kit and Fire Extinguishers
    console.log("Selected equipments:", newSelectedEquipments)
  }

  const toggleSelections = () => {
    setShowSelections(!showSelections)
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Location"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666666" />
          </TouchableOpacity>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Expandable Sections */}
        {showSelections && (
          <View style={styles.selectionsContainer}>
            {/* Emergency Situations */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Emergency Situations</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionButton, selectedSituations.includes("health") && styles.healthSelected]}
                  onPress={() => handleSituationSelect("health")}
                >
                  <Text style={[styles.optionText, selectedSituations.includes("health") && styles.selectedText]}>
                    Health
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, selectedSituations.includes("security") && styles.securitySelected]}
                  onPress={() => handleSituationSelect("security")}
                >
                  <Text style={[styles.optionText, selectedSituations.includes("security") && styles.selectedText]}>
                    Security
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, selectedSituations.includes("fire") && styles.fireSelected]}
                  onPress={() => handleSituationSelect("fire")}
                >
                  <Text style={[styles.optionText, selectedSituations.includes("fire") && styles.selectedText]}>
                    Fire
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, selectedSituations.includes("others") && styles.othersSelected]}
                  onPress={() => handleSituationSelect("others")}
                >
                  <Text style={[styles.optionText, selectedSituations.includes("others") && styles.selectedText]}>
                    Others
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Emergency Equipment */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Emergency Equipment</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    styles.equipmentButton,
                    selectedEquipments.includes("aed") && styles.aedSelected,
                  ]}
                  onPress={() => handleEquipmentSelect("aed")}
                >
                  <Text style={[styles.optionText, selectedEquipments.includes("aed") && styles.selectedText]}>
                    AED
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    styles.equipmentButton,
                    selectedEquipments.includes("firstaid") && styles.firstaidSelected,
                  ]}
                  onPress={() => handleEquipmentSelect("firstaid")}
                >
                  <Text style={[styles.optionText, selectedEquipments.includes("firstaid") && styles.selectedText]}>
                    First Aid Kit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    styles.equipmentButton,
                    selectedEquipments.includes("fireextinguisher") && styles.fireextinguisherSelected,
                  ]}
                  onPress={() => handleEquipmentSelect("fireextinguisher")}
                >
                  <Text
                    style={[styles.optionText, selectedEquipments.includes("fireextinguisher") && styles.selectedText]}
                  >
                    Fire Extinguishers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSelections}>
          <Text style={styles.toggleText}>{showSelections ? "Hide selection" : "Show selection"}</Text>
          <Ionicons name={showSelections ? "chevron-up" : "chevron-down"} size={16} color="#666666" />
        </TouchableOpacity>

        {/* Map */}
        <CustomMap showAEDs={showAEDs} />
      </View>
      <Footer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    paddingVertical: 0,
  },
  searchButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  selectionsContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  selectedText: {
    color: "#ffffff",
  },
  healthSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  securitySelected: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  fireSelected: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  othersSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  aedSelected: {
    backgroundColor: "#9C27B0",
    borderColor: "#9C27B0",
  },
  firstaidSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  fireextinguisherSelected: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  equipmentButton: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
})
