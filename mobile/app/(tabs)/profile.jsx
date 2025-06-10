import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const [expandedInterests, setExpandedInterests] = useState(true);
    const [expandedContact, setExpandedContact] = useState(true);

    const interests = [
        { id: 1, name: '2D Animation', active: false },
        { id: 3, name: 'AI Integration', active: true },
        { id: 4, name: 'VFX', active: true },
        { id: 5, name: 'Character Design', active: true },
        { id: 6, name: 'NFT Art', active: true },
        { id: 7, name: '3D Animation', active: true },
        { id: 8, name: 'Game Development', active: true },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Banner Image */}
            <Image
            // The banner image will change based on the event
                source={{ uri: 'https://placehold.co/600x200/3b82f6/ffffff/png?text=AVIJOZI25' }}
                style={styles.bannerImage}
                resizeMode="cover"
            />

            {/* Profile Picture Overlay */}
            <View style={styles.profileImageContainer}>
                <Image
                    source={{
                        uri: "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20woman%20with%20shoulder%20length%20brown%20hair%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20high%20quality%2C%20studio%20lighting%2C%20clean%20background%2C%20professional%20headshot&width=100&height=100&seq=1&orientation=squarish",
                    }}
                    style={styles.profileImage}
                />
                <View style={styles.buttonContainer}>

                    <TouchableOpacity style={styles.editProfileButton}>
                        <Text style={styles.editProfileButtonText}>Share profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/(screens)/Settings')}>
                        <Text style={styles.editProfileButtonText}>Edit profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* User Info Section */}
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userName}>Thabo Mbeki</Text>
                    <Text style={styles.userHandle}>@thabo_animator</Text>
                    <Text style={styles.userBio}>
                        I don't know if this section is necessary
                    </Text>

                    <View style={styles.userStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>142</Text>
                            <Text style={styles.statLabel}>Connections</Text>
                        </View>
 
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Events</Text>
                        </View>
                    </View>
                </View>

                {/* Interests Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Interests</Text>
                    {/* <View style={styles.chipWrap}>
                        {interests.map((interest) => (
                            <View
                                key={interest.id}
                                style={[
                                    styles.chip,
                                    interest.active ? styles.chipActive : styles.chipInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        interest.active ? styles.textActive : styles.textInactive,
                                    ]}
                                >
                                    {interest.name}
                                </Text>
                            </View>
                        ))}
                    </View> */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipScroll}
                    >
                        {interests.map((interest) => (
                            <View
                                key={interest.id}
                                style={[
                                    styles.chip,
                                    interest.active ? styles.chipActive : styles.chipInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        interest.active ? styles.textActive : styles.textInactive,
                                    ]}
                                >
                                    {interest.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Festival Schedule */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Festival Schedule</Text>
                    <View style={styles.scheduleItem}>
                        <FontAwesome5 name="calendar-day" size={16} color="#3b82f6" />
                        <Text style={styles.scheduleText}>Day 1: Animation Track</Text>
                    </View>
                    <View style={styles.scheduleItem}>
                        <FontAwesome5 name="bookmark" size={16} color="#3b82f6" />
                        <Text style={styles.scheduleText}>Saved: "AI in African Animation" (2PM)</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
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
        width: width,
        height: 150,
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
        color: '#1f2937',
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
        borderColor: '#e5e7eb',
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