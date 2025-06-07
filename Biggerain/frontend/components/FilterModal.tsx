"use client"

import React from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ForumFilters } from "../types/forum"

const { width, height } = Dimensions.get("window")

interface FilterModalProps {
  visible: boolean
  filters: ForumFilters
  onClose: () => void
  onApply: (filters: ForumFilters) => void
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, filters, onClose, onApply }) => {
  const [localFilters, setLocalFilters] = React.useState<ForumFilters>(filters)

  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: ForumFilters = {
      type: undefined,
      verified: undefined,
      sort: "latest",
      search: "",
    }
    setLocalFilters(resetFilters)
  }

  const categories = [
    { key: undefined, label: "All Categories", icon: "apps" },
    { key: "fire" as const, label: "Fire", icon: "flame" },
    { key: "health" as const, label: "Health", icon: "medical" },
    { key: "security" as const, label: "Security", icon: "shield" },
    { key: "other" as const, label: "Other Emergencies", icon: "warning" },
  ]

  const sortOptions = [
    { key: "latest" as const, label: "Latest first", icon: "time" },
    { key: "nearest" as const, label: "Nearest to you", icon: "location" },
  ]

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key || "all"}
                style={[styles.option, localFilters.type === category.key && styles.selectedOption]}
                onPress={() => setLocalFilters({ ...localFilters, type: category.key })}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={localFilters.type === category.key ? "#007AFF" : "#666"}
                />
                <Text style={[styles.optionText, localFilters.type === category.key && styles.selectedOptionText]}>
                  {category.label}
                </Text>
                {localFilters.type === category.key && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Verification Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Status</Text>

            <TouchableOpacity
              style={[styles.option, localFilters.verified === undefined && styles.selectedOption]}
              onPress={() => setLocalFilters({ ...localFilters, verified: undefined })}
            >
              <Ionicons name="apps" size={20} color={localFilters.verified === undefined ? "#007AFF" : "#666"} />
              <Text style={[styles.optionText, localFilters.verified === undefined && styles.selectedOptionText]}>
                All Reports
              </Text>
              {localFilters.verified === undefined && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, localFilters.verified === true && styles.selectedOption]}
              onPress={() => setLocalFilters({ ...localFilters, verified: true })}
            >
              <Ionicons name="shield-checkmark" size={20} color={localFilters.verified === true ? "#007AFF" : "#666"} />
              <Text style={[styles.optionText, localFilters.verified === true && styles.selectedOptionText]}>
                Verified Only
              </Text>
              {localFilters.verified === true && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.option, localFilters.sort === option.key && styles.selectedOption]}
                onPress={() => setLocalFilters({ ...localFilters, sort: option.key })}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={localFilters.sort === option.key ? "#007AFF" : "#666"}
                />
                <Text style={[styles.optionText, localFilters.sort === option.key && styles.selectedOptionText]}>
                  {option.label}
                </Text>
                {localFilters.sort === option.key && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  resetText: {
    fontSize: 16,
    color: "#007AFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  selectedOption: {
    backgroundColor: "#E3F2FD",
  },
  optionText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default FilterModal
