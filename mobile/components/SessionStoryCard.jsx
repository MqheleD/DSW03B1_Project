// SessionStoryCard.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

// Define the tag mascots locally
const tagMascot = {
  animation: require("../assets/images/Boom2.png"),
  gaming: require("../assets/characters/Gamer.png"),
  // Tech: require("../assets/images/tech-mascot.png"),
  // VFX: require("../assets/images/vfx-mascot.png"),
  panel: require("../assets/characters/Panel.png"),
  General: require("../assets/characters/General.png"),
};

export default function SessionStoryCard({ session, onPress, onLongPress, style }) {
  // Get the primary tag for this session
  const primaryTag = session.tags?.[0] || "General";
  
  // Get the appropriate mascot image for the tag
  const mascotImage = tagMascot[primaryTag] || tagMascot.default;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={[styles.card, style]} 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      {/* Use tag mascot image */}
      <Image 
        source={mascotImage} 
        style={styles.image} 
      />
      <View style={styles.overlay} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{session.title}</Text>
        <Text style={styles.speaker} numberOfLines={1}>{session.speaker}</Text>
        <Text style={styles.details} numberOfLines={2}>
          {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.room}
        </Text>
      </View>
      
      {/* Tag badge in corner */}
      <View style={styles.tagBadge}>
        <Text style={styles.tagText}>{primaryTag}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.7 - 10,
    height: 180,
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  speaker: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 4,
  },
  details: {
    color: "#3AD6BD",
    fontSize: 12,
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(58, 214, 189, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});