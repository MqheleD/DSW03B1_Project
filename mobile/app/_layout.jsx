import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

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
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(forms)/SignIn" />
      ) : (
        <Stack.Screen name="(tabs)/home" />
      )}
    </Stack>
  );
}
