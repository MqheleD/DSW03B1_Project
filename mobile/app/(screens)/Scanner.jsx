import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Modal, Pressable, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigator = useNavigation();

  useEffect(() => {
    (async () => {
      // const { status } = await CameraView.requestCameraPermissionsAsync();
      const { status } = await Camera.requestCameraPermissionsAsync();

      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    setModalVisible(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData('');
    setModalVisible(false);
  };

  const openLink = () => {
    if (scannedData) {
      // Check if the scanned data is a URL
      const urlPattern = /^(https?:\/\/)/i;
      if (urlPattern.test(scannedData)) {
        Linking.canOpenURL(scannedData).then(supported => {
          if (supported) {
            Linking.openURL(scannedData);
          } else {
            console.log("Don't know how to open URI: " + scannedData);
          }
        });
      }
    }
    setModalVisible(false);
  };

  // if (hasPermission === null) {
  //   return (
  //     <View style={styles.permissionContainer}>
  //       <Text>Requesting for camera permission</Text>
  //       <Button title="Request Permission" 
  //         onPress={() => Camera.requestCameraPermissionsAsync()} 
  //         />
  //     </View>
  //   );
  // }

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
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'ean13', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torchOn}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Pressable onPress={() => navigator.goBack()}>
              <MaterialIcons
                name="arrow-back"
                size={30}
                color="white"
              />
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
                name={torchOn ? "flash-on" : "flash-off"} 
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
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Scan Result</Text>
            <Text style={styles.modalText} numberOfLines={3}>{scannedData}</Text>
            
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.buttonClose]}
                onPress={resetScanner}
              >
                <Text style={styles.textStyle}>Scan Again</Text>
              </Pressable>
              {scannedData.startsWith('http') && (
                <Pressable
                  style={[styles.modalButton, styles.buttonOpen]}
                  onPress={openLink}
                >
                  <Text style={styles.textStyle}>Open Link</Text>
                </Pressable>
              )}
            </View>
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
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
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
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonOpen: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});