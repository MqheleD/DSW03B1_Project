// components/TagSwiperModal.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SessionStoryCard from "./SessionStoryCard";
import SessionDetailsModal from "./SessionDetailsModal";

const { width, height } = Dimensions.get("window");

export default function TagSwiperModal({ tag, sessions, onClose, onSessionSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSessionPress = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const handleCloseSessionDetails = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.swiperItem}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        style={styles.fullSizeCard} 
        onPress={() => handleSessionPress(item)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.image} 
        //   defaultSource={require("../assets/images/default-session.png")}
        />
        <View style={styles.overlay} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.speaker} numberOfLines={1}>{item.speaker}</Text>
          <Text style={styles.details} numberOfLines={2}>
            {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.room}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.noSessionsText}>No sessions found for {tag}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.tagTitle}>{tag} Sessions</Text>
        <Text style={styles.sessionCount}>
          {currentIndex + 1} of {sessions.length}
        </Text>
      </View>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Horizontal Swiper */}
      <FlatList
        data={sessions}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.swiperContainer}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {sessions.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Session Details Modal */}
      <Modal visible={showSessionDetails} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SessionDetailsModal 
            session={selectedSession} 
            onClose={handleCloseSessionDetails} 
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  tagTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  sessionCount: {
    fontSize: 16,
    color: "#3AD6BD",
    marginTop: 4,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  swiperContainer: {
    alignItems: "center",
  },
  swiperItem: {
    width: width - 40,
    height: height - 200,
    marginHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fullSizeCard: {
    width: "100%",
    height: "80%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  speaker: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    color: "#3AD6BD",
    fontSize: 14,
  },
  pagination: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3AD6BD",
    marginHorizontal: 4,
  },
  noSessionsText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: "50%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
});