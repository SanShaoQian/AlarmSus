import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ForumIncident } from "../types/forum"

const { width } = Dimensions.get("window")

interface IncidentCardProps {
  incident: ForumIncident
  onMapPress: (incident: ForumIncident) => void
  onAlertPress: (incident: ForumIncident) => void
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onMapPress, onAlertPress }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{incident.title}</Text>
          <View style={styles.timeAndStatus}>
            <Text style={styles.timeAgo}>{incident.timeAgo}</Text>
            <View style={[styles.verificationBadge, { backgroundColor: incident.verified ? "#007AFF" : "#FF9500" }]}>
              <Text style={styles.verificationText}>{incident.verified ? "verified" : "unverified"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.location}>{incident.location}</Text>
        <Text style={styles.caption} numberOfLines={3}>
          {incident.caption}
        </Text>
      </View>

      {/* Image - Display image if available */}
      {incident.imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: incident.imageUrl }} style={styles.image} resizeMode="cover" />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onAlertPress(incident)}>
          <Ionicons name="notifications" size={16} color="#666" />
          <Text style={styles.actionText}>{incident.alerts} alerted</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble" size={16} color="#666" />
          <Text style={styles.actionText}>{incident.comments} comments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onMapPress(incident)}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.actionText}>Map</Text>
          <Ionicons name="share" size={16} color="#666" style={{ marginLeft: 4 }} />
          <Text style={styles.actionText}>{incident.mapViews}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  timeAndStatus: {
    alignItems: "flex-end",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verificationText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
})

export default IncidentCard
