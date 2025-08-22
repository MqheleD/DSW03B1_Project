import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { colors, Icons } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const QRScanModal = ({ visible, room, rooms, onClose, onScan }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    if (visible) {
      setScanning(true);
      setManualEntry(false);
      setScannedData(null);
      
      // Request camera permission if not already granted
      if (!permission?.granted) {
        requestCameraPermission();
      }
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Camera Permission',
        'Camera permission is required to scan QR codes. You can enter the code manually instead.',
        [
          { text: 'Enter Manually', onPress: () => setManualEntry(true) },
          { text: 'OK' }
        ]
      );
    }
  };

  const handleBarcodeScanned = ({ type, data }) => {
    if (!scanning) return;
    
    setScanning(false);
    setScannedData(data);
    
    // Show preview of scanned data
    Alert.alert(
      'QR Code Scanned',
      `Scanned data preview:\n${data.substring(0, 100)}...`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setScanning(true);
            setScannedData(null);
          }
        },
        {
          text: 'Process Attendee',
          onPress: () => processScannedData(data)
        }
      ]
    );
  };

  const processScannedData = (data) => {
    try {
      // Try to parse as JSON first
      let attendeeData;
      try {
        attendeeData = JSON.parse(data);
      } catch (e) {
        // If not JSON, create a basic structure
        attendeeData = {
          id: `QR_${Date.now()}`,
          name: 'Guest User',
          age: 25,
          gender: 'unknown',
          rawData: data
        };
      }

      // Ensure required fields
      const processedData = {
        id: attendeeData.id || `QR_${Date.now()}`,
        name: attendeeData.name || 'Unknown Guest',
        age: attendeeData.age || 0,
        gender: attendeeData.gender || 'unknown',
        email: attendeeData.email || '',
        phone: attendeeData.phone || '',
        ticket_type: attendeeData.ticket_type || 'general',
        ...attendeeData
      };

      // Send to parent component with room ID
      if (room && room.id) {
        onScan(JSON.stringify(processedData), room.id);
        handleClose();
      } else {
        Alert.alert('Error', 'Please select a room first');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process QR code data');
      setScanning(true);
    }
  };

  const handleManualSubmit = () => {
    if (scannedQRCode && room) {
      processScannedData(scannedQRCode);
    } else {
      Alert.alert('Error', 'Please enter QR code data and select a room');
    }
  };

  const handleClose = () => {
    setScannedQRCode('');
    setScanning(false);
    setManualEntry(false);
    setScannedData(null);
    onClose();
  };

  const renderScannerView = () => {
    if (manualEntry) {
      return (
        <View style={styles.manualEntryContainer}>
          <Text style={styles.inputLabel}>Enter QR Code Data Manually</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter data or {"id":"123","name":"John Doe","age":28}'
            value={scannedQRCode}
            onChangeText={setScannedQRCode}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.helpText}>
            Enter the QR code data (JSON format or plain text)
          </Text>
        </View>
      );
    }

    if (!permission?.granted) {
      return (
        <View style={styles.noCameraContainer}>
          <Text style={styles.noCameraIcon}>📵</Text>
          <Text style={styles.noCameraText}>No camera access</Text>
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => setManualEntry(true)}
          >
            <Text style={styles.manualEntryButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'code128', 'ean13', 'upc_a'],
          }}
          style={styles.scanner}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTopOverlay} />
          <View style={styles.scannerMiddleRow}>
            <View style={styles.scannerSideOverlay} />
            <View style={styles.scannerFrame}>
              <View style={[styles.scannerCorner, styles.topLeft]} />
              <View style={[styles.scannerCorner, styles.topRight]} />
              <View style={[styles.scannerCorner, styles.bottomLeft]} />
              <View style={[styles.scannerCorner, styles.bottomRight]} />
              {scanning && (
                <Text style={styles.scanningText}>Scanning...</Text>
              )}
            </View>
            <View style={styles.scannerSideOverlay} />
          </View>
          <View style={styles.scannerBottomOverlay}>
            <Text style={styles.scannerHint}>
              Point camera at QR code
            </Text>
            <TouchableOpacity
              style={styles.manualEntryLink}
              onPress={() => setManualEntry(true)}
            >
              <Text style={styles.manualEntryLinkText}>
                Enter code manually
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Attendee QR Code</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{Icons.close}</Text>
            </TouchableOpacity>
          </View>
          
          {room && (
            <View style={styles.roomInfo}>
              <Text style={styles.roomInfoLabel}>Scanning for:</Text>
              <Text style={styles.roomInfoName}>{room.room_name || room.name}</Text>
            </View>
          )}
          
          {renderScannerView()}
          
          {manualEntry && (
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setManualEntry(false);
                  setScannedQRCode('');
                  if (permission?.granted) {
                    setScanning(true);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Use Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleManualSubmit}
                disabled={!scannedQRCode}
              >
                <Text style={styles.confirmButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          )}

          {scanning && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => {
                setScanning(true);
                setScannedData(null);
              }}
            >
              <Text style={styles.rescanButtonText}>Tap to Rescan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  roomInfo: {
    backgroundColor: colors.lightPink,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  roomInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  roomInfoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scannerContainer: {
    flex: 1,
    marginVertical: 10,
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerTopOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerMiddleRow: {
    flexDirection: 'row',
    height: screenWidth * 0.7,
  },
  scannerSideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerFrame: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanningText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scannerBottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 20,
  },
  scannerHint: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  manualEntryLink: {
    padding: 10,
  },
  manualEntryLinkText: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  manualEntryContainer: {
    padding: 20,
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  noCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCameraIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noCameraText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  manualEntryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  manualEntryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.lightPink,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.background,
  },
  rescanButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  rescanButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRScanModal;