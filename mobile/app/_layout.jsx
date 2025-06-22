import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/ThemeContext";
import { AuthContextProvider } from "../hooks/AuthContext";
import SplashScreen from "./SplashScreen";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

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
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthContextProvider>
  );
}
