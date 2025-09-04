import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  FlatList,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { UserAuth } from "@/hooks/AuthContext";
import { Colors } from "@/constants/Colors";
import { ThemeContext } from "@/hooks/ThemeContext";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import "react-native-url-polyfill/auto";
import supabase from "@/app/supabaseClient";

export default function Settings() {
  const [socialLink, setSocialLink] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const { signOut, profile, updateProfile } = UserAuth();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    profile?.avatar_url || "https://example.com/default-avatar.jpg"
  );

  const { theme, switchTheme, currentColors } = useContext(ThemeContext);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

  const key = `socialLinks_${profile?.id}`;

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        const storedLinks = await AsyncStorage.getItem(key);
        if (storedLinks) setSocialLinks(JSON.parse(storedLinks));
      } catch (error) {
        console.error("Error loading social links:", error);
      }
    };
    loadSocialLinks();
  }, []);

  const handleAddSocialLink = async () => {
    if (!socialLink.trim()) return;

    const newLinks = [...socialLinks, socialLink.trim()];
    setSocialLinks(newLinks);
    setSocialLink("");

    try {
      await AsyncStorage.setItem(key, JSON.stringify(newLinks));
    } catch (error) {
      Alert.alert("Error", "Failed to save social link");
    }
  };

  const handleRemoveSocialLink = async (index) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);

    try {
      await AsyncStorage.setItem(key, JSON.stringify(updatedLinks));
    } catch (error) {
      Alert.alert("Error", "Failed to remove social link");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access photo library is required!"
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets[0].base64) {
      await uploadImage(pickerResult.assets[0].base64);
    }
  };

  const uploadImage = async (base64Data) => {
    try {
      setUploading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64Data), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("attendees")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
      updateProfile({ ...profile, avatar_url: publicUrl });
      Alert.alert("Success", "Profile image updated!");
    } catch (error) {
      Alert.alert("Upload failed", error.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem("socialLinks");
      router.replace("/(forms)/Login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const handleThemeSelect = (selectedTheme) => {
    switchTheme(selectedTheme);
  };

  const handleModalClose = () => {
    setIsThemeModalVisible(false);
  };

  const ThemeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isThemeModalVisible}
      onRequestClose={() => setIsThemeModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setIsThemeModalVisible(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: currentColors.cardBackground },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: currentColors.textPrimary }]}
          >
            Select Theme
          </Text>

          {Object.keys(Colors).map((themeKey) => (
            <TouchableOpacity
              key={themeKey}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    theme === themeKey
                      ? currentColors.primaryButton
                      : currentColors.background,
                  borderColor: currentColors.border,
                },
              ]}
              onPress={() => handleThemeSelect(themeKey)}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color:
                      theme === themeKey
                        ? currentColors.buttonText
                        : currentColors.textPrimary,
                  },
                ]}
              >
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </Text>
              {theme === themeKey && (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={currentColors.buttonText}
                />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.modalCloseButton,
              { backgroundColor: currentColors.primaryButton },
            ]}
            onPress={() => setIsThemeModalVisible(false)}
          >
            <Text
              style={{ color: currentColors.buttonText, fontWeight: "600" }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View
        style={[
          styles.navBar,
          { backgroundColor: currentColors.navBackground },
        ]}
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={currentColors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: currentColors.textPrimary }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: currentColors.cardBackground,
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentColors.textPrimary, marginBottom: 12 },
              ]}
            >
              Profile Picture
            </Text>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                styles.changePhotoButton,
                { backgroundColor: currentColors.secondaryButton },
              ]}
              activeOpacity={0.7}
              disabled={uploading}
            >
              <Text style={{ color: currentColors.buttonText }}>
                {uploading ? "Uploading..." : "Change Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Links Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: currentColors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentColors.textPrimary, marginBottom: 8 },
              ]}
            >
              Social Links
            </Text>
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentColors.background,
                    color: currentColors.textPrimary,
                  },
                  { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                ]}
                placeholder="Add your social media link"
                placeholderTextColor={currentColors.textSecondary}
                value={socialLink}
                onChangeText={setSocialLink}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: currentColors.secondaryButton },
                ]}
                onPress={handleAddSocialLink}
                activeOpacity={0.7}
              >
                <Text style={{ color: currentColors.buttonText, fontSize: 20 }}>
                  ＋
                </Text>
              </TouchableOpacity>
            </View>

            {socialLinks.length > 0 && (
              <FlatList
                data={socialLinks}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.socialLinkItem,
                      {
                        backgroundColor:
                          Colors[theme]?.cardSecondary || "#EDF2F7",
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.socialLinkText,
                        { color: currentColors.textPrimary },
                      ]}
                    >
                      {item}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSocialLink(index)}
                      style={{ padding: 4 }}
                    >
                      <Text
                        style={{
                          color: currentColors.removeButton,
                          fontSize: 18,
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={{ marginTop: 8 }}
              />
            )}
          </View>

          {/* Theme Selector Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: currentColors.cardBackground },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentColors.textPrimary },
              ]}
            >
              Theme
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentColors.textSecondary },
              ]}
            >
              Current: {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>

            <TouchableOpacity
              style={[
                styles.themeButton,
                { backgroundColor: currentColors.secondaryButton },
              ]}
              onPress={() => setIsThemeModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={{ color: currentColors.buttonText, fontWeight: "600" }}
              >
                Change Theme
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View
            style={[
              styles.card,
              { backgroundColor: currentColors.cardBackground },
            ]}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={[
                styles.logoutButton,
                { backgroundColor: currentColors.logoutButtonBackground },
              ]}
              activeOpacity={0.7}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Theme Modal */}
      <ThemeModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  navButton: { position: "absolute", left: 12, padding: 8 },
  navTitle: { fontSize: 18, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  sectionSubtitle: { fontSize: 12, marginTop: 2 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  socialLinkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  socialLinkText: { flex: 1, fontSize: 14 },
  imageContainer: { position: "relative" },
  profileImage: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  uploadingOverlay: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  logoutButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  themeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
});
