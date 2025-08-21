import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // default theme name

  // Load saved theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme && Colors[savedTheme]) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  // Switch to a specific theme
  const switchTheme = async (themeName) => {
    if (Colors[themeName]) {
      setTheme(themeName);
      await AsyncStorage.setItem("theme", themeName);
    } else {
      console.warn(`Theme "${themeName}" not found in Colors`);
    }
  };

  // For convenience: cycle through available themes
  const cycleTheme = async () => {
    const keys = Object.keys(Colors);
    const currentIndex = keys.indexOf(theme);
    const nextTheme = keys[(currentIndex + 1) % keys.length];
    await switchTheme(nextTheme);
  };

  const currentColors = Colors[theme] || Colors.light;

  return (
    <ThemeContext.Provider
      value={{ theme, switchTheme, cycleTheme, currentColors }}
    >
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={currentColors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
