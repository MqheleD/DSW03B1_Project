import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../constants/theme';

const AddAlertModal = ({ visible, rooms, onClose, onAdd }) => {
  const [newAlert, setNewAlert] = useState({
    roomId: rooms[0]?.id || 1,
    type: 'technical',
    message: '',
    severity: 'medium'
  });

  const handleAdd = () => {
    onAdd(newAlert);
    setNewAlert({
      roomId: rooms[0]?.id || 1,
      type: 'technical',
      message: '',
      severity: 'medium'
    });
  };

  const handleClose = () => {
    setNewAlert({
      roomId: rooms[0]?.id || 1,
      type: 'technical',
      message: '',
      severity: 'medium'
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Create New Alert</Text>
            
            <Text style={styles.inputLabel}>Room</Text>
            <View style={styles.roomPicker}>
              <Picker
                selectedValue={newAlert.roomId}
                onValueChange={(itemValue) => setNewAlert({...newAlert, roomId: itemValue})}
              >
                {rooms.map(room => (
                  <Picker.Item 
                    key={room.id} 
                    label={room.room_name || room.name} 
                    value={room.id} 
                  />
                ))}
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>Alert Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newAlert.type === 'technical' && styles.activeTypeButton
                ]}
                onPress={() => setNewAlert({...newAlert, type: 'technical'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  newAlert.type === 'technical' && styles.activeTypeButtonText
                ]}>
                  Technical Issue
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newAlert.type === 'overcrowding' && styles.activeTypeButton
                ]}
                onPress={() => setNewAlert({...newAlert, type: 'overcrowding'})}
              >
                <Text style={[
                  styles.typeButtonText,
                  newAlert.type === 'overcrowding' && styles.activeTypeButtonText
                ]}>
                  Overcrowding
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Severity</Text>
            <View style={styles.severitySelector}>
              <TouchableOpacity
                style={[
                  styles.severityButton,
                  newAlert.severity === 'medium' && styles.activeSeverityButton
                ]}
                onPress={() => setNewAlert({...newAlert, severity: 'medium'})}
              >
                <Text style={[
                  styles.severityButtonText,
                  newAlert.severity === 'medium' && styles.activeSeverityButtonText
                ]}>
                  Medium
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.severityButton,
                  newAlert.severity === 'high' && styles.activeSeverityButton
                ]}
                onPress={() => setNewAlert({...newAlert, severity: 'high'})}
              >
                <Text style={[
                  styles.severityButtonText,
                  newAlert.severity === 'high' && styles.activeSeverityButtonText
                ]}>
                  High
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Message *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Enter alert details"
              multiline={true}
              numberOfLines={4}
              value={newAlert.message}
              onChangeText={text => setNewAlert({...newAlert, message: text})}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAdd}
              >
                <Text style={styles.confirmButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
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
    marginBottom: 15,
    fontSize: 14,
    color: colors.text,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  roomPicker: {
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    marginBottom: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightPink,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  severitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightPink,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeSeverityButton: {
    backgroundColor: colors.primary,
  },
  severityButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeSeverityButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
});

export default AddAlertModal;