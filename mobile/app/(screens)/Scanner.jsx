import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuth } from '@/hooks/AuthContext';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const saveToNetwork = async (profile) => {
    if (!profile) {
      Alert.alert('Error', 'Invalid profile data');
      return;
    }
    try {

      console.log("Saving to network for profile ID:", profile.id);
      // const existing = await AsyncStorage.getItem('network');
      const existing = await AsyncStorage.getItem(`network-${profile.id}`);
      const currentNetwork = existing ? JSON.parse(existing) : [];

      const alreadyExists = currentNetwork.find((p) => p.id === profile.id);

      if (!alreadyExists) {
        const updated = [...currentNetwork, profile];
        // await AsyncStorage.setItem('network', JSON.stringify(updated));
        await AsyncStorage.setItem(`network-${profile.id}`, JSON.stringify(updated));
        Alert.alert('Success', `Added ${profile.name} to your network.`);
      } else {
        Alert.alert('Info', `${profile.name} is already in your network.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save to network.');
      console.error('Failed to save to network:', error);
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
            <View style={styles.frame} />
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
      {/* Profile Picture or Placeholder */}
      {scannedData.avatarUrl ? (
        <Image
          source={{ uri: scannedData.avatarUrl }}
          style={styles.profileAvatar}
        />
      ) : (
        <View style={styles.profilePlaceholder}>
          {scannedData.avatarUrl ? (
            <Image
              source={{ uri: scannedData.avatarUrl }}
              style={styles.profileAvatar}
            />
          ) : 
          (
            <MaterialIcons name="person" size={60} color="#888" />
          )}
        </View>
      )}

      <Text style={styles.profileName}>{scannedData.name}</Text>
      <Text style={styles.profileRole}>{scannedData.role || 'Attendee'}</Text>

      <View style={styles.profileInfoRow}>
        <MaterialIcons name="email" size={20} color="#666" />
        <Text style={styles.profileInfoText}>{scannedData.email || 'No Email'}</Text>
      </View>

      <View style={styles.profileInfoRow}>
        <MaterialIcons name="business" size={20} color="#666" />
        <Text style={styles.profileInfoText}>{scannedData.organization || 'No Organization'}</Text>
      </View>

      <View style={styles.profileInfoRow}>
        <MaterialIcons name="work" size={20} color="#666" />
        <Text style={styles.profileInfoText}>{scannedData.occupation || 'No Occupation'}</Text>
      </View>

      <Pressable
        style={[styles.modalButton, styles.buttonOpen]}
        onPress={() => {
          saveToNetwork(scannedData);
          resetScanner();
        }}
      >
        <Text style={styles.textStyle}>Add to Network</Text>
      </Pressable>
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
  container: { flex: 1, backgroundColor: 'black' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  permissionSubtext: { fontSize: 14, textAlign: 'center', color: '#666' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  topOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  frameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    borderRadius: 10,
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
  buttonOpen: { backgroundColor: '#2196F3' },
  buttonClose: { backgroundColor: '#f44336' },
  textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  modalTitle: { marginBottom: 10, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  modalText: { marginBottom: 20, textAlign: 'center', fontSize: 16 },
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
},

profileRole: {
  fontSize: 16,
  fontWeight: '500',
  color: '#666',
  marginBottom: 20,
},

profileInfoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  width: '80%',
},

profileInfoText: {
  marginLeft: 10,
  fontSize: 14,
  color: '#444',
},
});