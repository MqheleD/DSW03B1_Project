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
  ScrollView,
} from 'react-native';
import { colors } from '../../constants/theme';

const EditRoomModal = ({ visible, room, onClose, onSave }) => {
  const [editedRoom, setEditedRoom] = useState({
    id: '',
    name: '',
    capacity: '',
    location: '',
    speaker: ''
  });

  useEffect(() => {
    if (room) {
      setEditedRoom({
        id: room.id,
        name: room.room_name || room.name || '',
        capacity: room.capacity?.toString() || '',
        location: room.location || '',
        speaker: room.speaker_id || room.speaker || ''
      });
    }
  }, [room]);

  const handleSave = () => {
    onSave(editedRoom);
  };

  const handleClose = () => {
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
            <Text style={styles.modalTitle}>Edit Room</Text>
            
            <Text style={styles.inputLabel}>Room Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room name"
              value={editedRoom.name}
              onChangeText={text => setEditedRoom({...editedRoom, name: text})}
              autoCapitalize="words"
              returnKeyType="next"
            />
            
            <Text style={styles.inputLabel}>Capacity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter capacity"
              keyboardType="numeric"
              value={editedRoom.capacity}
              onChangeText={text => setEditedRoom({...editedRoom, capacity: text})}
              returnKeyType="next"
            />
            
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location (optional)"
              value={editedRoom.location}
              onChangeText={text => setEditedRoom({...editedRoom, location: text})}
              autoCapitalize="words"
              returnKeyType="next"
            />
            
            <Text style={styles.inputLabel}>Speaker/Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter speaker or activity (optional)"
              value={editedRoom.speaker}
              onChangeText={text => setEditedRoom({...editedRoom, speaker: text})}
              autoCapitalize="words"
              returnKeyType="done"
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
                onPress={handleSave}
                disabled={!editedRoom.name || !editedRoom.capacity}
              >
                <Text style={[
                  styles.confirmButtonText,
                  (!editedRoom.name || !editedRoom.capacity) && styles.disabledButtonText
                ]}>
                  Save Changes
                </Text>
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
    fontSize: 20,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.lightPink,
    borderWidth: 1,
    borderColor: colors.border,
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
  disabledButtonText: {
    opacity: 0.5,
  },
});

export default EditRoomModal;