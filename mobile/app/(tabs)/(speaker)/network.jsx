import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Animated,
  Easing,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/hooks/ThemeContext';
import { UserAuth } from '@/hooks/AuthContext';

export default function Network() {
  const Width = 40;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const [visible, setVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [connections, setConnections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { currentColors } = useContext(ThemeContext);

  const { profile } = UserAuth();


  const scaleAnims = useRef({}).current;

  
  useEffect(() => {
    connections.forEach(person => {
      if (!scaleAnims[person.id]) {
        scaleAnims[person.id] = new Animated.Value(1);
      }
    });
  }, [connections]);

  
  useEffect(() => {
    const intervals = [];

    connections.forEach((person, index) => {
      const delay = 1500 * index; 
      
      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
          bounce(person.id);
        }, 3000); 
        
        intervals.push(interval);
      }, delay);

      intervals.push(timeout);
    });

    return () => {
      intervals.forEach((timer) => clearInterval(timer));
    };
  }, [connections]);

  // The bounce animation function
  const bounce = (id) => {
    if (scaleAnims[id]) {
      Animated.sequence([
        Animated.spring(scaleAnims[id], {
          toValue: 0.97,
          friction: 1,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[id], {
          toValue: 1,
          friction: 4,
          tension: 20,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const loadConnections = async () => {
    try {
      if (!profile?.id) {
        console.log('No profile ID available');
        setConnections([]);
        return;
      }

      console.log('Loading connections for profile ID:', profile.id);
      const savedConnections = await AsyncStorage.getItem(`network-${profile.id}`);

      if (savedConnections) {
        console.log('Found saved connections:', savedConnections);
        const parsed = JSON.parse(savedConnections);
        setConnections(Array.isArray(parsed) ? parsed : []);
      } else {
        console.log('No saved connections found');
        setConnections([]);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      Alert.alert('Error', 'Failed to load your network connections.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConnections();
    setRefreshing(false);
  };

  const saveConnections = async (newConnections) => {
    try {
      if (!profile?.id) return;

      const key = `connections_${profile.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(newConnections));
      console.log('Saved connections:', newConnections);
    } catch (error) {
      console.error('Failed to save connections:', error);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animateButton = () => {
    rotateValue.setValue(0);
    Animated.timing(rotateValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const handleEmail = (email) => {
    const subject = 'Great connecting at Avijozi';
    const body = "Hi there,\n\nI enjoyed connecting with you at Avijozi. Let's keep in touch!";
    const mailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailUrl).catch(err => {
      Alert.alert('Error', 'Could not open email client');
      console.error('Failed to open email:', err);
    });
  };

  const handleRemoveConnection = async (person) => {
    Alert.alert(
      "Remove Connection",
      `Are you sure you want to remove ${person.name} from your connections?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const filtered = connections.filter(p => p.id !== person.id);
              setConnections(filtered);
              const storageKey = `network-${profile.id}`;
              await AsyncStorage.setItem(storageKey, JSON.stringify(filtered));
              console.log('Successfully removed connection:', person.name);
            } catch (error) {
              console.error('Failed to remove connection:', error);
              Alert.alert('Error', 'Failed to remove connection. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Load connections on mount and when profile changes
  useEffect(() => {
    loadConnections();
  }, [profile]);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.screen, { backgroundColor: currentColors.background }]}
    >
      <Animated.View
        style={[
          styles.tapButton,
          {
            backgroundColor: currentColors.cardBackground,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.shareButtonContent}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            setVisible(true);
            animateButton();
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tapText, { color: currentColors.textPrimary }]}>
            Tap to share your profile
          </Text>
          <Animated.View
            style={[
              styles.circle,
              {
                width: Width,
                height: Width,
                borderRadius: Width / 2,
                backgroundColor: currentColors.primaryButton,
                transform: [{ rotate: rotateInterpolation }],
              },
            ]}
          >
            <Ionicons name="person-add-outline" size={20} style={{color: currentColors.textSecondary}} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[currentColors.primaryButton]}
              tintColor={currentColors.primaryButton}
            />
          }
        >
          {connections.length === 0 ? (
            <View style={styles.noConnectionsContainer}>
              <Animated.View
                style={[
                  styles.centerConnection,
                  {
                    opacity: rotateValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.5, 1],
                    }),
                  },
                ]}
              >
                <View
                  style={[
                    styles.noConnectionIconCircle,
                    { backgroundColor: currentColors.cardBackground },
                  ]}
                >
                  <Ionicons name="people-outline" size={40} color={currentColors.textPrimary} />
                </View>
                <Text style={[styles.noConnectionsTitle, { color: currentColors.textPrimary }]}>
                  No Connections Yet
                </Text>
                <Text style={[styles.noConnectionsSubtitle, { color: currentColors.textSecondary }]}>
                  Start building your network by connecting with others
                </Text>
              </Animated.View>
            </View>
          ) : (
            connections.map((person) => (
              <Animated.View
                key={person.id || person.Email}
                style={{
                  transform: [{ scale: scaleAnims[person.id] || 1 }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.Container,
                    {
                      backgroundColor: currentColors.cardBackground,
                      borderColor: currentColors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                  ]}
                  onPress={() => {
                    setSelectedPerson(person);
                    setVisible(true);
                    bounce(person.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.profileRow}>
                      {person.avatar ? (
                        <Image
                          source={{ uri: person.avatar }}
                          style={[
                            styles.circleIconContainer,
                            { backgroundColor: currentColors.profileIconBackground },
                          ]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.circleIconContainer,
                            { backgroundColor: currentColors.profileIconBackground },
                          ]}
                        >
                          <Ionicons name="person-outline" size={30} color={currentColors.profileIcon} />
                        </View>
                      )}
                      <View style={styles.profileDetails}>
                        <Text style={[styles.name, { color: currentColors.textPrimary }]}>
                          {person.name || 'No Name'}
                        </Text>
                        <View style={styles.details}>
                          <Text style={[styles.infor, { color: currentColors.secondaryButton }]}>
                            {person.occupation || 'No Title'}
                          </Text>
                          {person.company && (
                            <>
                              <Text style={[styles.separator, { color: currentColors.textSecondary }]}>•</Text>
                              <Text style={[styles.infor, { color: currentColors.secondaryButton }]}>
                                {person.company}
                              </Text>
                            </>
                          )}
                        </View>
                        {person.date && (
                          <View style={styles.connectionDate}>
                            <Text style={[styles.dateText, { color: currentColors.textSecondary }]}>
                              Connected on {new Date(person.date).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveConnection(person)}
                    style={{ padding: 8 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={24} color={currentColors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: currentColors.cardBackground,
                transform: [
                  {
                    translateY: rotateValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {selectedPerson && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: currentColors.textPrimary }]}>
                    Connection Details
                  </Text>
                  <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close-outline" size={24} color={currentColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalProfile}>
                  {selectedPerson.avatar ? (
                    <Image
                      source={{ uri: selectedPerson.avatar }}
                      style={[
                        styles.modalIconContainer,
                        { backgroundColor: currentColors.profileIconBackground },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.modalIconContainer,
                        { backgroundColor: currentColors.profileIconBackground },
                      ]}
                    >
                      <Ionicons name="person-outline" size={40} color={currentColors.profileIcon} />
                    </View>
                  )}
                  <Text style={[styles.modalName, { color: currentColors.textPrimary }]}>
                    {selectedPerson.name}
                  </Text>
                  <Text style={[styles.modalPosition, { color: currentColors.secondaryButton }]}>
                    {selectedPerson.occupation || 'No Title '}{selectedPerson.company ? `at ${selectedPerson.company}` : ''}
                  </Text>
                </View>

                <View style={styles.modalInfoContainer}>
                  {selectedPerson.email && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={currentColors.textSecondary}
                        style={styles.infoIcon}
                      />
                      <Text style={[styles.modalInfoText, { color: currentColors.textPrimary }]}>
                        {selectedPerson.Email}
                      </Text>
                    </View>
                  )}

                  {selectedPerson.company && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name="briefcase-outline"
                        size={20}
                        color={currentColors.textSecondary}
                        style={styles.infoIcon}
                      />
                      <Text style={[styles.modalInfoText, { color: currentColors.textPrimary }]}>
                        {selectedPerson.company}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedPerson.linkedin) {
                        Linking.openURL(selectedPerson.linkedin);
                      } else {
                        Alert.alert('LinkedIn profile not available');
                      }
                    }}
                    style={[styles.actionButton, { backgroundColor: currentColors.primaryButton, flex: 1 }]}
                  >
                    <Ionicons name="logo-linkedin" size={20} color="white" />
                    <Text style={styles.actionButtonText}>LinkedIn</Text>
                  </TouchableOpacity>

                  {selectedPerson.email && (
                    <TouchableOpacity
                      onPress={() => handleEmail(selectedPerson.email)}
                      style={[
                        styles.actionButton,
                        { backgroundColor: currentColors.secondaryButton, flex: 1, marginLeft: 10 },
                      ]}
                    >
                      <Ionicons name="mail-outline" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Email</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tapButton: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  Container: {
    marginVertical: 8,
    padding: 16,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infor: {
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 14,
  },
  connectionDate: {
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalProfile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalPosition: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalInfoContainer: {
    marginBottom: 20,
    width: '100%',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  modalInfoText: {
    fontSize: 15,
    flexShrink: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 15,
  },
  noConnectionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  centerConnection: {
    alignItems: 'center',
  },
  noConnectionIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noConnectionsTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noConnectionsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
});