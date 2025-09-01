import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../supabaseClient";
import { UserAuth } from "@/hooks/AuthContext";
import * as Font from "expo-font";
import * as Asset from "expo-asset";

//assets\images\avijozi_cover2-removebg-preview.png

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { profile, session, signInUser } = UserAuth();

  //for image to load faster
  useEffect(() => {
    async function preloadImages() {
      await Asset.fromModule(
        require("../../assets/images/Boom2.png")
      ).downloadAsync();
    }
    preloadImages();
  }, []);
  const [imageLoaded, setImageLoaded] = useState(false);
  const Boom2 = require("../../assets/images/Boom2.png");
  const Boom1 = require("../../assets/images/avijozi_cover2-removebg-preview.png");
  const Boom3 = require("../../assets/images/Drones (00000)111.png");
  const Boom4 = require("../../assets/images/Speakerchar.png");
  const Boom5 = require("../../assets/images/env_master_Characters_v0031_beauty.1035 (00000).png");

  useEffect(() => {
    if (session && profile?.role) {
      if (profile.role === "speaker") {
        router.replace("/(tabs)/(speaker)/home");
      } else {
        router.replace("/(tabs)/(attendee)/home");
      }
    }
  }, [session, profile]);

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError("*Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please fill in both email and password.");
      return;
    }

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        // const fullName = result.profile.full_name || result.profile.name || 'User';
        // Alert.alert(Welcome back, ${fullName}!);
        // Alert.prompt(user)
        // router.replace('/(tabs)/home');
        // router.replace('/(screens)/Speaker');
      } else {
        Alert.alert("Login failed", result.message || "Invalid credentials.");
      }
    } catch (error) {
      Alert.alert(
        "Login failed",
        error.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.SignupDesign}>
          <View style={styles.rowContainer}>
            <Image
              source={Boom2}
              style={{
                position: "absolute",
                top: 40,
                // left: 20,
                right: 100,
                width: 100,
                height: 100,
              }}
            />
            <Image
              source={Boom1}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 60,
                height: 60,
              }}
            />
            <Image
              source={Boom3}
              style={{
                position: "absolute",
                bottom: 50,
                left: "55%",
                width: 100,
                height: 60,
              }}
            />
            <Image
              source={Boom4}
              style={{
                position: "absolute",
                bottom: 40,
                left: 30,
                width: 60,
                height: 60,
              }}
            />
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>LOGIN</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={{ color: "red" }}>{emailError}</Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email:"
              placeholderTextColor="gray"
              value={email}
              style={styles.inputfield}
              onChangeText={validateEmail}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={{ flex: 1 }}
                value={password}
                placeholder="Password:"
                placeholderTextColor="gray"
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.navigate("/(forms)/ForgotPassword")}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: "40%",
              marginBottom: "6%",
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 5 }}>Login</Text>
            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.navigate("/(forms)/SignIn")}>
            <Text style={styles.linkText}>Sign up?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* <Image
        source={Boom5}
        style={{
          resizeMode: "contain",
          position: "absolute",
          bottom: 40,
          left: 0,
          width: 350,
          height: 400,
        }}
      /> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 40,
  },
  SignupDesign: {
    backgroundColor: "#E34664",
    width: "100%",
    height: "60%",
    alignItems: "center",
    borderBottomRightRadius: "10%",
    borderBottomLeftRadius: "10%",
    paddingTop: "20%",
    elevation: 2,
  },
  Heading: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
    textShadowColor: "#D10023",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 2,
    marginTop: 0,
    paddingTop: 0,
  },
  inputContainer: {
    width: "92%",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    elevation: 2,
    paddingTop: "10%",
    paddingBottom: "10%",
    alignItems: "center",
  },
  inputfield: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    color: "black",
    marginLeft: "5%",
    marginBottom: "5%",
    width: "90%",
    padding: 8,
    elevation: 2,
  },
  passwordContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "5%",
    marginBottom: "5%",
    width: "90%",
    paddingHorizontal: 8,
    backgroundColor: "white",
    elevation: 2,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#f08fa1ff",
    textDecorationLine: "underline",
    fontSize: 16,
    marginRight: 14,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 20,
    paddingRight: "5%",
  },
  loginButton: {
    backgroundColor: "#000000",
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: "contain",
  },
  rowContainer: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    width: "53%",
    height: "21%",
    marginTop: 20,
  },
  headingContainer: {
    alignItems: "center",

    marginBottom: "10%",
  },
});
