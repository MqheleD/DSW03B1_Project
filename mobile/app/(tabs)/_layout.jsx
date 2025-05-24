import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

//import { HapticTab } from '@/components/HapticTab';
//import { IconSymbol } from '@/components/ui/IconSymbol';
//import TabBarBackground from '@/components/ui/TabBarBackground';
//import { Colors } from '@/constants/Colors';
//import { useColorScheme } from '@/hooks/useColorScheme';

import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const HapticTab = undefined; // fallback
const TabBarBackground = () => null;
const IconSymbol = FontAwesome; // fallback
const Colors = {
  light: { tint: "#007AFF" },
  dark: { tint: "#0A84FF" },
};
const useColorScheme = () => "light";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="schedule" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people-alt" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
