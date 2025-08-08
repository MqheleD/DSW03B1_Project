import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/ThemeContext";
import { AuthContextProvider } from "../hooks/AuthContext";
import SplashScreen from "./SplashScreen";
import NotificationBanner from "@/components/NotificationBanner";
import useNotification from "@/hooks/useNotification";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AuthContextProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          
          {/* Main app content */}
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            
            {/* Notification Banner */}
            {notification && (
              <NotificationBanner 
                message={notification.message}
                animation={notification.animation}
                visible={showNotification}
              />
            )}
          </View>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthContextProvider>
  );
}