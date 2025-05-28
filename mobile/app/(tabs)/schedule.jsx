import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const App: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState("Today");
  const [activeTab, setActiveTab] = useState("Upcoming");

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
    <View style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 16 }}>
      <View style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>
          Schedule
        </Text>
      </View>

      {/* Day selector */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {["Today", "Tomorrow"].map((day) => (
          <TouchableOpacity
            key={day}
            style={{
              padding: 10,
              borderRadius: 20,
              marginHorizontal: 5,
              backgroundColor: selectedDay === day ? "#007BFF" : "#E9ECEF",
            }}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={{
                color: selectedDay === day ? "#FFF" : "#333",
                fontSize: 14,
              }}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab selector */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {["Upcoming", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: activeTab === tab ? "#EAF2FF" : "#FFF",
              alignItems: "center",
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={{
                color: activeTab === tab ? "#007BFF" : "#333",
                fontSize: 14,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events list */}
      <ScrollView style={{ flex: 1 }}>
        {hasEvents ? (
          events[selectedDay].map((event) => (
            <View
              key={event.id}
              style={{
                backgroundColor: "#FFF",
                padding: 16,
                marginBottom: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                {event.title}
              </Text>
              <Text style={{ color: "#555", marginTop: 5 }}>
                Time: {event.time}
              </Text>
              <Text style={{ color: "#555", marginTop: 5 }}>
                Location: {event.location}
              </Text>
              <Text style={{ color: "#777", marginTop: 10 }}>
                Participants: {event.participants.join(", ")}
              </Text>
            </View>
          ))
        ) : (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 18, color: "#777" }}>
              No events scheduled
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default App;
