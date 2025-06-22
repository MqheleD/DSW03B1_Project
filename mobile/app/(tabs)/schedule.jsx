import React, { useState,useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import {ThemeContext} from "../../hooks/ThemeContext"; 

const App = () => {
  const [selectedDay, setSelectedDay] = useState("Today");
  const [activeTab, setActiveTab] = useState("Upcoming");

  const {currentColors} = useContext(ThemeContext);

  // Mock data for events
  const events = {
    Today: [
      {
        id: 1,
        title: "Team Meeting",
        time: "09:00 - 10:30",
        location: "Conference Room A",
        participants: ["John Davis", "Emma Wilson", "Michael Chen", "+3 more"],
      },
      {
        id: 2,
        title: "Project Review",
        time: "13:00 - 14:00",
        location: "Virtual Meeting",
        participants: ["Sarah Johnson", "Robert Smith"],
      },
      {
        id: 3,
        title: "Client Call",
        time: "15:30 - 16:00",
        location: "Phone",
        participants: ["David Thompson"],
      },
    ],
    Tomorrow: [
      {
        id: 4,
        title: "Weekly Planning",
        time: "10:00 - 11:00",
        location: "Meeting Room B",
        participants: ["Emma Wilson", "Michael Chen", "Laura Martinez"],
      },
    ],
  };

  const hasEvents = selectedDay in events && events[selectedDay].length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, {color: currentColors.textPrimary}]}>Schedule</Text>
        </View>

        {/* Day selector */}
        <View style={styles.daySelector}>
          {["Today", "Tomorrow"].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && [styles.selectedDayButton, { backgroundColor: currentColors.primaryButton }]
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDay === day && styles.selectedDayButtonText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab selector */}
        <View style={styles.tabSelector}>
          {["Upcoming", "Completed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                [styles.tabButton, { backgroundColor: currentColors.cardBackground }],
                activeTab === tab && [styles.activeTabButton, { backgroundColor: currentColors.secondaryButton }]
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                {color: currentColors.textPrimary},
                activeTab === tab && styles.activeTabButtonText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events list */}
        <ScrollView style={styles.scrollView}>
          {hasEvents ? (
            events[selectedDay].map((event) => (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: currentColors.cardBackground }]}>
                <Text style={[styles.eventTitle, {color: currentColors.textPrimary}]}>{event.title}</Text>
                <Text style={[styles.eventDetail, {color: currentColors.textSecondary}]}>Time: {event.time}</Text>
                <Text style={[styles.eventDetail, {color: currentColors.textSecondary}]}>Location: {event.location}</Text>
                <Text style={[styles.eventParticipants, {color: currentColors.textSecondary}]}>
                  Participants: {event.participants.join(", ")}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No events scheduled</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: "#F8F9FA"
  },
  container: {
    flex: 1,
    // backgroundColor: "#F8F9FA",
    padding: 16
  },
  header: {
    paddingVertical: 16
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333"
  },
  daySelector: {
    flexDirection: "row",
    marginBottom: 16
  },
  dayButton: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#E9ECEF"
  },
  selectedDayButton: {
    backgroundColor: "#007BFF"
  },
  dayButtonText: {
    color: "#333",
    fontSize: 14
  },
  selectedDayButtonText: {
    color: "#FFF"
  },
  tabSelector: {
    flexDirection: "row",
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FFF",
    alignItems: "center"
  },
  activeTabButton: {
    backgroundColor: "#EAF2FF"
  },
  tabButtonText: {
    color: "#333",
    fontSize: 14
  },
  activeTabButtonText: {
    color: "white"
  },
  scrollView: {
    flex: 1
  },
  eventCard: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333"
  },
  eventDetail: {
    color: "#555",
    marginTop: 5
  },
  eventParticipants: {
    color: "#777",
    marginTop: 10
  },
  noEvents: {
    alignItems: "center",
    padding: 20
  },
  noEventsText: {
    fontSize: 18,
    color: "#777"
  }
});

export default App;