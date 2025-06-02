import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ImageStyle,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Footer from '../components/Footer';

// Type definitions
interface NewsItem {
  id: string;
  title: string;
  isVerified: boolean;
  timestamp: string;
  location: string;
  imageUrl: string;
  readMoreUrl: string;
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  newsCard: ViewStyle;
  cardHeader: ViewStyle;
  titleContainer: ViewStyle;
  title: TextStyle;
  verifiedIcon: ViewStyle;
  timestamp: TextStyle;
  location: TextStyle;
  newsImage: ImageStyle;
  readMoreLink: TextStyle;
}

const IndexScreen: React.FC = () => {
  // Sample news data - in a real app this would come from props or state
  const newsData: NewsItem = {
    id: '1',
    title: 'Fire in Kranji',
    isVerified: true,
    timestamp: '1 hour ago',
    location: 'A fire at Block 39, Telok Blangah Rise',
    imageUrl: 'https://dam.mediacorp.sg/image/upload/s--EDoeDMAN--/f_auto,q_auto/c_fill,g_auto,h_676,w_1200/v1/mediacorp/cna/image/2022/01/29/d0208994-1d43-4c31-9a6d-82df8333a9a3.jpg?itok=1w6lh1qI',
    readMoreUrl: 'https://www.channelnewsasia.com/singapore/fire-scdf-telok-blangah-2467611'
  };

  const handleLinkPress = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URI: ${url}`);
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* News Card */}
        <View style={styles.newsCard}>
          {/* Header with title, verified icon, and timestamp */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{newsData.title}</Text>
              {newsData.isVerified && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color="#1DA1F2"
                />
              )}
            </View>
            <Text style={styles.timestamp}>{newsData.timestamp}</Text>
          </View>
          
          {/* Location */}
          <Text style={styles.location}>{newsData.location}</Text>
          
          {/* Image */}
          <Image 
            source={{ uri: newsData.imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
          
          {/* Read more link */}
          <TouchableOpacity 
            onPress={() => handleLinkPress(newsData.readMoreUrl)}
          >
            <Text style={styles.readMoreLink}>
              Read more: {newsData.readMoreUrl}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  location: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  readMoreLink: {
    fontSize: 12,
    color: '#1DA1F2',
    lineHeight: 16,
  },
});

export default IndexScreen;