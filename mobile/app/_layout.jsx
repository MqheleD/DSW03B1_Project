import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/ThemeContext";
import { AuthContextProvider } from "../hooks/AuthContext";
import SplashScreen from "./SplashScreen";
import NotificationBanner from "@/components/NotificationBanner";
import useNotification from "@/hooks/useNotification";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash)
    return (
      <ThemeProvider>
        <SplashScreen />
      </ThemeProvider>
    );

  return (
    <AuthContextProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />

          {/* Main app content */}
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />

            {/* Notification Banner */}
            <NotificationWrapper />
          </View>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

// 👇 NotificationWrapper must be *inside* AuthContextProvider
function NotificationWrapper() {
  const { notification, showNotification } = useNotification();

  // Only render if we have a notification AND it should be visible
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
