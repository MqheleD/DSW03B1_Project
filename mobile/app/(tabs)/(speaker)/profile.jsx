import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from "@/hooks/ThemeContext";
import { UserAuth } from "@/hooks/AuthContext";
import { router } from 'expo-router';
import avijozi25_logo from "../../../assets/images/avijozi25_logo.png";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const [expandedInterests, setExpandedInterests] = useState(true);
    const [expandedContact, setExpandedContact] = useState(true);
    const { currentColors, isDarkMode } = useContext(ThemeContext);
    const { profile, loading, signOut } = UserAuth();
    const [interests, setInterests] = useState([]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/(forms)/Login');
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    // Load interests from profile
    useEffect(() => {
        if (profile?.interests) {
            setInterests(profile.interests);
        }
    }, [profile]);

    const bannerColor = currentColors.secondaryButton.replace("#", "");

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
                <ActivityIndicator size="large" color={currentColors.primaryButton} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <StatusBar barStyle="light-content" />

             
                 

            {/* Banner Image */}
           <Image source={ avijozi25_logo}  style={styles.bannerImage}  resizeMode="cover"/>

            {/* Profile Picture Overlay */}
            <View style={styles.profileImageContainer}>
                <Image
                    source={{
                        uri: profile?.avatar_url  || "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20high%20quality%2C%20studio%20lighting%2C%20clean%20background%2C%20professional%20headshot&width=100&height=100&seq=1&orientation=squarish",
                    }}
                    style={styles.profileImage}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: currentColors.primaryButton }]} >
                        <Text style={styles.textSecondary}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.editProfileButton, {backgroundColor: currentColors.secondaryButton}]} 
                        onPress={() => router.push('/(screens)/Settings')}
                    >
                        <Text style={[styles.editProfileButtonText, {color: currentColors.textPrimary}]}>Edit profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* User Info Section */}
                <View style={[styles.userInfoContainer, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
  
    
                    <Text style={[styles.userName, {color: currentColors.textThird}]}>{profile?.full_name || "Unnamed"}</Text>
                    <Text style={[styles.userHandle, {color: currentColors.textSecondary}]}>@thabo_animator</Text>
                    <Text style={[styles.userBio, {color: currentColors.textThird}]}>
                        I don't know if this section is necessary
                    </Text>

                    <View style={styles.userStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>142</Text>
                            <Text style={[styles.statLabel, {color: currentColors.textSecondary}]}>Connections</Text>
                        </View>
 
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={[styles.statLabel, {color: currentColors.textSecondary}]}>Events</Text>
                        </View>
                    </View>
                </View>

                {/* Interests Section */}
                <View style={[styles.section, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
                    <Text style={[styles.sectionTitle, {color: currentColors.textPrimary}]}>Professional Interests</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipScroll}
                    >
                        {interests.map((interest, index) => (
                            <View
                                key={index}
                                style={[styles.chip, styles.chipActive]}
                            >
                                <Text style={[styles.chipText, styles.textActive]}>
                                    {interest}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Festival Schedule */}
                <View style={[styles.section, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
                    <Text style={[styles.sectionTitle, {color: currentColors.textPrimary}]}>My Festival Schedule</Text>
                    <View style={styles.scheduleItem}>
                        <FontAwesome5 name="calendar-day" size={16} color="#3b82f6" />
                        <Text style={[styles.scheduleText, {color: currentColors.textSecondary}]}>Day 1: Animation Track</Text>
                    </View>
                    <View style={styles.scheduleItem}>
                        <FontAwesome5 name="bookmark" size={16} color="#3b82f6" />
                        <Text style={[styles.scheduleText, {color: currentColors.textSecondary}]}>Saved: "AI in African Animation" (2PM)</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={[styles.section, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
                    <Text style={[styles.sectionTitle, {color: currentColors.textPrimary}]}>Recent Activity</Text>
                    <View style={styles.activityItem}>
                        <FontAwesome5 name="heart" size={16} color="#ef4444" />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>Liked "Digital Storytelling Workshop"</Text>
                            <Text style={styles.activityDate}>Today, 10:30 AM</Text>
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <FontAwesome5 name="user-friends" size={16} color="#3b82f6" />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>Connected with 5 creatives</Text>
                            <Text style={styles.activityDate}>Today, 9:15 AM</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                {/* <TouchableOpacity 
                    style={[styles.logoutButton, { backgroundColor: currentColors.secondaryButton }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutButtonText, { color: currentColors.textPrimary }]}>Log Out</Text>
                </TouchableOpacity> */}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#efefef",
    },
    headerContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    bannerImage: {
       // width: width,
       width:'100%',
        height: 70,
    },
    profileImageContainer: {
        paddingHorizontal: 20,
        marginTop: -60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    editProfileButton: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    editProfileButtonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        // Adjusted bottom for tab bar
        // paddingBottom: 60,
        marginBottom: 20,
    },
    userInfoContainer: {
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
       // borderBottomWidth: 3,
       // borderRightWidth: 3,
       // borderLeftWidth: 3,
        padding: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userHandle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 10,
    },
    userBio: {
        fontSize: 16,
        lineHeight: 22,
        color: '#4b5563',
        marginBottom: 15,
    },
    userStats: {
        flexDirection: 'row',
        marginTop: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    statNumber: {
        fontWeight: 'bold',
        marginRight: 4,
    },
    statLabel: {
        color: '#6b7280',
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 4,
    },
    chipActive: {
        backgroundColor: '#E0E7FF'
    },
    chipInactive: {
        backgroundColor: '#F3F4F6'
    },
    chipText: {
        fontSize: 13
    },
    textActive: {
        color: '#3730A3'
    },
    textInactive: {
        color: '#6B7280'
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    scheduleText: {
        marginLeft: 10,
        color: '#4b5563',
    },
    activityItem: {
        flexDirection: "row",
        marginBottom: 16,
    },
    activityContent: {
        flex: 1,
        marginLeft: 12,
    },
    activityText: {
        fontSize: 14,
        color: "#1f2937",
        marginBottom: 2,
    },
    activityDate: {
        fontSize: 12,
        color: "#9ca3af",
    },
});