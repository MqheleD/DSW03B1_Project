import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: () => <MaterialCommunityIcons name="home" size={24} color="black" /> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: () => <MaterialIcons name="map" size={24} color="black" /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarIcon: () => <MaterialIcons name="schedule" size={24} color="black" /> }} />
      <Tabs.Screen name="network" options={{ title: 'Network', tabBarIcon: () => <MaterialIcons name="people-alt" size={24} color="black" /> }} />
    </Tabs>
  );
}
