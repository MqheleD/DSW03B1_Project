// StorySwiper.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import SessionDetailsModal from "./SessionDetailsModal";
import TagSwiperModal from "./TagSwiperModal";
import SessionStoryCard from "./SessionStoryCard"; // Add this import
import supabase from "../app/supabaseClient";

const { width, height } = Dimensions.get("window");

export default function StorySwiper() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showTagSwiper, setShowTagSwiper] = useState(false);

  const tagMascot = {
    animation: require("../assets/images/Boom2.png"),
    gaming: require("../assets/characters/Gamer.png"),
    panel: require("../assets/characters/Panel.png"),
    General: require("../assets/characters/General.png"),
    keynote: require("../assets/characters/Speaker.png"),
    masterclass: require("../assets/characters/Headset.png"),
    workshop: require("../assets/characters/Headset.png"),
  };

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel("public:sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          room:room_id (room_name, location),
          speaker:speaker_id (full_name, photo_url),
          tags
        `)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching sessions:", error);
        return;
      }

      setSessions(
        data.map((session) => ({
          ...session,
          speaker: session.speaker?.full_name || "Unknown Speaker",
          room: session.room?.room_name || "Unknown Room",
          location: session.room?.location || "Location TBD",
          image: session.speaker?.photo_url || "https://placeholder.com/150",
          tags: Array.isArray(session.tags) ? session.tags : [session.tags || "General"],
        }))
      );
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const groupedSessions = useMemo(() => {
    const groups = {};
    
    sessions.forEach((session) => {
      const primaryTag = session.tags?.[0] || "General";
      
      if (!groups[primaryTag]) {
        groups[primaryTag] = [];
      }
      groups[primaryTag].push(session);
    });

    const sortedGroups = {};
    const tagOrder = ["Gaming", "Animation", "Tech", "VFX", "Panel"];
    
    tagOrder.forEach(tag => {
      if (groups[tag]) {
        sortedGroups[tag] = groups[tag];
      }
    });
    
    Object.keys(groups)
      .sort()
      .forEach(tag => {
        if (!sortedGroups[tag]) {
          sortedGroups[tag] = groups[tag];
        }
      });

    return sortedGroups;
  }, [sessions]);

  // Get one representative session per tag
  const tagRepresentatives = useMemo(() => {
    const representatives = [];
    
    Object.entries(groupedSessions).forEach(([tag, tagSessions]) => {
      if (tagSessions.length > 0) {
        // Use the first session as the representative for this tag
        representatives.push({
          ...tagSessions[0],
          isTagCard: true,
          tag: tag,
          sessionCount: tagSessions.length,
        });
      }
    });
    
    return representatives;
  }, [groupedSessions]);

  const handleOpenSession = (session) => {
    setSelectedSession(session);
  };

  const handleOpenTagSwiper = (tag) => {
    setSelectedTag(tag);
    setShowTagSwiper(true);
  };

  const handleClose = () => {
    setSelectedSession(null);
    setShowTagSwiper(false);
    setSelectedTag(null);
  };

  const getTagImage = (tag) => {
    return tagMascot[tag] || tagMascot.default;
  };

  const renderTagCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.tagCard}
      onPress={() => handleOpenTagSwiper(item.tag)}
      activeOpacity={0.9}
    >
      {/* Use tag mascot as background */}
      <Image 
        source={getTagImage(item.tag)} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Tag Header */}
        <View style={styles.tagCardHeader}>
          <Text style={styles.tagCardTitle}>{item.tag}</Text>
          <View style={styles.sessionCountBadge}>
            <Text style={styles.sessionCountText}>{item.sessionCount}</Text>
          </View>
        </View>

        {/* View All Button */}
        <View style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All {item.sessionCount} Sessions →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Horizontal FlatList for tag cards */}
      <FlatList
        data={tagRepresentatives}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.8}
        decelerationRate="fast"
        contentContainerStyle={styles.horizontalList}
        keyExtractor={(item) => item.tag}
        renderItem={renderTagCard}
      />

      {/* Session Details Modal */}
      <Modal visible={!!selectedSession} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SessionDetailsModal session={selectedSession} onClose={handleClose} />
        </View>
      </Modal>

      {/* Tag Swiper Modal */}
      <Modal visible={showTagSwiper} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TagSwiperModal
            tag={selectedTag}
            sessions={groupedSessions[selectedTag] || []}
            onClose={handleClose}
            onSessionSelect={handleOpenSession}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
  },
  horizontalList: {
    paddingHorizontal: 10,
  },
  tagCard: {
    width: width * 0.45,
    height: 160,
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  tagCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sessionCountBadge: {
    backgroundColor: "#3AD6BD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionCountText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewAllButton: {
    backgroundColor: "rgba(58, 214, 189, 0.8)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  viewAllText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
});