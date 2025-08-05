import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { UserAuth } from '@/hooks/AuthContext';

export default function MyQRCodeScreen() {
  const { session, profile } = UserAuth();
  const [socialLinks, setSocialLinks] = useState([]);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedLinks = await AsyncStorage.getItem(`socialLinks_${profile?.id}`);
        const parsedLinks = storedLinks ? JSON.parse(storedLinks) : [];

        setSocialLinks(parsedLinks);

        const qrPayload = {
          type: 'profile',
          id: session?.user?.id || '',
          name: profile?.full_name || '',
          role: profile?.role || '',
          avatar: profile?.avatar_url || '',
          socials: parsedLinks,
          email: session?.user?.email || '',
          organizatiun: profile?.organization || '',
          occupation: profile?.occupation || '',
        };

        setQrValue(JSON.stringify(qrPayload));
      } catch (error) {
        console.error('Failed to load profile QR data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [session, profile]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3AD6BD" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your AVIJOZI Profile QR</Text>

      <Image
        source={{ uri: profile?.avatar_url }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <Text style={styles.name}>{profile?.full_name}</Text>
      <Text style={styles.role}>{profile?.role}</Text>

      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode value={qrValue} size={250} />
        ) : (
          <Text>QR Data is empty.</Text>
        )}
      </View>

      <Text style={styles.note}>Let others scan this to connect with you.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  note: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
