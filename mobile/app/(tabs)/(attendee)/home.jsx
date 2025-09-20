// screens/Home.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import StorySwiper from "../../../components/StorySwiper";
import { ThemeContext } from "@/hooks/ThemeContext";
import { UserAuth } from "@/hooks/AuthContext";
import { router } from "expo-router";
import supabase from "@/app/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

// ✅ import notifications hook
import useNotification from "@/hooks/useNotification";

export default function Home() {
  const [eventsData, setEventsData] = useState({ Today: [], Tomorrow: [] });
  const [selectedTab, setSelectedTab] = useState("Today");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentColors, isDarkMode } = useContext(ThemeContext);
  const { profile, loading: authLoading } = UserAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ grab notifications (they’ll also show globally via RootLayout)
  const { notification, showNotification } = useNotification();

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (profile?.id) {
        const key = `favorites_${profile.id}`;
        const favs = await AsyncStorage.getItem(key);
        setFavorites(favs ? JSON.parse(favs) : []);
      }
    };
    loadFavorites();
  }, [profile?.id]);

  // Fetch events
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    const fetchAndSaveEvents = async () => {
      try {
        const localDate = new Date();
        const todayStr = localDate.toISOString().split('T')[0];
        const tomorrow = new Date(localDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const { data: todayEvents } = await supabase
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
          .gte('start_time', `${todayStr}T00:00:00`)
          .lte('start_time', `${todayStr}T23:59:59`)
          .order('start_time', { ascending: true });

        const { data: tomorrowEvents } = await supabase
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
          .gte('start_time', `${tomorrowStr}T00:00:00`)
          .lte('start_time', `${tomorrowStr}T23:59:59`)
          .order('start_time', { ascending: true });

        const formatTimeRange = (start, end) => {
          const options = { hour: '2-digit', minute: '2-digit' };
          return `${new Date(start).toLocaleTimeString([], options)} - ${new Date(end).toLocaleTimeString([], options)}`;
        };

        const formattedTodayEvents = todayEvents?.map(event => ({
          id: event.id,
          title: event.title,
          time: formatTimeRange(event.start_time, event.end_time),
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.room?.room_name || "TBD",
          room: { room_name: event.room?.room_name || "TBD" },
          color: getRandomColor(),
          speaker: event.speaker?.full_name || "TBD",
          speaker_full: event.speaker || { full_name: "TBD" },
          description: event.description,
          image: event.speaker?.photo_url || "https://via.placeholder.com/150"
        })) || [];

        const formattedTomorrowEvents = tomorrowEvents?.map(event => ({
          id: event.id,
          title: event.title,
          time: formatTimeRange(event.start_time, event.end_time),
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.room?.room_name || "TBD",
          room: { room_name: event.room?.room_name || "TBD" },
          color: getRandomColor(),
          speaker: event.speaker?.full_name || "TBD",
          speaker_full: event.speaker || { full_name: "TBD" },
          description: event.description,
          image: event.speaker?.photo_url || "https://via.placeholder.com/150"
        })) || [];

        setEventsData({
          Today: formattedTodayEvents,
          Tomorrow: formattedTomorrowEvents
        });

        if (profile?.id) {
          const allSessions = [...formattedTodayEvents, ...formattedTomorrowEvents];
          await AsyncStorage.setItem(`sessions_${profile.id}`, JSON.stringify(allSessions));
          
          // Also save to default key for first-time users
          const existingDefault = await AsyncStorage.getItem('default_sessions');
          if (!existingDefault) {
            await AsyncStorage.setItem('default_sessions', JSON.stringify(allSessions));
          }
        }

      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsData({
          Today: [],
          Tomorrow: [],
          error: "Failed to load events"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndSaveEvents();
    return () => clearInterval(timer);
  }, [profile?.id]);

  const toggleFavorite = async (session) => {
    if (!profile?.id) return;
    
    const key = `favorites_${profile.id}`;
    try {
      const isFavorite = favorites.some(fav => fav.id === session.id);
      let updatedFavorites;
      
      if (isFavorite) {
        updatedFavorites = favorites.filter(fav => fav.id !== session.id);
      } else {
        updatedFavorites = [...favorites, session];
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getRandomColor = () => {
    const colors = ["#3b82f6", "#8b5cf6", "#22c55e", "#ec4899", "#eab308"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.primaryButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* ✅ Notification debug (optional since RootLayout already handles banner) */}
      {notification && showNotification && (
        <View style={{ padding: 10, backgroundColor: "#fef3c7", margin: 10, borderRadius: 8 }}>
          <Text style={{ color: "#92400e" }}>{notification.message}</Text>
        </View>
      )}

      {/* Nav Bar */}
      <View style={[styles.navBar, { backgroundColor: currentColors.navBarBackground }]}>
        <Text style={[styles.navTitle, { color: currentColors.textPrimary }]}>
          Home
        </Text>
        <View style={styles.navIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: currentColors.cardBackground },
            ]}
            onPress={() => router.push("/(screens)/Feed")}
          >
            <FontAwesome6 name="images" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri:
                  profile?.avatar_url ||
                  "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20high%20quality%2C%20studio%20lighting%2C%20clean%20background%2C%20professional%20headshot&width=100&height=100&seq=1&orientation=squarish",
              }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={{ marginLeft: 12 }}>
            {profile ? (
              <Text
                style={[
                  styles.profileName,
                  { color: currentColors.textPrimary },
                ]}
              >
                Hello, {profile.full_name}!
              </Text>
            ) : (
              <Text
                style={[
                  styles.profileName,
                  { color: currentColors.textSecondary },
                ]}
              >
                Hello, Guest!
              </Text>
            )}
            <Text style={styles.profileDate}>{formattedDate}</Text>
          </View>
        </View>

        <View style={{ height: 200, marginTop: 16 }}>
          <StorySwiper />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: currentColors.cardBackground },
            ]}
            onPress={() => router.push("/(screens)/Scanner")}
          >
            <View
              style={[
                styles.actionIconCircle,
                { backgroundColor: currentColors.iconbackground },
              ]}
            >
              <FontAwesome5 name="qrcode" size={20} color="#2563eb" />
            </View>
            <Text
              style={[styles.actionText, { color: currentColors.textThird }]}
            >
              Scan QR Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: currentColors.cardBackground },
            ]}
            onPress={() => router.push("/(screens)/ShareDetails")}
          >
            <View
              style={[
                styles.actionIconCircle,
                { backgroundColor: currentColors.iconbackground },
              ]}
            >
              <FontAwesome5 name="share-alt" size={20} color="#7c3aed" />
            </View>
            <Text
              style={[styles.actionText, { color: currentColors.textThird }]}
            >
              Share Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Event Banner */}
        {eventsData.Today.length > 0 && (
          <View
            style={[
              styles.upcomingEvent,
              { backgroundColor: currentColors.nextEvent },
            ]}
          >
            <View style={styles.upcomingEventTop}>
              <View>
                <Text style={styles.nextEventLabel}>NEXT EVENT</Text>
                <Text style={styles.nextEventTitle}>
                  {eventsData.Today[0].title}
                </Text>
                <View style={styles.upcomingEventRow}>
                  <FontAwesome5
                    name="clock"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.upcomingEventText}>
                    {eventsData.Today[0].time}
                  </Text>
                </View>
                <View style={styles.upcomingEventRow}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.upcomingEventText}>
                    {eventsData.Today[0].location}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: currentColors.background }]}
              onPress={() => router.push("/(screens)/ShareDetails")}
            >
              <Text
                style={[
                  styles.joinButtonText,
                  { color: currentColors.buttonText },
                ]}
              >
                Check In
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Events */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={[styles.sectionTitle, { color: currentColors.textPrimary }]}
          >
            My Events
          </Text>

          {/* Tab Switcher */}
          <View
            style={[
              styles.tabSwitcher,
              { backgroundColor: currentColors.secondaryButton },
            ]}
          >
            {["Today", "Tomorrow"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && {
                    backgroundColor: currentColors.primaryButton,
                  },
                ]}
              >
                <Text
                  style={[
                    { color: currentColors.textSecondary, fontWeight: "500" },
                    selectedTab === tab && { color: currentColors.textThird },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Event List */}
          <View style={{ marginTop: 16 }}>
            {!eventsData[selectedTab] ||
            eventsData[selectedTab].length === 0 ? (
<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
              <Text
                style={{
                  color: currentColors.textSecondary,
                  textAlign: "center",
                  marginTop: "auto",
                }}
              >
                No event data for {selectedTab}
              </Text>
              </View>
            ) : (
              eventsData[selectedTab].map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.eventCard,
                    { backgroundColor: currentColors.cardBackground },
                  ]}
                >
                  <View style={styles.eventCardHeader}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          styles.eventColorBar,
                          { backgroundColor: event.color },
                        ]}
                      />
                      <View>
                        <Text
                          style={[
                            styles.eventTitle,
                            { color: currentColors.textPrimary },
                          ]}
                        >
                          {event.title}
                        </Text>
                        <View style={styles.eventTimeRow}>
                          <FontAwesome5
                            name="clock"
                            size={12}
                            color={currentColors.textSecondary}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.eventTimeText,
                              { color: currentColors.textSecondary },
                            ]}
                          >
                            {event.time}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => toggleFavorite(event)}>
                      <FontAwesome
                        name={
                          favorites.some((fav) => fav.id === event.id)
                            ? "heart"
                            : "heart-o"
                        }
                        size={16}
                        color={
                          favorites.some((fav) => fav.id === event.id)
                            ? "#ec4899"
                            : currentColors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.eventLocationRow}>
                    <FontAwesome5
                      name="map-marker-alt"
                      size={12}
                      color="#6b7280"
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.eventLocationText,
                        { color: currentColors.textSecondary },
                      ]}
                    >
                      {event.location}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  navBar: {
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  navIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  profileImageWrapper: {
    position: "relative",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#3b82f6",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  quickActions: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  upcomingEvent: {
    marginTop: 32,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    padding: 16,
  },
  upcomingEventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nextEventLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
    color: "#fff",
  },
  nextEventTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    color: "#fff",
  },
  upcomingEventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  upcomingEventText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  joinButton: {
    marginTop: 16,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  tabSwitcher: {
    marginTop: 16,
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventColorBar: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },
  eventTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  eventTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  eventTimeText: {
    fontSize: 14,
  },
  eventLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  eventLocationText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
