import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from "@/hooks/ThemeContext";
import { UserAuth } from "@/hooks/AuthContext";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const [expandedInterests, setExpandedInterests] = useState(true);
    const [expandedContact, setExpandedContact] = useState(true);
    const { currentColors } = useContext(ThemeContext);
    const { profile, loading, signOut } = UserAuth();
    const [interests, setInterests] = useState([]);

    const [connectionCount, setConnectionCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [activities, setActivities] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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

    // Fetch stats + activities
    const fetchStats = useCallback(async () => {
        if (!profile?.id) return;

        try {
            let activityFeed = [];

            // Connections
            const storedConnections = await AsyncStorage.getItem(`network-${profile.id}`);
            const parsedConnections = storedConnections ? JSON.parse(storedConnections) : [];
            setConnectionCount(Array.isArray(parsedConnections) ? parsedConnections.length : 0);

            if (Array.isArray(parsedConnections) && parsedConnections.length > 0) {
                const lastConnection = parsedConnections[parsedConnections.length - 1];
                activityFeed.push({
                    type: "connection",
                    text: `Connected with ${lastConnection.full_name || "a creative"}`,
                    date: lastConnection.date || new Date().toISOString(),
                });
            }

            // Events (favorites)
            const storedSessions = await AsyncStorage.getItem(`favorites_${profile?.id}`);
            const parsedSessions = storedSessions ? JSON.parse(storedSessions) : [];
            setEventCount(Array.isArray(parsedSessions) ? parsedSessions.length : 0);

            if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
                const lastSession = parsedSessions[parsedSessions.length - 1];
                activityFeed.push({
                    type: "event",
                    text: `Liked "${lastSession.title || "an event"}"`,
                    date: lastSession.date || new Date().toISOString(),
                });
            }

            // Sort latest first
            activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivities(activityFeed);
        } catch (err) {
            console.log("Error fetching stats:", err);
        }
    }, [profile]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

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
            <Image
                source={{ uri: `https://avijozi.zohobackstage.com/public/portals/880205061/siteResources/161390000000092631` }}
                style={styles.bannerImage}
                resizeMode="contain"
            />

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
                        <Text style={[styles.editProfileButtonText,{color:currentColors.buttonText}]}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.editProfileButton, {backgroundColor: currentColors.secondaryButton}]} 
                        onPress={() => router.push('/(screens)/Settings')}
                    >
                        <Text style={[styles.editProfileButtonText, {color: currentColors.textPrimary}]}>Edit profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.contentContainer} 
                contentContainerStyle={{ paddingBottom: 60 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* User Info Section */}
                <View style={[styles.userInfoContainer, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
                    <Text style={[styles.userName, {color: currentColors.textPrimary}]}>{profile?.full_name || "Unnamed"}</Text>

                    <View style={styles.userStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{connectionCount}</Text>
                            <Text style={[styles.statLabel, {color: currentColors.textSecondary}]}>Connections</Text>
                        </View>
 
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{eventCount}</Text>
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

                {/* Recent Activity */}
                {activities.length > 0 && (
                    <View style={[styles.section, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.secondaryButton }]}>
                        <Text style={[styles.sectionTitle, {color: currentColors.textPrimary}]}>Recent Activity</Text>
                        {activities.map((activity, index) => (
                            <View key={index} style={styles.activityItem}>
                                {activity.type === "event" ? (
                                    <FontAwesome5 name="heart" size={16} color="#ef4444" />
                                ) : (
                                    <FontAwesome5 name="user-friends" size={16} color="#3b82f6" />
                                )}
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>{activity.text}</Text>
                                    <Text style={styles.activityDate}>{activity.date}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#efefef",
    },
    bannerImage: {
        width: width-25,
        height: 150,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    userInfoContainer: {
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        padding: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
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
        borderWidth: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
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
    chipText: {
        fontSize: 13
    },
    textActive: {
        color: '#3730A3'
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
