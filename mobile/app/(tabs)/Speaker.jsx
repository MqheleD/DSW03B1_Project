import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "../../hooks/ThemeContext";
import { UserAuth } from "../../hooks/AuthContext";
import { router } from 'expo-router';

const initialEventsData = {
  Scheduled: [
    {
      id: 1,
      title: "Team Meeting",
      time: "10:00 AM - 11:30 AM",
      location: "Conference Room A",
      participants: 8,
      color: "#3b82f6",
    },
    {
      id: 2,
      title: "Project Review",
      time: "2:00 PM - 3:30 PM",
      location: "Virtual Meeting",
      participants: 5,
      color: "#8b5cf6",
    },
    {
      id: 3,
      title: "Client Call",
      time: "4:00 PM - 4:30 PM",
      location: "Phone",
      participants: 2,
      color: "#22c55e",
    },
  ],
  Completed: [
    {
      id: 4,
      title: "Design Workshop",
      time: "9:00 AM - 12:00 PM",
      location: "Innovation Lab",
      participants: 12,
      color: "#ec4899",
    },
    {
      id: 5,
      title: "Lunch with Marketing",
      time: "12:30 PM - 1:30 PM",
      location: "Bistro Garden",
      participants: 4,
      color: "#eab308",
    },
  ],
};

export default function App() {
  const [selectedTab, setSelectedTab] = useState("Scheduled");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentColors, isDarkMode } = useContext(ThemeContext);
  const [Visible, setVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const { profile, loading } = UserAuth();

  // Use React state for events data!
  const [eventsData, setEventsData] = useState(initialEventsData);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.primaryButton} />
      </SafeAreaView>
    );
  }

  // Move from Scheduled to completed
  const handleCompleted = () => {
    if (!selectedPerson) return;

    setEventsData((prev) => {
      return {
        Scheduled: prev.Scheduled.filter(e => e.id !== selectedPerson.id),
        Completed: [...prev.Completed, selectedPerson],
      };
    });

    setVisible(false);
    setSelectedPerson(null);
  };

  // Move from Completed to Scheduled
  const handleUndo = () => {
    if (!selectedPerson) return;

    setEventsData((prev) => {
      return {
        Scheduled: [...prev.Scheduled, selectedPerson],
        Completed: prev.Completed.filter(e => e.id !== selectedPerson.id),
      };
    });

    setVisible(false);
    setSelectedPerson(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      
      <View style={[styles.navBar, { backgroundColor: currentColors.navBarBackground }]}>
        <Text style={[styles.navTitle, { color: currentColors.textPrimary }]}>Home</Text>
        <View style={styles.navIcons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: currentColors.cardBackground }]}
            onPress={() => router.push("/(screens)/Scanner")}
          >
            <MaterialCommunityIcons name="line-scan" size={16} color={currentColors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
       
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri: profile?.avatar_url || "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair&width=100&height=100&seq=1",
              }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={{ marginLeft: 12 }}>
            {profile ? (
              <Text style={[styles.profileName, { color: currentColors.textPrimary }]}>
                Hello, {profile.full_name}!
              </Text>
            ) : (
              <Text style={[styles.profileName, { color: currentColors.textSecondary }]}>
                Hello, speaker!
              </Text>
            )}
            <Text style={styles.profileDate}>{formattedDate}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.cardBackground }]}
            onPress={() => router.push("/(screens)/Scanner")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "#dbeafe" }]}>
              <FontAwesome5 name="qrcode" size={20} color="#2563eb" />
            </View>
            <Text style={[styles.actionText, { color: currentColors.textSecondary }]}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentColors.cardBackground }]}
            onPress={() => router.push("/(screens)/ShareDetails")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "#ede9fe" }]}>
              <FontAwesome5 name="share-alt" size={20} color="#7c3aed" />
            </View>
            <Text style={[styles.actionText, { color: currentColors.textSecondary }]}>Share Details</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Event */}
        <View style={[styles.upcomingEvent, { backgroundColor: currentColors.primaryButton }]}>
          <View style={styles.upcomingEventTop}>
            <View>
              <Text style={styles.nextEventLabel}>NEXT EVENT</Text>
              <Text style={styles.nextEventTitle}>Team Meeting</Text>
              <View style={styles.upcomingEventRow}>
                <FontAwesome5 name="clock" size={12} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
                <Text style={styles.upcomingEventText}>10:00 AM - 11:30 AM</Text>
              </View>
              <View style={styles.upcomingEventRow}>
                <FontAwesome5 name="map-marker-alt" size={12} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
                <Text style={styles.upcomingEventText}>Conference Room A</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: currentColors.secondaryButton }]}
            onPress={() => router.push('/(screens)/Scanner')}
          >
            <Text style={styles.joinButtonText}>Check In</Text>
          </TouchableOpacity>
        </View>

        {/* My Events */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: currentColors.textPrimary }]}>My Events</Text>

          {/* Tab Switcher */}
          <View style={[styles.tabSwitcher, { backgroundColor: currentColors.secondaryButton }]}>
            {["Scheduled", "Completed"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && { backgroundColor: currentColors.primaryButton },
                ]}
              >
                <Text
                  style={[
                    { color: currentColors.textSecondary, fontWeight: "500" },
                    selectedTab === tab && { color: "white" },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Events List */}
          <View style={{ marginTop: 16 }}>
            {eventsData[selectedTab].length === 0 ? (
              <Text style={{ color: currentColors.textSecondary, textAlign: "center", marginTop: 'auto' }}>
                No event data for {selectedTab}
              </Text>
            ) : (
              eventsData[selectedTab].map((event) => (
                <View key={event.id} style={[styles.eventCard, { backgroundColor: currentColors.cardBackground }]}>
                  <View style={styles.eventCardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                      <View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventTimeRow}>
                          <FontAwesome5 name="clock" size={12} color={currentColors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.eventTimeText, { color: currentColors.textSecondary }]}>{event.time}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.chevronButton}
                      onPress={() => {
                        setSelectedPerson(event);
                        setVisible(true);
                      }}
                    >
                      <FontAwesome5 name="chevron-right" size={12} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.eventLocationRow}>
                    <FontAwesome5 name="map-marker-alt" size={12} color="#6b7280" style={{ marginRight: 4 }} />
                    <Text style={[styles.eventLocationText, { color: currentColors.textSecondary }]}>{event.location}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={Visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedPerson && (
              <>
              

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setVisible(false)} style={styles.buttonClose}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>

                 
                  {selectedTab === "Scheduled" ? (
                    <TouchableOpacity onPress={handleCompleted} style={styles.buttonLinkedIn}>
                      <Text style={styles.buttonText}>Completed</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleUndo} style={[styles.buttonLinkedIn, { backgroundColor: "#ff9900" }]}>
                      <Text style={styles.buttonText}>Undo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  navIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
    borderRadius: 20,
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 56,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34d399",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    width: "48%",
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionIconCircle: {
    padding: 12,
    borderRadius: 30,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  upcomingEvent: {
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  upcomingEventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nextEventLabel: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "700",
  },
  nextEventTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  upcomingEventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  upcomingEventText: {
    fontSize: 14,
    color: "#fff",
  },
  joinButton: {
    marginTop: 24,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  eventCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventColorBar: {
    width: 6,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  eventTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventTimeText: {
    fontSize: 14,
  },
  eventLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  eventLocationText: {
    fontSize: 14,
  },
  chevronButton: {
    padding: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
  },
  buttonLinkedIn: {
    flex: 1,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 8,
    alignItems: "center",
  },
  buttonClose: {
    flex: 1,
    backgroundColor: "#6b7280",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
