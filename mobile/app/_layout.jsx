import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import SplashScreen from "./SplashScreen";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); //Once authentication has been done

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <>
      <StatusBar style="auto" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="(forms)/Login" />
          ) : (
            <Stack.Screen name="(tabs)/home" />
          )}
        </Stack>
      </GestureHandlerRootView>
    </>
  );
}
