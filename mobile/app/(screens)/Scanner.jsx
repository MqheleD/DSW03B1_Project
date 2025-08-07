import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuth } from '@/hooks/AuthContext';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const confettiRef = useRef(null);
  const navigator = useNavigation();
  const { profile } = UserAuth();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    try {
      const parsed = JSON.parse(data);

      if (parsed?.type === 'profile') {
        // Add timestamp to the connection
        parsed.date = new Date().toISOString();
        setScannedData(parsed);
        console.log('Scanned Profile:', parsed);
      } else if (parsed?.type === 'room') {
        setScannedData(parsed);
      } else {
        setScannedData({ error: 'Unsupported QR type' });
      }
    } catch (err) {
      setScannedData({ error: 'Invalid QR Code' });
    }

    setModalVisible(true);
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData(null);
    setModalVisible(false);
  };

  const saveToNetwork = async (profileData) => {
    if (!profileData || !profile?.id) {
      Alert.alert('Error', 'Invalid profile data');
      return;
    }

    try {
      console.log("Saving to network for user:", profile.id);
      const storageKey = `network-${profile.id}`;
      const existing = await AsyncStorage.getItem(storageKey);
      const currentNetwork = existing ? JSON.parse(existing) : [];

      const alreadyExists = currentNetwork.some(
        p => p.id === profileData.id || p.email === profileData.email
      );

      if (!alreadyExists) {
        const updated = [...currentNetwork, profileData];
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        
        // Show confetti celebration
        setShowConfetti(true);
        confettiRef.current?.start();
        
setShowConfetti(true);

setTimeout(() => {
  setShowConfetti(false);
  Alert.alert(
    'Success',
    `Added ${profileData.name} to your network.`,
    [{ text: "OK", onPress: resetScanner }]
  );
}, 1500);
      } else {
        Alert.alert(
          'Info', 
          `${profileData.name} is already in your network.`,
          [{ text: "OK", onPress: resetScanner }]
        );
      }
    } catch (error) {
      console.error('Failed to save to network:', error);
      Alert.alert('Error', 'Failed to save connection. Please try again.');
    }
  };

  const handleRoomRedirect = () => {
    if (scannedData?.type === 'room' && scannedData.id) {
      navigator.navigate('RoomDetails', { roomId: scannedData.id });
      resetScanner();
    }
  };

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      

      <CameraView
        style={styles.camera}
        facing={'back'}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torchOn}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Pressable onPress={() => navigator.goBack()}>
              <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>
            <Text style={styles.title}>Scan QR Code</Text>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          </View>

          <View style={styles.bottomOverlay}>
            <TouchableOpacity
              style={styles.torchButton}
              onPress={() => setTorchOn(!torchOn)}
            >
              <MaterialIcons
                name={torchOn ? 'flash-on' : 'flash-off'}
                size={30}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {scannedData?.error ? (
              <>
                <Text style={styles.modalTitle}>Scan Result</Text>
                <Text style={styles.modalText}>{scannedData.error}</Text>
              </>
            ) : scannedData?.type === 'profile' ? (
              <>
                <View style={styles.profileModalContainer}>
                  {scannedData.avatarUrl ? (
                    <Image
                      source={{ uri: scannedData.avatarUrl }}
                      style={styles.profileAvatar}
                    />
                  ) : scannedData.avatar ? (
                    <Image
                      source={{ uri: scannedData.avatar }}
                      style={styles.profileAvatar}
                    />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <MaterialIcons name="person" size={60} color="#888" />
                    </View>
                  )}

                  <Text style={styles.profileName}>{scannedData.name}</Text>
                  <Text style={styles.profileRole}>
                    {scannedData.title || scannedData.role || 'Attendee'}
                    {scannedData.company ? ` at ${scannedData.company}` : ''}
                  </Text>

                  <View style={styles.profileInfoRow}>
                    <MaterialIcons name="email" size={20} color="#666" />
                    <Text style={styles.profileInfoText}>
                      {scannedData.email || scannedData.Email || 'No Email'}
                    </Text>
                  </View>

                  {scannedData.company && (
                    <View style={styles.profileInfoRow}>
                      <MaterialIcons name="business" size={20} color="#666" />
                      <Text style={styles.profileInfoText}>
                        {scannedData.company}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={[styles.modalButton, styles.buttonOpen]}
                    onPress={() => saveToNetwork(scannedData)}
                  >
                    <Text style={styles.textStyle}>Add to Network</Text>
                  </Pressable>
                  {/* Confetti Celebration */}
{showConfetti && (
  <View style={styles.confettiContainer}>
    <ConfettiCannon
      count={300}
      origin={{ x: width / 2, y: -20 }}
      explosionSpeed={500}
      fallSpeed={3000}
      fadeOut={true}
      colors={['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF']}
      size={2}
    />
  </View>
)}
                </View>
              </>
            ) : scannedData?.type === 'room' ? (
              <>
                <Text style={styles.modalTitle}>Room Access</Text>
                <Text style={styles.modalText}>Room ID: {scannedData.id}</Text>
                <Pressable
                  style={[styles.modalButton, styles.buttonOpen]}
                  onPress={handleRoomRedirect}
                >
                  <Text style={styles.textStyle}>View Room Details</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Scan Result</Text>
                <Text style={styles.modalText}>{JSON.stringify(scannedData)}</Text>
              </>
            )}

            <Pressable
              style={[styles.modalButton, styles.buttonClose]}
              onPress={resetScanner}
            >
              <Text style={styles.textStyle}>Scan Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black',
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  permissionSubtext: { 
    fontSize: 14, 
    textAlign: 'center', 
    color: '#666' 
  },
  camera: { 
    flex: 1 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.4)' 
  },
  topOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  frameContainer: { 
    flex: 3, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    borderRadius: 10,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#FFD700',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#FFD700',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#FFD700',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#FFD700',
  },
  bottomOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  torchButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 140,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonOpen: { 
    backgroundColor: '#2196F3' 
  },
  buttonClose: { 
    backgroundColor: '#f44336' 
  },
  textStyle: { 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  modalTitle: { 
    marginBottom: 10, 
    textAlign: 'center', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  modalText: { 
    marginBottom: 20, 
    textAlign: 'center', 
    fontSize: 16 
  },
  profileModalContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#ddd',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  profileInfoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
    flexShrink: 1,
  },
});