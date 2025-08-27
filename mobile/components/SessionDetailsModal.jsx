// components/SessionDetailsModal.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { UserAuth } from '@/hooks/AuthContext';

export default function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;
  const { profile } = UserAuth();
  const key = `favorites_${profile?.id}`;

  const addToFavorites = async (sessionData) => {
    if (!sessionData || !profile?.id) {
      Alert.alert('Error', 'Invalid session');
      return;
    }

    try {
      console.log("Saving to favorites for user:", profile.id);
      const existing = await AsyncStorage.getItem(key);
      const currentFavorites = existing ? JSON.parse(existing) : [];

      const alreadyExists = currentFavorites.some(
        s => s.id === sessionData.id
      );

      if (!alreadyExists) {
        const updated = [...currentFavorites, sessionData];
        await AsyncStorage.setItem(key, JSON.stringify(updated));
        Alert.alert('Success', 'Added to favorites!');
      } else {
        Alert.alert(
          'Info',
          `${sessionData.title} is already in your saved sessions.`
        );
      }
    } catch (error) {
      console.error('Failed to save to favorites:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  return (
    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: session.image || 'https://via.placeholder.com/400x200?text=No+Image' }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{session.title}</Text>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="person" size={16} color="#3AD6BD" />
                <Text style={styles.metaText}>{session.speaker}</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color="#3AD6BD" />
                <Text style={styles.metaText}>
                  {new Date(session.start_time).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(session.end_time).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color="#3AD6BD" />
                <Text style={styles.metaText}>{session.room} ({session.location})</Text>
              </View>

              <View style={styles.metaItem}>
                <FontAwesome name="tag" size={16} color="#3AD6BD" />
                <Text style={styles.metaText}>
                  {Array.isArray(session.tags) ? session.tags.join(", ") : session.tags}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              {session.description || "No description available for this session."}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => addToFavorites(session)}
              >
                <Ionicons name="heart" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add to Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 34,
  },
  metaContainer: {
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  description: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#3AD6BD',
    flex: 1,
    marginRight: 12,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});