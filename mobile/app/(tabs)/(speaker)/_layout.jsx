// (tabs)/(speaker)/_layout.jsx
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "@/hooks/ThemeContext";
import React, { useContext } from "react";

export default function SpeakerTabsLayout() {
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    console.error("ThemeContext not found!");
    return null;
  }
  
  const { currentColors } = themeContext;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 10,
          backgroundColor: currentColors.navBarBackground,
          borderRadius: 30,
          height: 70,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: Platform.OS === "android" ? 10 : 20,
          marginHorizontal: 10,
        },
        tabBarActiveTintColor: currentColors.primaryButton,
        tabBarInactiveTintColor: currentColors.secondaryButton,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="slides"
        options={{
          title: "Slides",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="slideshow" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people-alt" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}