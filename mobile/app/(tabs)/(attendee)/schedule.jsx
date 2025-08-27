// screens/Schedule.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ThemeContext } from "@/hooks/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserAuth } from "@/hooks/AuthContext";
import supabase from "../../supabaseClient";

// ✅ import notifications
import useNotification from "@/hooks/useNotification";

const { width } = Dimensions.get("window");

const Schedule = () => {
  const { profile } = UserAuth();
  const { currentColors } = useContext(ThemeContext);
  const [selectedDay, setSelectedDay] = useState("Today");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoom, setFilterRoom] = useState(null);
  const [filterSpeaker, setFilterSpeaker] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState([]);
  const [uniqueSpeakers, setUniqueSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ notifications hook
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const fetchFavorites = async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from("session_favorites")
      .select("session_id")
      .eq("user_id", profile.id);

    if (error) {
      console.error("Error fetching favorites:", error);
      return;
    }

    setFavorites(data.map(f => f.session_id));
    
    // Also update AsyncStorage for offline use
    const favoritesKey = `favorites_${profile.id}`;
    await AsyncStorage.setItem(favoritesKey, JSON.stringify(data.map(f => f.session_id)));
  };

  const loadData = async () => {
    try {
      if (!profile?.id) return;

      console.log("Loading schedule data for user:", profile.id);

      // Load sessions first
      const sessionsKey = `sessions_${profile.id}`;
      const sessionsData = await AsyncStorage.getItem(sessionsKey);

      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        setAllSessions(sessions);

        setUniqueRooms([...new Set(sessions.map(s => s.room?.room_name).filter(Boolean))]);
        setUniqueSpeakers([...new Set(sessions.map(s => s.speaker?.full_name).filter(Boolean))]);
      } else {
        // fallback: default sessions
        const defaultSessions = await AsyncStorage.getItem("default_sessions");
        if (defaultSessions) {
          const sessions = JSON.parse(defaultSessions);
          setAllSessions(sessions);
          await AsyncStorage.setItem(sessionsKey, defaultSessions);

          setUniqueRooms([...new Set(sessions.map(s => s.room?.room_name).filter(Boolean))]);
          setUniqueSpeakers([...new Set(sessions.map(s => s.speaker?.full_name).filter(Boolean))]);
        }
      }

      // Load favorites from Supabase (this ensures sync with database)
      await fetchFavorites();

    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load schedule data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [profile?.id]);

  // ✅ auto-refresh if a favorited session was updated
  useEffect(() => {
    if (notification && showNotification) {
      console.log("Notification received on Schedule screen:", notification.message);
      loadData(); // reload from AsyncStorage to keep up-to-date
    }
  }, [notification, showNotification]);

  // Filter sessions based on criteria
  const getFilteredSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allSessions.filter(session => {
      if (!session.start_time) return false;
      
      const sessionDate = new Date(session.start_time);
      sessionDate.setHours(0, 0, 0, 0);

      // Day filter
      if (selectedDay === "Today" && sessionDate.getTime() !== today.getTime()) {
        return false;
      }
      if (selectedDay === "Tomorrow" && sessionDate.getTime() !== tomorrow.getTime()) {
        return false;
      }

      // Favorites filter
      if (activeTab === "Favorites" && !favorites.includes(session.id)) {
        return false;
      }

      // Room filter
      if (filterRoom && session.room?.room_name !== filterRoom) {
        return false;
      }

      // Speaker filter
      if (filterSpeaker && session.speaker?.full_name !== filterSpeaker) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = session.title?.toLowerCase().includes(query) || false;
        const matchesSpeaker = session.speaker?.full_name?.toLowerCase().includes(query) || false;
        const matchesDescription = session.description?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesSpeaker && !matchesDescription) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0;
      return new Date(a.start_time) - new Date(b.start_time);
    });
  };

  const toggleFavorite = async (sessionId) => {
    if (!profile?.id) {
      Alert.alert("Error", "You must be logged in to favorite sessions.");
      return;
    }

    try {
      if (favorites.includes(sessionId)) {
        // Remove from Supabase first
        const { error } = await supabase
          .from("session_favorites")
          .delete()
          .eq("user_id", profile.id)
          .eq("session_id", sessionId);

        if (error) throw error;

        // Then update local state
        const updatedFavorites = favorites.filter(id => id !== sessionId);
        setFavorites(updatedFavorites);
        
        // Update AsyncStorage
        const favoritesKey = `favorites_${profile.id}`;
        await AsyncStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
      } else {
        // Add to Supabase first
        const { error } = await supabase
          .from("session_favorites")
          .insert([{ user_id: profile.id, session_id: sessionId }]);

        if (error) throw error;

        // Then update local state
        const updatedFavorites = [...favorites, sessionId];
        setFavorites(updatedFavorites);
        
        // Update AsyncStorage
        const favoritesKey = `favorites_${profile.id}`;
        await AsyncStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      Alert.alert("Error", "Could not update favorite.");
    }
  };

  const renderSessionItem = ({ item }) => (
    <View style={[
      styles.sessionCard, 
      { 
        backgroundColor: currentColors.cardBackground,
        borderLeftWidth: 4,
        borderLeftColor: favorites.includes(item.id) ? currentColors.primaryButton : 'transparent'
      }
    ]}>
      <View style={styles.sessionHeader}>
        <Text style={[styles.sessionTitle, { color: currentColors.textPrimary }]}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={favorites.includes(item.id) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.includes(item.id) ? "red" : currentColors.text}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sessionMetaRow}>
        <View style={styles.metaItem}>
          <FontAwesome5 name="clock" size={14} color={currentColors.textSecondary} />
          <Text style={[styles.sessionText, { color: currentColors.textSecondary }]}>
            {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <FontAwesome5 name="user" size={14} color={currentColors.textSecondary} />
          <Text style={[styles.sessionText, { color: currentColors.textSecondary }]}>
            {item.speaker?.full_name || "Speaker TBD"}
          </Text>
        </View>
      </View>
      
      <View style={styles.metaItem}>
        <FontAwesome5 name="map-marker-alt" size={14} color={currentColors.textSecondary} />
        <Text style={[styles.sessionText, { color: currentColors.textSecondary }]}>
          {item.room?.room_name || "Location TBD"}
        </Text>
      </View>
      
      {item.description && (
        <Text 
          style={[styles.sessionDescription, { color: currentColors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.primaryButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      {notification && showNotification && (
        <View style={{ padding: 10, backgroundColor: "#fef3c7", borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ color: "#92400e" }}>{notification.message}</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: currentColors.textPrimary }]}>
          My Schedule
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer, 
        { backgroundColor: currentColors.cardBackground }
      ]}>
        <FontAwesome5 
          name="search" 
          size={16} 
          color={currentColors.textSecondary} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput, 
            { 
              color: currentColors.textPrimary,
            }
          ]}
          placeholder="Search sessions..."
          placeholderTextColor={currentColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Day Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: currentColors.textSecondary }]}>
          Date
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {["Today", "Tomorrow", "All"].map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.filterPill,
                { 
                  backgroundColor: selectedDay === day 
                    ? currentColors.secondaryButton
                    : currentColors.primaryButton,
                  marginRight: 8
                }
              ]}
              onPress={() => {
                setSelectedDay(day);
                setFilterRoom(null);
                setFilterSpeaker(null);
              }}
            >
              <Text style={[
                styles.filterPillText,
                selectedDay === day && { color: "#fff" }
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: currentColors.textSecondary }]}>
          Filter By
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {["All", "Favorites", ...uniqueRooms].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                { 
                  backgroundColor: (activeTab === filter || filterRoom === filter)
                    ? currentColors.secondaryButton
                    : currentColors.primaryButton ,
                  marginRight: 8
                }
              ]}
              onPress={() => {
                if (filter === "Favorites") {
                  setActiveTab("Favorites");
                  setFilterRoom(null);
                } else if (uniqueRooms.includes(filter)) {
                  setFilterRoom(activeTab === filter && filterRoom === filter ? null : filter);
                  setActiveTab("All");
                } else {
                  setActiveTab(filter);
                  setFilterRoom(null);
                }
                setFilterSpeaker(null);
              }}
            >
              <Text style={[
                styles.filterPillText,
                (activeTab === filter || filterRoom === filter) && { color: "#fff" }
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Speaker Filter */}
      {uniqueSpeakers.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: currentColors.textSecondary }]}>
            Speaker
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                { 
                  backgroundColor: !filterSpeaker
                    ? currentColors.primaryButton 
                    : currentColors.secondaryButton,
                  marginRight: 8
                }
              ]}
              onPress={() => setFilterSpeaker(null)}
            >
              <Text style={[
                styles.filterPillText,
                !filterSpeaker && { color: "#fff" }
              ]}>
                All Speakers
              </Text>
            </TouchableOpacity>
            
            {uniqueSpeakers.map(speaker => (
              <TouchableOpacity
                key={speaker}
                style={[
                  styles.filterPill,
                  { 
                    backgroundColor: filterSpeaker === speaker
                      ? currentColors.primaryButton 
                      : currentColors.secondaryButton,
                    marginRight: 8
                  }
                ]}
                onPress={() => setFilterSpeaker(filterSpeaker === speaker ? null : speaker)}
              >
                <Text style={[
                  styles.filterPillText,
                  filterSpeaker === speaker && { color: "#fff" }
                ]}>
                  {speaker}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Session List with Pull to Refresh */}
      <FlatList
        data={getFilteredSessions()}
        renderItem={renderSessionItem}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentColors.primaryButton]}
            tintColor={currentColors.primaryButton}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 
              name="calendar-times" 
              size={40} 
              color={currentColors.textSecondary} 
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
              {allSessions.length === 0 ? 'No sessions saved yet' : 'No matching sessions found'}
            </Text>
            <Text style={[styles.emptySubtext, { color: currentColors.textSecondary }]}>
              {allSessions.length === 0 ? 'Add sessions from the Home tab' : 'Try adjusting your filters'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 50,
    backgroundColor: '#f3f4f6',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  sessionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sessionDescription: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default Schedule;