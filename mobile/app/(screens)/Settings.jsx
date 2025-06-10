import React, { useState, useContext } from 'react';
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { ThemeContext } from '@/hooks/ThemeContext';


import * as ImagePicker from 'expo-image-picker'; // optional but recommended for image picking

export default function Settings() {
  const [username, setUsername] = useState("");
  const [socialLink, setSocialLink] = useState('');
  const [socialLinks, setSocialLinks] = useState([]);

  const [profileImage, setProfileImage] = useState(
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20high%20quality%2C%20studio%20lighting%2C%20clean%20background%2C%20professional%20headshot&width=100&height=100&seq=1&orientation=squarish",
  );

  // Toggle theme mode

  const { isDarkMode, toggleTheme, currentColors, setIsDarkMode } =
    useContext(ThemeContext);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Add social link if not empty
  const handleAddSocialLink = () => {
    if (socialLink.trim()) {
      setSocialLinks([...socialLinks, socialLink.trim()]);
      setSocialLink('');
    }
  };

  // Remove social link by index
  const handleRemoveSocialLink = (index) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };

  // Pick image from library
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Permission to access photo library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1], // square crop
    });

    if (!pickerResult.canceled) {
      setProfileImage(pickerResult.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logging out...');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF' }]}>
        <TouchableOpacity style={styles.navButton}>
          {/* Use any back icon here */}
          <Text style={{ color: currentColors.textPrimary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: currentColors.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
        {/* Spacer for right side so title centers */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Profile Image Section */}
          <View style={[styles.card, { backgroundColor: currentColors.cardBackground, alignItems: 'center' }]}>
            <Text style={[styles.sectionTitle, { color: currentColors.textPrimary, marginBottom: 12 }]}>Profile Picture</Text>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              style={[styles.changePhotoButton, { backgroundColor: currentColors.buttonBackground }]}
              activeOpacity={0.7}
            >
              <Text style={{ color: currentColors.buttonText }}>Change Photo</Text>
            </TouchableOpacity>
          </View>



          {/* Social Links Section */}
          <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: currentColors.textPrimary, marginBottom: 8 }]}>Social Links</Text>
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7', color: currentColors.textPrimary },
                  { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                ]}
                placeholder="Add your social media link"
                placeholderTextColor={isDarkMode ? '#A0AEC0' : '#718096'}
                value={socialLink}
                onChangeText={setSocialLink}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.addButton]}
                onPress={handleAddSocialLink}
                activeOpacity={0.7}
              >
                <Text style={{ color: currentColors.buttonText, fontSize: 20 }}>＋</Text>
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
                      { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.socialLinkText, { color: currentColors.textPrimary }]}
                    >
                      {item}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSocialLink(index)}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ color: currentColors.removeButton, fontSize: 18 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={{ marginTop: 8 }}
              />
            )}
          </View>

          {/* Theme Toggle Section */}
          <View style={[styles.card, { backgroundColor: currentColors.cardBackground }]}>
            <View style={styles.rowSpaceBetween}>
              <View>
                <Text style={[styles.sectionTitle, { color: currentColors.textPrimary }]}>Theme Mode</Text>
                <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>

              <Switch
                trackColor={{ false: "#81b0ff", true: "#81b0ff" }}
                thumbColor={
                  isDarkMode
                    ? currentColors.buttonBackground
                    : currentColors.buttonBackground
                }
                onValueChange={toggleTheme}
                value={isDarkMode}
              />
            </View>
          </View>

          {/* Logout Button */}
          <View style={[styles.card, { backgroundColor: currentColors.cardBackground,  }]}>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutButton]}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  navButton: {
    position: 'absolute',
    left: 12,
    padding: 8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // leave room for tab bar
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#red',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },

  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },

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
    backgroundColor: '#3182CE',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialLinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  socialLinkText: {
    flex: 1,
    fontSize: 14,
  },

  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },

  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  logoutButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});

