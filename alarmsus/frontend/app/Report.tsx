"use client"

import { useState } from "react"
import { LOCAL_IP, DEV_IP, PROD_IP, NODE_ENV } from '@env';
import { useRouter } from "expo-router"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import * as ImagePicker from "expo-image-picker"

const { width: screenWidth } = Dimensions.get("window")

// Get the local IP address for development

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// If production, use PROD_IP no matter what
// Else if mobile device, use DEV_IP (your computer’s LAN IP)
// Else use LOCAL_IP (your laptop’s localhost)

const API_BASE_URL = NODE_ENV === 'production'
  ? PROD_IP
  : isMobile
    ? DEV_IP
    : LOCAL_IP;

interface EmergencyServices {
  police: boolean
  ambulance: boolean
  fire: boolean
}

export default function ReportScreen() {
  const router = useRouter()
  const [caption, setCaption] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [selectedServices, setSelectedServices] = useState<EmergencyServices>({
    police: false,
    ambulance: false,
    fire: false,
  })
  const [isInDanger, setIsInDanger] = useState(false)
  const [location, setLocation] = useState("")
  const [reportAnonymously, setReportAnonymously] = useState(false)
  const [legalAgreement, setLegalAgreement] = useState(false)
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImagePicker = async (source: "camera" | "library") => {
    setShowImageModal(false)

    try {
      let result
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission needed", "Camera permission is required to take photos")
          return
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission needed", "Photo library permission is required")
          return
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      }

      if (!result.canceled && result.assets[0]) {
        setUploadedImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required")
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = currentLocation.coords

      const address = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (address.length > 0) {
        const addr = address[0]
        const fullAddress =
          `${addr.street || ""} ${addr.name || ""} ${addr.city || ""} ${addr.region || ""} ${addr.postalCode || ""}`.trim()
        setLocation(fullAddress)
      }
    } catch (error) {
      console.error("Location Error:", error)
      Alert.alert("Error", "Unable to get current location")
    }
  }

  const toggleService = (service: keyof EmergencyServices) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  const hasSelectedService = selectedServices.police || selectedServices.ambulance || selectedServices.fire
  const isSubmitActive = legalAgreement && (!isEmergency || (isEmergency && hasSelectedService))

  const handleSubmit = async () => {
    if (!legalAgreement) {
      Alert.alert("Agreement Required", "Please accept the legal agreement to continue")
      return
    }

    if (isEmergency && !hasSelectedService) {
      Alert.alert("Selection Required", "Please select at least one emergency service")
      return
    }

    if (!caption.trim()) {
      Alert.alert("Caption Required", "Please provide a description of the incident")
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        caption: caption.trim(),
        isEmergency,
        emergencyServices: selectedServices,
        isInDanger,
        location: location.trim(),
        reportAnonymously,
        imageUrl: uploadedImageUri,
      }

      console.log("Submitting report to:", `${API_BASE_URL}/api/reports`)

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      const data = await response.json()

      if (data.success) {
        setShowSubmissionSuccess(true)
      } else {
        Alert.alert("Error", data.message || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      Alert.alert("Network Error", "Failed to submit report. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCaption("")
    setIsEmergency(false)
    setSelectedServices({ police: false, ambulance: false, fire: false })
    setIsInDanger(false)
    setLocation("")
    setReportAnonymously(false)
    setLegalAgreement(false)
    setUploadedImageUri(null)
    setShowSubmissionSuccess(false)
  }

  if (showSubmissionSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={80} color="#000000" />
            </View>
          </View>

          <Text style={styles.submittedText}>Submitted</Text>
          <Text style={styles.meantimeText}>Report submitted successfully!</Text>

          <View style={styles.optionsGrid}>
            <TouchableOpacity style={styles.optionBox} onPress={resetForm}>
              <View style={styles.optionIconBox}>
                <Ionicons name="warning-outline" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Report New{"\n"}Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBox} onPress={() => router.push("/")}>
              <View style={styles.optionIconBox}>
                <Ionicons name="home-outline" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Go to{"\n"}Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <TouchableOpacity style={styles.uploadBox} onPress={() => setShowImageModal(true)}>
          {uploadedImageUri ? (
            <Image source={{ uri: uploadedImageUri }} style={styles.uploadedImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadContent}>
              <Ionicons name="image-outline" size={48} color="#CCCCCC" />
              <Text style={styles.uploadText}>UPLOAD IMAGE</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Describe the incident..."
            placeholderTextColor="#CCCCCC"
            multiline
          />
        </View>

        {/* Emergency Questions */}
        <View style={styles.questionContainer}>
          <View style={styles.questionRow}>
            <Text style={styles.questionText}>Is this an emergency?</Text>
            <TouchableOpacity style={styles.squareCheckbox} onPress={() => setIsEmergency(!isEmergency)}>
              {isEmergency && <Ionicons name="checkmark" size={16} color="#000000" />}
            </TouchableOpacity>
          </View>

          {isEmergency && (
            <>
              <Text style={styles.selectText}>Select emergency services needed:</Text>
              <Text style={styles.selectSubText}>Please select at least one:</Text>

              {(["police", "ambulance", "fire"] as const).map((service) => (
                <View key={service} style={styles.serviceRow}>
                  <Text style={styles.serviceText}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                    {service === "fire" && " department"}
                  </Text>
                  <TouchableOpacity style={styles.squareCheckbox} onPress={() => toggleService(service)}>
                    {selectedServices[service] && <Ionicons name="checkmark" size={16} color="#000000" />}
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <View style={styles.questionRow}>
            <Text style={styles.questionText}>Are you in danger?</Text>
            <TouchableOpacity style={styles.squareCheckbox} onPress={() => setIsInDanger(!isInDanger)}>
              {isInDanger && <Ionicons name="checkmark" size={16} color="#000000" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location:</Text>
          <TextInput
            style={styles.locationInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location or use current location"
            placeholderTextColor="#CCCCCC"
          />
          <View style={styles.locationUnderline} />
        </View>

        <TouchableOpacity style={styles.currentLocationButton} onPress={handleCurrentLocation}>
          <Text style={styles.currentLocationText}>Use my current location</Text>
          <Ionicons name="location-outline" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Options */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity style={styles.circleCheckbox} onPress={() => setReportAnonymously(!reportAnonymously)}>
            {reportAnonymously && <View style={styles.circleChecked} />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>Report anonymously</Text>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity style={styles.circleCheckbox} onPress={() => setLegalAgreement(!legalAgreement)}>
            {legalAgreement && <View style={styles.circleChecked} />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I understand that providing false information may have legal consequences
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitActive && styles.submitButtonActive]}
          onPress={handleSubmit}
          disabled={!isSubmitActive || isSubmitting}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Report"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageModal(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleImagePicker("library")}>
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleImagePicker("camera")}>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowImageModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  uploadBox: {
    height: 180,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    color: "#CCCCCC",
    fontWeight: "500",
    marginTop: 8,
    letterSpacing: 1,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  captionContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    color: "#333333",
    minHeight: 80,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  selectText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginBottom: 4,
  },
  selectSubText: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 16,
  },
  serviceText: {
    fontSize: 16,
    color: "#000000",
  },
  squareCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginBottom: 8,
  },
  locationInput: {
    fontSize: 16,
    paddingVertical: 8,
    color: "#333333",
  },
  locationUnderline: {
    height: 1,
    backgroundColor: "#CCCCCC",
    marginTop: 4,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  currentLocationText: {
    fontSize: 14,
    color: "#000000",
    marginRight: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  circleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  circleChecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#000000",
  },
  checkboxText: {
    fontSize: 14,
    color: "#000000",
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#6B1A1A",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonActive: {
    backgroundColor: "#FF3B30",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: screenWidth * 0.8,
    maxWidth: 300,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
  modalCancel: {
    paddingVertical: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    fontWeight: "500",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
  },
  submittedText: {
    fontSize: 32,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 16,
  },
  meantimeText: {
    fontSize: 18,
    color: "#999999",
    marginBottom: 32,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 300,
  },
  optionBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  optionIconBox: {
    width: 60,
    height: 60,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
  },
})
