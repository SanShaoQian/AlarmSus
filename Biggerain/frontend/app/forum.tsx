"use client"

import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import type React from "react"
import { useEffect, useState } from "react"
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import Footer from "../components/Footer"

// Types
interface Comment {
  id: string
  username: string
  text: string
  thumbsUp: number
  thumbsDown: number
  userLiked?: boolean
  userDisliked?: boolean
  replies: Reply[]
  showReplies?: boolean
}

interface Reply {
  id: string
  username: string
  text: string
}

interface NewsItem {
  id: string
  title: string
  isVerified: boolean
  timestamp: string
  location: string
  distance?: string
  imageUrl: string
  alertCount: number
  commentCount: number
  shareCount: number
  userAlerted: boolean
  comments?: Comment[]
}

const ForumScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const postId = params.id as string

  // State
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedPost, setSelectedPost] = useState<string | null>(postId || null)
  const [showVerification, setShowVerification] = useState<boolean>(false)
  const [showThankYou, setShowThankYou] = useState<boolean>(false)
  const [newComment, setNewComment] = useState<string>("")
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
  const [showShareModal, setShowShareModal] = useState<boolean>(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>("")

  // Sample news data
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: "1",
      title: "Fire in Kranji",
      isVerified: true,
      timestamp: "1 hour ago",
      location: "A fire at Block 39, Telok Blangah Rise",
      distance: "200m away from you",
      imageUrl:
        "https://dam.mediacorp.sg/image/upload/s--EDoeDMAN--/f_auto,q_auto/c_fill,g_auto,h_676,w_1200/v1/mediacorp/cna/image/2022/01/29/d0208994-1d43-4c31-9a6d-82df8333a9a3.jpg?itok=1w6lh1qI",
      alertCount: 21,
      commentCount: 18,
      shareCount: 26,
      userAlerted: false,
      comments: [
        {
          id: "1",
          username: "commenter1",
          text: "comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment...",
          thumbsUp: 20,
          thumbsDown: 5,
          replies: [
            { id: "1-1", username: "user1", text: "Reply to comment 1" },
            { id: "1-2", username: "user2", text: "Another reply to comment 1" },
          ],
          showReplies: false,
        },
        {
          id: "2",
          username: "commenter2",
          text: "comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment...",
          thumbsUp: 15,
          thumbsDown: 3,
          replies: [{ id: "2-1", username: "user3", text: "Reply to comment 2" }],
          showReplies: false,
        },
      ],
    },
    {
      id: "2",
      title: "Someone collapsed!",
      isVerified: false,
      timestamp: "58 minutes ago",
      location: "",
      distance: "100m away from you",
      imageUrl: "",
      alertCount: 11,
      commentCount: 5,
      shareCount: 9,
      userAlerted: false,
      comments: [],
    },
    {
      id: "3",
      title: "Car crash",
      isVerified: false,
      timestamp: "26 minutes ago",
      location: "",
      distance: "500m away from you",
      imageUrl: "https://i.i-sgcm.com/news/article_news/2020/23101_p1_s_5.jpg",
      alertCount: 15,
      commentCount: 4,
      shareCount: 4,
      userAlerted: false,
      comments: [],
    },
  ])

  useEffect(() => {
    if (postId) {
      setSelectedPost(postId)
    }
  }, [postId])

  // Add this useEffect to ensure comments are properly displayed
  useEffect(() => {
    if (selectedPost) {
      const post = newsItems.find((item) => item.id === selectedPost)
      if (post && post.comments) {
        // This will trigger a re-render of the comments section
        const sortedComments = [...post.comments].sort((a, b) => b.thumbsUp - a.thumbsUp)
      }
    }
  }, [newsItems, selectedPost])

  // Handlers
  const handlePostPress = (id: string) => {
    setSelectedPost(id)
  }

  const handleBackToForum = () => {
    setSelectedPost(null)
  }

  const handleReplyPress = (commentId: string) => {
    setReplyingTo(commentId)
    setShowCommentInput(false)
  }

  const handleSubmitReply = () => {
    if (replyText.trim() && replyingTo && selectedPost) {
      // TODO: Add backend integration to add reply
      setNewsItems(
        newsItems.map((item) => {
          if (item.id === selectedPost && item.comments) {
            return {
              ...item,
              comments: item.comments.map((comment) => {
                if (comment.id === replyingTo) {
                  const newReply = {
                    id: `${comment.id}-${Date.now()}`, // Use timestamp for unique ID
                    username: "You",
                    text: replyText,
                  }
                  return {
                    ...comment,
                    replies: [newReply, ...comment.replies], // Add to beginning of array
                    showReplies: true,
                  }
                }
                return comment
              }),
            }
          }
          return item
        }),
      )

      // Clear input and hide reply box
      setReplyText("")
      setReplyingTo(null)

      // Make sure keyboard is dismissed
      Keyboard.dismiss()
    }
  }

  const handleAlert = (id: string) => {
    // TODO: Add backend integration to update alert count
    setNewsItems(
      newsItems.map((item) => {
        if (item.id === id && !item.userAlerted) {
          return {
            ...item,
            alertCount: item.alertCount + 1,
            userAlerted: true,
          }
        }
        return item
      }),
    )
  }

  const handleCommentPress = (id: string) => {
    if (selectedPost === null) {
      setSelectedPost(id)
    } else {
      setShowCommentInput(true)
      setReplyingTo(null)
    }
  }

  const handleMapPress = (id: string) => {
    // TODO: Add backend integration to get location data
    router.push("/map")
  }

  const handleSharePress = (id: string) => {
    setShowShareModal(true)
  }

  const handleShareOption = (platform: string) => {
    // TODO: Add sharing functionality
    setShowShareModal(false)
    if (selectedPost) {
      setNewsItems(
        newsItems.map((item) => {
          if (item.id === selectedPost) {
            return {
              ...item,
              shareCount: item.shareCount + 1,
            }
          }
          return item
        }),
      )
    }
    Alert.alert(`Shared to ${platform}`)
  }

  const handleSubmitComment = () => {
    if (newComment.trim() && selectedPost) {
      // Find the post and add the comment
      setNewsItems(
        newsItems.map((item) => {
          if (item.id === selectedPost) {
            const comments = item.comments || []
            const newCommentObj: Comment = {
              id: `comment-${Date.now()}`,
              username: "You",
              text: newComment,
              thumbsUp: 0,
              thumbsDown: 0,
              replies: [],
              showReplies: false,
            }

            return {
              ...item,
              commentCount: item.commentCount + 1,
              comments: [...comments, newCommentObj],
            }
          }
          return item
        }),
      )

      // Clear input and hide comment box
      setNewComment("")
      setShowCommentInput(false)

      // Make sure keyboard is dismissed
      Keyboard.dismiss()
    }
  }

  const handleThumbsUp = (commentId: string) => {
    // TODO: Add backend integration for likes
    if (!selectedPost) return

    setNewsItems(
      newsItems.map((item) => {
        if (item.id === selectedPost && item.comments) {
          return {
            ...item,
            comments: item.comments.map((comment) => {
              if (comment.id === commentId) {
                if (comment.userDisliked) {
                  return {
                    ...comment,
                    thumbsUp: comment.thumbsUp + 1,
                    thumbsDown: comment.thumbsDown - 1,
                    userLiked: true,
                    userDisliked: false,
                  }
                } else if (!comment.userLiked) {
                  return {
                    ...comment,
                    thumbsUp: comment.thumbsUp + 1,
                    userLiked: true,
                  }
                }
              }
              return comment
            }),
          }
        }
        return item
      }),
    )
  }

  const handleThumbsDown = (commentId: string) => {
    // TODO: Add backend integration for dislikes
    if (!selectedPost) return

    setNewsItems(
      newsItems.map((item) => {
        if (item.id === selectedPost && item.comments) {
          return {
            ...item,
            comments: item.comments.map((comment) => {
              if (comment.id === commentId) {
                if (comment.userLiked) {
                  return {
                    ...comment,
                    thumbsDown: comment.thumbsDown + 1,
                    thumbsUp: comment.thumbsUp - 1,
                    userDisliked: true,
                    userLiked: false,
                  }
                } else if (!comment.userDisliked) {
                  return {
                    ...comment,
                    thumbsDown: comment.thumbsDown + 1,
                    userDisliked: true,
                  }
                }
              }
              return comment
            }),
          }
        }
        return item
      }),
    )
  }

  const toggleReplies = (commentId: string) => {
    if (!selectedPost) return

    setNewsItems(
      newsItems.map((item) => {
        if (item.id === selectedPost && item.comments) {
          return {
            ...item,
            comments: item.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  showReplies: !comment.showReplies,
                }
              }
              return comment
            }),
          }
        }
        return item
      }),
    )
  }

  const handleVerify = (response: "yes" | "no" | "unsure") => {
    // TODO: Add backend integration for verification
    setShowVerification(false)
    setShowThankYou(true)

    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false)
    }, 3000)
  }

  // Get the selected post data
  const selectedPostData = selectedPost ? newsItems.find((item) => item.id === selectedPost) : null

  // Sort comments by thumbs up count if we have a selected post
  const sortedComments = selectedPostData?.comments
    ? [...selectedPostData.comments].sort((a, b) => b.thumbsUp - a.thumbsUp)
    : []

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <TouchableWithoutFeedback
        onPress={() => {
          setShowCommentInput(false)
          setReplyingTo(null)
          Keyboard.dismiss()
        }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!selectedPost ? (
              <>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="search for keywords"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* Filter and Sort */}
                <View style={styles.filterSortContainer}>
                  <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="funnel-outline" size={18} color="#333" />
                    <Text style={styles.filterSortText}>filter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.sortButton}>
                    <Ionicons name="swap-vertical-outline" size={18} color="#333" />
                    <Text style={styles.filterSortText}>sort</Text>
                  </TouchableOpacity>
                </View>

                {/* News Items List */}
                {newsItems.map((item) => (
                  <View key={item.id} style={styles.newsItemCard}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => handlePostPress(item.id)}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.timestampContainer}>
                          <Text style={styles.timestamp}>{item.timestamp}</Text>
                          {item.isVerified ? (
                            <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
                          ) : (
                            <Text style={styles.unverifiedText}>unverified</Text>
                          )}
                        </View>
                      </View>

                      <Text style={styles.distanceText}>{item.distance}</Text>

                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} resizeMode="cover" />
                      ) : null}

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, item.userAlerted && styles.alertedButton]}
                          onPress={() => handleAlert(item.id)}
                        >
                          <Ionicons name="warning-outline" size={18} color={item.userAlerted ? "#FFFFFF" : "#000000"} />
                          <Text style={[styles.actionText, item.userAlerted && styles.alertedText]}>
                            {item.alertCount} alerted
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleCommentPress(item.id)}>
                          <Ionicons name="chatbubble-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>{item.commentCount} comments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleMapPress(item.id)}>
                          <Ionicons name="location-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleSharePress(item.id)}>
                          <Ionicons name="share-social-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>{item.shareCount}</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Verification UI */}
                {showVerification && (
                  <View style={styles.verificationContainer}>
                    <Text style={styles.verificationText}>We need your help to verify! Is this real?</Text>
                    <View style={styles.verificationButtons}>
                      <TouchableOpacity
                        style={[styles.verifyButton, styles.yesButton]}
                        onPress={() => handleVerify("yes")}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                        <Text style={styles.verifyButtonText}>Yes</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.verifyButton, styles.unsureButton]}
                        onPress={() => handleVerify("unsure")}
                      >
                        <Ionicons name="help-circle-outline" size={20} color="#000" />
                        <Text style={styles.verifyButtonText}>I'm not sure</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.verifyButton, styles.noButton]}
                        onPress={() => handleVerify("no")}
                      >
                        <Ionicons name="close-circle-outline" size={20} color="#000" />
                        <Text style={styles.verifyButtonText}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Thank You Message */}
                {showThankYou && (
                  <View style={styles.thankYouContainer}>
                    <Ionicons name="thumbs-up" size={24} color="#6C5CE7" />
                    <Text style={styles.thankYouText}>
                      Thanks for verifying! Points will be awarded if your verification is true
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Selected Post View with Comments
              <>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={handleBackToForum}>
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                {selectedPostData && (
                  <>
                    {/* Selected News Item */}
                    <View style={styles.selectedNewsCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                          <Text style={styles.title}>{selectedPostData.title}</Text>
                          {selectedPostData.isVerified && (
                            <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
                          )}
                        </View>
                        <Text style={styles.timestamp}>{selectedPostData.timestamp}</Text>
                      </View>

                      {selectedPostData.location && <Text style={styles.location}>{selectedPostData.location}</Text>}

                      {selectedPostData.imageUrl && (
                        <Image
                          source={{ uri: selectedPostData.imageUrl }}
                          style={styles.newsImage}
                          resizeMode="cover"
                        />
                      )}

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, selectedPostData.userAlerted && styles.alertedButton]}
                          onPress={() => handleAlert(selectedPostData.id)}
                        >
                          <Ionicons
                            name="warning-outline"
                            size={18}
                            color={selectedPostData.userAlerted ? "#FFFFFF" : "#000000"}
                          />
                          <Text style={[styles.actionText, selectedPostData.userAlerted && styles.alertedText]}>
                            {selectedPostData.alertCount} alerted
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleCommentPress(selectedPostData.id)}
                        >
                          <Ionicons name="chatbubble-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>{selectedPostData.commentCount} comments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleMapPress(selectedPostData.id)}
                        >
                          <Ionicons name="location-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleSharePress(selectedPostData.id)}
                        >
                          <Ionicons name="share-social-outline" size={18} color="#000000" />
                          <Text style={styles.actionText}>{selectedPostData.shareCount}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Comments Section */}
                    {sortedComments.map((comment) => (
                      <View key={comment.id} style={styles.commentContainer}>
                        <View style={styles.commentHeader}>
                          <Ionicons name="person-circle-outline" size={24} color="#000000" />
                          <Text style={styles.commenterName}>{comment.username}</Text>
                        </View>

                        <Text style={styles.commentText} numberOfLines={3} ellipsizeMode="tail">
                          {comment.text}
                        </Text>

                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.commentAction} onPress={() => handleThumbsUp(comment.id)}>
                            <Ionicons
                              name={comment.userLiked ? "thumbs-up" : "thumbs-up-outline"}
                              size={18}
                              color={comment.userLiked ? "#FF0000" : "#000000"}
                            />
                            <Text style={[styles.commentActionText, comment.userLiked && styles.activeActionText]}>
                              {comment.thumbsUp}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.commentAction} onPress={() => handleThumbsDown(comment.id)}>
                            <Ionicons
                              name={comment.userDisliked ? "thumbs-down" : "thumbs-down-outline"}
                              size={18}
                              color={comment.userDisliked ? "#FF0000" : "#000000"}
                            />
                            <Text style={[styles.commentActionText, comment.userDisliked && styles.activeActionText]}>
                              {comment.thumbsDown}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.commentAction} onPress={() => handleReplyPress(comment.id)}>
                            <Ionicons name="arrow-undo-outline" size={18} color="#000000" />
                            <Text style={styles.commentActionText}>Reply</Text>
                          </TouchableOpacity>

                          {comment.replies.length > 0 && (
                            <TouchableOpacity style={styles.commentAction} onPress={() => toggleReplies(comment.id)}>
                              <Text style={styles.commentActionText}>
                                {comment.showReplies ? "Hide" : "Show"} {comment.replies.length} replies
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Replies */}
                        {comment.showReplies && comment.replies.length > 0 && (
                          <View style={styles.repliesContainer}>
                            {comment.replies.map((reply) => (
                              <View key={reply.id} style={styles.replyContainer}>
                                <View style={styles.replyHeader}>
                                  <Ionicons name="person-circle-outline" size={20} color="#000000" />
                                  <Text style={styles.replyUsername}>{reply.username}</Text>
                                </View>
                                <Text style={styles.replyText}>{reply.text}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Comment Input */}
      {showCommentInput && selectedPost && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            autoFocus
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitComment}>
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reply Input */}
      {replyingTo && selectedPost && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder={`Reply to ${selectedPostData?.comments?.find((c) => c.id === replyingTo)?.username}...`}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            autoFocus
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReply}>
            <Text style={styles.submitButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowShareModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share via</Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption("WhatsApp")}>
                <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption("Telegram")}>
                <Ionicons name="paper-plane" size={32} color="#0088cc" />
                <Text style={styles.shareOptionText}>Telegram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption("Instagram")}>
                <Ionicons name="logo-instagram" size={32} color="#C13584" />
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.copyLinkButton} onPress={() => handleShareOption("Copy Link")}>
              <Ionicons name="copy-outline" size={20} color="#000000" />
              <Text style={styles.copyLinkText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowShareModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterSortContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterSortText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  newsItemCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "400",
    marginRight: 4,
  },
  unverifiedText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontStyle: "italic",
  },
  distanceText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  alertedButton: {
    backgroundColor: "#FF0000",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#000000",
  },
  alertedText: {
    color: "#FFFFFF",
  },
  verificationContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  verificationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  yesButton: {
    backgroundColor: "#E8F5E9",
  },
  unsureButton: {
    backgroundColor: "#E3F2FD",
  },
  noButton: {
    backgroundColor: "#FFEBEE",
  },
  verifyButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  thankYouContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EAFE",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  thankYouText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
  },
  backButton: {
    marginBottom: 16,
  },
  selectedNewsCard: {
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
  location: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 12,
    lineHeight: 20,
  },
  commentContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commenterName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  commentText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  commentActionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666666",
  },
  activeActionText: {
    color: "#FF0000",
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 24,
  },
  replyContainer: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  replyUsername: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  replyText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#ffffff",
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F8F8F8",
  },
  submitButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  shareOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  shareOption: {
    alignItems: "center",
  },
  shareOptionText: {
    marginTop: 8,
    fontSize: 12,
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 16,
  },
  copyLinkText: {
    marginLeft: 8,
    fontSize: 16,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
})

export default ForumScreen
