import React, { useContext, useEffect, useState } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../supabaseClient";

import { ThemeContext } from "../../hooks/ThemeContext";

import { router } from 'expo-router';

export default function QRCodeScreen() {
  const { currentColors, isDarkMode } = useContext(ThemeContext);

  // data to be put in the QR code
  // const qrCodeData = "https://example.com/myprofile";
  // const qrCodeData = JSON.stringify(userInfo);



  const [userInfo, setUserInfo] = useState({
    full_name: '',
    occupation: '',
    organisation: '',
    email: '',
  });

   // get data from db
      const fetchData = async () => {
        console.log("fetchData called");
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
  
        if (authError || !user) {
          console.error("Error fetching auth user:", authError?.message);
          return;
        }
  
        console.log("Auth user ID:", user.id);
  
        const { data, error } = await supabase
          .from("attendees")
          .select("full_name, email, occupation, organization")
          .eq("id", user.id) // Use the logged-in user's ID
          .single();
  
        if (error) {
          console.error("Error reading DB:", error.message);
          return;
        }
  
        if (!data) {
          console.warn("No attendee found with this user ID.");
          return;
        }
        console.log("Data found:", data);
        setUserInfo({
          full_name: data.full_name,
          email: data.email,
          occupation: data.occupation,
          organisation: data.organization,
        });
      };
    
      useEffect(() => {
        fetchData();
      }, [])

      const qrCodeData = `https://connectme.app/user?name=${encodeURIComponent(userInfo.full_name)}&occupation=${encodeURIComponent(userInfo.occupation)}&org=${encodeURIComponent(userInfo.organisation)}&email=${encodeURIComponent(userInfo.email)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Nav Bar */}
      <View style={[styles.navBar, { backgroundColor: currentColors.navBarBackground }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color={currentColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: currentColors.textPrimary }]}>User Details</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* QR Code Display */}
      <View style={styles.qrCodeContainer}>
        <QRCode
          value={qrCodeData}
          size={200}
          color={currentColors.textPrimary}
          backgroundColor={currentColors.background}
          logoBackgroundColor="transparent"
        />
        <Text style={[styles.qrCodeLabel, { color: currentColors.textPrimary }]}>
          Let's connect. Scan this QR code.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  qrCodeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  qrCodeLabel: {
    fontSize: 16,
    marginTop: 24,
    textAlign: "center",
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
