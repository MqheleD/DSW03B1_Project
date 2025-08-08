// StorySwiper.js
import React, { useState, useEffect } from "react";
import { Dimensions, FlatList, Modal, StyleSheet, View, Alert } from "react-native";
import SessionDetailsModal from "./SessionDetailsModal";
import SessionStoryCard from "./SessionStoryCard";
import supabase from "../app/supabaseClient";

const { width } = Dimensions.get("window");

export default function StorySwiper() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('public:sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          console.log('Change received!', payload);
          fetchSessions();

          // switch (payload.eventType) {
          //   case 'INSERT':
          //     Alert.alert('New Session', 'A new session has been added!');
          //     break;
          //   case 'UPDATE':
          //     Alert.alert('Session Updated', 'A session was just updated.');
          //     break;
          //   case 'DELETE':
          //     Alert.alert('Session Removed', 'A session was deleted.');
          //     break;
          //   default:
          //     break;
          // }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

const fetchSessions = async () => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        room:room_id (room_name, location),
        speaker:speaker_id (full_name, photo_url)
      `)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;  // Important to return early on error
    }
    
    console.log('Fetched sessions:', data);  // Add this to verify data
    setSessions(data.map(session => ({
  ...session,
  speaker: session.speaker?.full_name || 'Unknown Speaker',
  room: session.room?.room_name || 'Unknown Room',
  location: session.room?.location || 'Location TBD',
  image: session.speaker?.photo_url || 'https://placeholder.com/150'
    })));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

  const handleOpen = (session) => {
    setSelectedSession(session);
  };

  const handleClose = () => {
    setSelectedSession(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={sessions}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.8}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionStoryCard session={item} onPress={() => handleOpen(item)} />
        )}
      />

      <Modal visible={!!selectedSession} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SessionDetailsModal session={selectedSession} onClose={handleClose} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
});