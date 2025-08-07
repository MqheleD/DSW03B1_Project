// SessionStoryCard.js
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

export default function SessionStoryCard({ session, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: session.image }} 
        style={styles.image} 
        defaultSource={{ uri: 'https://placeholder.com/150' }}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{session.title}</Text>
        <Text style={styles.speaker}>{session.speaker}</Text>
<Text style={styles.details}>
  {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.room} ({session.location})
</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.5,
    height: 200,
    borderRadius: 24,
    marginRight: 20,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  image: {
    width: "100%",
    height: "65%",
    resizeMode: 'cover',
  },
  info: {
    padding: 16,
    backgroundColor: "rgba(255,255,255, 0.5)",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  speaker: {
    color: "#aaa",
    marginTop: 4,
  },
  details: {
    color: "#3AD6BD",
    marginTop: 8,
  },
});