import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/ThemeContext";
import { AuthContextProvider, UserAuth } from "../hooks/AuthContext";
import NotificationBanner from "@/components/NotificationBanner";
import useNotification from "@/hooks/useNotification";

// This component can safely use UserAuth because it's inside AuthContextProvider
function AppContentWithAuth() {
  const [showSplash, setShowSplash] = useState(true);
  const { loading } = UserAuth();

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Show loading indicator instead of splash screen
  if (showSplash || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <NotificationWrapper />
    </View>
  );
}

function NotificationWrapper() {
  const { notification, showNotification } = useNotification();

  if (!notification || !showNotification) return null;

  return (
    <NotificationBanner
      message={notification.message}
      animation={notification.animation}
      visible={showNotification}
      onHide={() => {}}
      type={notification.type || "info"}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <AppContentWithAuth />
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthContextProvider>
  );
}