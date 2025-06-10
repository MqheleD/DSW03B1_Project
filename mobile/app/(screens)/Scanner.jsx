import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform, PermissionsAndroid } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to your camera',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (err) {
          console.warn(err);
          setHasPermission(false);
        }
      } else {
        // iOS handles permissions differently
        setHasPermission(true);
      }
    };

    requestCameraPermission();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData('');
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back
    );
  };

  const openLink = () => {
    if (scannedData) {
      Linking.canOpenURL(scannedData).then(supported => {
        if (supported) {
          Linking.openURL(scannedData);
        } else {
          console.log("Don't know how to open URI: " + scannedData);
        }
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }

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
      <RNCamera
        style={styles.camera}
        type={cameraType}
        flashMode={
          torchOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        onBarCodeRead={scanned ? undefined : handleBarCodeScanned}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        <View style={styles.overlay}>
          {/* Top overlay with title */}
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Scan QR Code</Text>
          </View>

          {/* Center frame */}
          <View style={styles.frameContainer}>
            <View style={styles.frame} />
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomOverlay}>
            {scanned ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText} numberOfLines={2}>
                  {scannedData}
                </Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={openLink}
                  >
                    <Icon name="open-in-browser" size={24} color="white" />
                    <Text style={styles.buttonText}>Open</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={resetScanner}
                  >
                    <Icon name="refresh" size={24} color="white" />
                    <Text style={styles.buttonText}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleTorch}
                >
                  <Icon
                    name={torchOn ? 'flash-on' : 'flash-off'}
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleCameraType}
                >
                  <Icon name="flip-camera-android" size={30} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </RNCamera>
    </View>
  );
};

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
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  frameContainer: {
    flex: 3,
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
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 50,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  resultContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
});
