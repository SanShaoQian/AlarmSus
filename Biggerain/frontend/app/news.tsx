"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type React from "react"
import {
  Image,
  type ImageStyle,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  type TextStyle,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native"
import Footer from "../components/Footer"

// Type definitions
interface NewsItem {
  id: string
  title: string
  isVerified: boolean
  timestamp: string
  location: string
  imageUrl: string
  readMoreUrl: string
}

interface Styles {
  container: ViewStyle
  content: ViewStyle
  newsCard: ViewStyle
  cardHeader: ViewStyle
  titleContainer: ViewStyle
  title: TextStyle
  verifiedIcon: ViewStyle
  timestamp: TextStyle
  location: TextStyle
  newsImage: ImageStyle
  readMoreLink: TextStyle
}

const NewsScreen: React.FC = () => {
  const router = useRouter()

  // Sample news data - in a real app this would come from props or state
  // TODO: When backend is implemented, ensure each news item has:
  // - Unique ID that maps to corresponding forum post
  // - Forum post ID for direct navigation
  // - Proper data synchronization between news and forum content
  const newsData: NewsItem = {
    id: "1", // This ID should map to a specific forum post when backend is ready
    title: "Fire in Kranji",
    isVerified: true,
    timestamp: "1 hour ago",
    location: "A fire at Block 39, Telok Blangah Rise",
    imageUrl:
      "https://dam.mediacorp.sg/image/upload/s--EDoeDMAN--/f_auto,q_auto/c_fill,g_auto,h_676,w_1200/v1/mediacorp/cna/image/2022/01/29/d0208994-1d43-4c31-9a6d-82df8333a9a3.jpg?itok=1w6lh1qI",
    readMoreUrl: "https://www.channelnewsasia.com/singapore/fire-scdf-telok-blangah-2467611",
  }

  const handleLinkPress = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        console.log(`Don't know how to open URI: ${url}`)
      }
    } catch (error) {
      console.error("An error occurred", error)
    }
  }

  const navigateToForum = () => {
    // TODO: When backend is implemented, this should:
    // 1. Fetch the corresponding forum post ID for this news item
    // 2. Pass the forum post ID instead of the news item ID
    // 3. The forum page should automatically open and scroll to the specific post

    // Navigate to forum with the specific news item ID
    // Currently using news item ID directly - this will need backend mapping
    router.push({
      pathname: "/forum",
      params: {
        id: newsData.id,
        // TODO: Add additional params when backend is ready:
        // forumPostId: mappedForumPostId,
        // autoOpen: true
      },
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* News Card - Clickable block that navigates to forum */}
        {/* TODO: When backend is implemented, add:
            - Loading state while navigating
            - Error handling for failed navigation
            - Analytics tracking for news-to-forum navigation
            - Deep linking support for specific forum posts
        */}
        <TouchableOpacity style={styles.newsCard} onPress={navigateToForum} activeOpacity={0.9}>
          {/* Header with title, verified icon, and timestamp */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{newsData.title}</Text>
              {newsData.isVerified && <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />}
            </View>
            <Text style={styles.timestamp}>{newsData.timestamp}</Text>
          </View>

          {/* Location */}
          <Text style={styles.location}>{newsData.location}</Text>

          {/* Image */}
          <Image source={{ uri: newsData.imageUrl }} style={styles.newsImage} resizeMode="cover" />

          {/* Read more link */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation() // Prevent triggering the parent onPress
              handleLinkPress(newsData.readMoreUrl)
            }}
          >
            <Text style={styles.readMoreLink}>Read more: {newsData.readMoreUrl}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </View>
  )
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  newsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginRight: 6,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  timestamp: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
  },
  location: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 12,
    lineHeight: 20,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  readMoreLink: {
    fontSize: 12,
    color: "#1DA1F2",
    lineHeight: 16,
  },
})

export default NewsScreen
