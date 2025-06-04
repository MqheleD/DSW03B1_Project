import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const eventsData = {
  Today: [
    {
      id: 1,
      title: "Team Meeting",
      time: "10:00 AM - 11:30 AM",
      location: "Conference Room A",
      participants: 8,
      color: "#3b82f6", // blue-500
    },
    {
      id: 2,
      title: "Project Review",
      time: "2:00 PM - 3:30 PM",
      location: "Virtual Meeting",
      participants: 5,
      color: "#8b5cf6", // purple-500
    },
    {
      id: 3,
      title: "Client Call",
      time: "4:00 PM - 4:30 PM",
      location: "Phone",
      participants: 2,
      color: "#22c55e", // green-500
    },
  ],
  Tomorrow: [
    {
      id: 4,
      title: "Design Workshop",
      time: "9:00 AM - 12:00 PM",
      location: "Innovation Lab",
      participants: 12,
      color: "#ec4899", // pink-500
    },
    {
      id: 5,
      title: "Lunch with Marketing",
      time: "12:30 PM - 1:30 PM",
      location: "Bistro Garden",
      participants: 4,
      color: "#eab308", // yellow-500
    },
  ],
};

export default function App() {
  const [selectedTab, setSelectedTab] = useState("Today");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Optional: Update current time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark" />
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>Home</Text>
        {/* <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="search" size={16} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="bell" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20high%20quality%2C%20studio%20lighting%2C%20clean%20background%2C%20professional%20headshot&width=100&height=100&seq=1&orientation=squarish",
              }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.profileName}>Hello, Emma!</Text>
            <Text style={styles.profileDate}>{formattedDate}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#fff" }]}
          >
            <View
              style={[styles.actionIconCircle, { backgroundColor: "#dbeafe" }]}
            >
              <FontAwesome5 name="qrcode" size={20} color="#2563eb" />
            </View>
            <Text style={styles.actionText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#fff" }]}
          >
            <View
              style={[styles.actionIconCircle, { backgroundColor: "#ede9fe" }]}
            >
              <FontAwesome5 name="share-alt" size={20} color="#7c3aed" />
            </View>
            <Text style={styles.actionText}>Share Details</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Event Banner */}
        <View style={styles.upcomingEvent}>
          <View style={styles.upcomingEventTop}>
            <View>
              <Text style={styles.nextEventLabel}>NEXT EVENT</Text>
              <Text style={styles.nextEventTitle}>Team Meeting</Text>
              <View style={styles.upcomingEventRow}>
                <FontAwesome5
                  name="clock"
                  size={12}
                  color="rgba(255,255,255,0.8)"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.upcomingEventText}>
                  10:00 AM - 11:30 AM
                </Text>
              </View>
              <View style={styles.upcomingEventRow}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={12}
                  color="rgba(255,255,255,0.8)"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.upcomingEventText}>Conference Room A</Text>
              </View>
            </View>
            {/* <View style={styles.videoIconWrapper}>
              <FontAwesome5 name="video" size={24} color="white" />
            </View> */}
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Now</Text>
          </TouchableOpacity>
        </View>

        {/* My Events Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>My Events</Text>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            {["Today", "Tomorrow"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === tab && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Events List */}
          <View style={{ marginTop: 16 }}>
            {eventsData[selectedTab].map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventCardHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={[
                        styles.eventColorBar,
                        { backgroundColor: event.color },
                      ]}
                    />
                    <View>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventTimeRow}>
                        <FontAwesome5
                          name="clock"
                          size={12}
                          color="#6b7280"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.eventTimeText}>{event.time}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.participantsStack}>
                      {[...Array(Math.min(3, event.participants))].map(
                        (_, i) => (
                          <Image
                            key={i}
                            source={{
                              uri: `https://readdy.ai/api/search-image?query=professional%20portrait%20headshot%2C%20business%20attire%2C%20neutral%20background%2C%20high%20quality%2C%20studio%20lighting&width=50&height=50&seq=${
                                event.id * 10 + i
                              }&orientation=squarish`,
                            }}
                            style={[styles.participantImage, { left: i * -10 }]}
                          />
                        )
                      )}
                      {event.participants > 3 && (
                        <View
                          style={[styles.moreParticipants, { left: 3 * -10 }]}
                        >
                          <Text style={styles.moreParticipantsText}>
                            +{event.participants - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.chevronButton}>
                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.eventLocationRow}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={12}
                    color="#6b7280"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.eventLocationText}>{event.location}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // gray-50
    // paddingVertical: 16,
  },
  navBar: {
    // position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#fff",
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
    backgroundColor: "#f3f4f6", // gray-100
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
    borderRadius: 24,
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
    backgroundColor: "linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)", // fallback for gradient not supported on RN, so use a solid color or use libraries for gradients
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
  videoIconWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#3b82f6",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  tabSwitcher: {
    marginTop: 16,
    flexDirection: "row",
    backgroundColor: "#f3f4f6", // gray-100
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabButtonTextActive: {
    color: "#000",
  },
  eventCard: {
    backgroundColor: "#fff",
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
    color: "#6b7280",
  },
  participantsStack: {
    flexDirection: "row",
    marginRight: 12,
    position: "relative",
    width: 60,
    height: 28,
  },
  participantImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
  },
  moreParticipants: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb", // gray-300
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  moreParticipantsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6", // gray-100
    justifyContent: "center",
    alignItems: "center",
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
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb", // gray-200
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
  },
  tabBarText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  tabBarAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
