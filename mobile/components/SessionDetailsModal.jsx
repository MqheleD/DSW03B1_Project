// components/SessionDetailsModal.js
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <Image source={session.image || ''} style={styles.image} />

      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.speaker}>By {session.speaker}</Text>
      <Text style={styles.time}>
        {session.time} • {session.room}
      </Text>
      <Text style={styles.description}>
        This is where a full description or interactive content could go. Could even embed speaker video, RSVP button, etc.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    //add blur effect
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    padding: 20,
    borderRadius: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  speaker: {
    color: "#aaa",
    marginTop: 6,
  },
  time: {
    color: "#3AD6BD",
    marginTop: 6,
  },
  description: {
    color: "#ddd",
    marginTop: 16,
  },
});
