"use client"

import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import type React from "react"
import { useState } from "react"
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { submitIncidentReport } from "../backend/utils/supabaseClient"

const { width: screenWidth } = Dimensions.get("window")

const ReportScreen: React.FC = () => {
  const router = useRouter()
  const [caption, setCaption] = useState<string>("")
  const [isEmergency, setIsEmergency] = useState<boolean>(false)
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: boolean }>({
    police: false,
    ambulance: false,
    fire: false,
  })
  const [isInDanger, setIsInDanger] = useState<boolean>(false)
  const [location, setLocation] = useState<string>("")
  const [showImageModal, setShowImageModal] = useState<boolean>(false)
  const [reportAnonymously, setReportAnonymously] = useState<boolean>(false)
  const [legalAgreement, setLegalAgreement] = useState<boolean>(false)
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState<boolean>(false)
  const [showLegalWarning, setShowLegalWarning] = useState<boolean>(false)
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null)
  const [reportScore, setReportScore] = useState<number>(10)

  const requestPermissions = async () => {
    // Request camera permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos')
      return false
    }

    // Request media library permissions
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (mediaStatus !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos')
      return false
    }

    return true
  }

  const handleImageOption = async (option: "camera" | "files"): Promise<void> => {
    setShowImageModal(false)

    const hasPermissions = await requestPermissions()
    if (!hasPermissions) return

    try {
      let result
      if (option === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      }

      if (!result.canceled) {
        setUploadedImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to capture/select image')
    }
  }

  const handleCaptionChange = (text: string): void => {
    setCaption(text)
  }

  const handleSpeechToText = (): void => {
    Alert.alert("Speech to Text", "Speech-to-text functionality to be implemented")
  }

  const handleCurrentLocation = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required to use this feature")
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
      console.error("Location Error: ", error)
      Alert.alert("Error", "Unable to get current location")
    }
  }

  const handleSOS = (): void => {
    Alert.alert("SOS", "SOS functionality to be implemented - will trigger emergency protocols")
  }

  const toggleService = (service: string): void => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  // Check if at least one emergency service is selected when emergency is checked
  const hasSelectedService = selectedServices.police || selectedServices.ambulance || selectedServices.fire

  // Check if form can be submitted
  const isSubmitActive = legalAgreement && (!isEmergency || (isEmergency && hasSelectedService))

  const handleUploadImage = (): void => {
    setShowImageModal(true)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!legalAgreement) {
      setShowLegalWarning(true)
      return
    }

    if (isEmergency && !hasSelectedService) {
      Alert.alert("Selection Required", "Please select at least one emergency service.")
      return
    }

    try {
      // Get emergency type
      let emergency_type: 'police' | 'ambulance' | 'fire' | 'others' | undefined;
      if (isEmergency) {
        if (selectedServices.police) emergency_type = 'police';
        else if (selectedServices.ambulance) emergency_type = 'ambulance';
        else if (selectedServices.fire) emergency_type = 'fire';
      }

      // Get coordinates from location string
      let latitude = 0, longitude = 0;
      try {
        const locationResult = await Location.geocodeAsync(location);
        if (locationResult.length > 0) {
          latitude = locationResult[0].latitude;
          longitude = locationResult[0].longitude;
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }

      // Prepare report data for LLM analysis
      const reportData = {
        text: caption,
        image_description: "Image uploaded by user", // You would need image analysis here
        related_reports: [], // You would need to fetch related reports here
      };

      // Call the LLM analyzer
      try {
        const response = await fetch('/api/analyze-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });
        
        const result = await response.json();
        setReportScore(result.urgency_score);
      } catch (error) {
        console.error('Error analyzing report:', error);
        // Default to showing the report if analysis fails
        setReportScore(10);
      }

      // Submit report
      await submitIncidentReport({
        title: caption.split('\n')[0] || 'Untitled Report',
        caption,
        emergency_type,
        is_in_danger: isInDanger,
        location,
        report_anonymously: reportAnonymously,
        image_url: uploadedImageUri || undefined,
        latitude,
        longitude
      });

      // Show success screen
      setShowSubmissionSuccess(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  }

  const handleReportNewIncident = (): void => {
    // Reset all form fields and go back to report form
    setCaption("")
    setIsEmergency(false)
    setSelectedServices({
      police: false,
      ambulance: false,
      fire: false,
    })
    setIsInDanger(false)
    setLocation("")
    setReportAnonymously(false)
    setLegalAgreement(false)
    setUploadedImageUri(null)
    setShowSubmissionSuccess(false) // This will show the main report form again
  }

  if (showSubmissionSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <View style={[
              styles.successIconCircle,
              reportScore < 3 && styles.warningIconCircle
            ]}>
              <Ionicons 
                name={reportScore >= 3 ? "checkmark" : "warning"} 
                size={80} 
                color="#000000" 
              />
            </View>
          </View>

          {reportScore >= 3 ? (
            <>
              <Text style={styles.submittedText}>Submitted</Text>
              <Text style={styles.meantimeText}>In the meantime...</Text>
            </>
          ) : (
            <>
              <Text style={styles.warningText}>Please do not submit fake reports.</Text>
              <Text style={styles.warningSubText}>
                Consequences are serious and this slows emergency responses.
              </Text>
            </>
          )}

          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => {
                // Navigate to map or show fire extinguisher locations
                Alert.alert("Fire Extinguisher", "Finding nearest fire extinguisher locations...")
              }}
            >
              <View style={styles.optionIconBox}>
                <Ionicons name="location" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Find the nearest{"\n"}fire extinguisher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => {
                // Show FAQ or help section
                Alert.alert("FAQ", "Opening commonly asked questions...")
              }}
            >
              <View style={styles.optionIconBox}>
                <Ionicons name="help-circle-outline" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Commonly asked{"\n"}questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => {
                // Trigger emergency call functionality
                Alert.alert("Emergency Services", "Calling emergency services...")
                handleSOS()
              }}
            >
              <View style={styles.optionIconBox}>
                <Ionicons name="call-outline" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Call Emergency{"\n"}Services</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBox} onPress={handleReportNewIncident}>
              <View style={styles.optionIconBox}>
                <Ionicons name="warning-outline" size={28} color="#000000" />
              </View>
              <Text style={styles.optionText}>Report New{"\n"}Incident</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Area */}
        <TouchableOpacity style={styles.uploadBox} onPress={handleUploadImage}>
          {uploadedImageUri ? (
            <Image source={{ uri: uploadedImageUri }} style={styles.uploadedImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadContent}>
              <Ionicons name="image-outline" size={48} color="#CCCCCC" />
              <Text style={styles.uploadText}>UPLOAD IMAGE</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={handleCaptionChange}
            placeholder="write a caption..."
            placeholderTextColor="#CCCCCC"
            multiline
          />
        </View>

        {/* Speech to Text */}
        <TouchableOpacity style={styles.speechToTextContainer} onPress={handleSpeechToText}>
          <Text style={styles.speechToTextText}>In a rush? Use speech to text!</Text>
          <Ionicons name="mic-outline" size={16} color="#999999" />
        </TouchableOpacity>

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
              <Text style={styles.selectText}>Select the type of emergency service needed:</Text>
              <Text style={styles.selectSubText}>Please select at least one:</Text>

              <View style={styles.serviceRow}>
                <Text style={styles.serviceText}>Police</Text>
                <TouchableOpacity style={styles.squareCheckbox} onPress={() => toggleService("police")}>
                  {selectedServices.police && <Ionicons name="checkmark" size={16} color="#000000" />}
                </TouchableOpacity>
              </View>

              <View style={styles.serviceRow}>
                <Text style={styles.serviceText}>Ambulance</Text>
                <TouchableOpacity style={styles.squareCheckbox} onPress={() => toggleService("ambulance")}>
                  {selectedServices.ambulance && <Ionicons name="checkmark" size={16} color="#000000" />}
                </TouchableOpacity>
              </View>

              <View style={styles.serviceRow}>
                <Text style={styles.serviceText}>Fire department</Text>
                <TouchableOpacity style={styles.squareCheckbox} onPress={() => toggleService("fire")}>
                  {selectedServices.fire && <Ionicons name="checkmark" size={16} color="#000000" />}
                </TouchableOpacity>
              </View>
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
            placeholder="Address address address address address address address address address"
            placeholderTextColor="#CCCCCC"
          />
          <View style={styles.locationUnderline} />
        </View>

        {/* Current Location Button */}
        <TouchableOpacity style={styles.currentLocationButton} onPress={handleCurrentLocation}>
          <Text style={styles.currentLocationText}>Use my current location</Text>
          <Ionicons name="location-outline" size={20} color="#000000" />
        </TouchableOpacity>

        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <Ionicons name="call" size={32} color="#FFFFFF" />
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>
        <Text style={styles.emergencyCallText}>An Urgent Emergency? Call 999!</Text>

        {/* Report Anonymously */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity style={styles.circleCheckbox} onPress={() => setReportAnonymously(!reportAnonymously)}>
            {reportAnonymously && <View style={styles.circleChecked} />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>Report anonymously</Text>
        </View>

        {/* Legal Agreement */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity style={styles.circleCheckbox} onPress={() => setLegalAgreement(!legalAgreement)}>
            {legalAgreement && <View style={styles.circleChecked} />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I understand that the dissemination of false or misleading information may be subject to legal consequences
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitActive && styles.submitButtonActive]}
          onPress={handleSubmit}
          disabled={!isSubmitActive}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Upload Modal */}
      <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImageModal(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleImageOption("files")}>
              <Text style={styles.modalOptionText}>Upload from device files</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={() => handleImageOption("camera")}>
              <Text style={styles.modalOptionText}>Take a picture from camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowImageModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Legal Warning Modal */}
      <Modal
        visible={showLegalWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegalWarning(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLegalWarning(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.warningTitle}>Required Agreement</Text>
            <Text style={styles.warningText}>
              Please check the box to confirm you understand the legal implications of submitting false information.
            </Text>

            <TouchableOpacity style={styles.warningButton} onPress={() => setShowLegalWarning(false)}>
              <Text style={styles.warningButtonText}>OK</Text>
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
    marginBottom: 8,
  },
  captionInput: {
    padding: 16,
    fontSize: 16,
    color: "#333333",
    minHeight: 60,
  },
  speechToTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  speechToTextText: {
    fontSize: 14,
    color: "#999999",
    marginRight: 8,
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
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 2,
  },
  emergencyCallText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
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
    backgroundColor: "#6B1A1A", // Dark red
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonActive: {
    backgroundColor: "#FF3B30", // Bright red
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
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  warningText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  warningButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF3B30", // Red circle border
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#4CD964", // Green circle
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
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
  },
  optionBox: {
    width: "48%",
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
  warningIconCircle: {
    backgroundColor: '#FFD700', // Yellow for warning
  },
  warningSubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
})

export default ReportScreen
