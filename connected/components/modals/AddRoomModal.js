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
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../constants/theme';

const AddRoomModal = ({ 
  visible, 
  onClose, 
  onAdd,
  // New props for session integration
  sessions = [],
  speakers = [],
  existingRooms = []
}) => {
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    location: '',
    speaker: ''
  });

  // Dropdown states
  const [sessionRoomOpen, setSessionRoomOpen] = useState(false);
  const [sessionRoomValue, setSessionRoomValue] = useState(null);
  const [sessionRoomItems, setSessionRoomItems] = useState([]);
  
  const [speakerOpen, setSpeakerOpen] = useState(false);
  const [speakerValue, setSpeakerValue] = useState(null);
  const [speakerItems, setSpeakerItems] = useState([]);

  const [useSessionData, setUseSessionData] = useState(false);

  // Extract unique room information from sessions
  useEffect(() => {
    if (sessions.length > 0) {
      // Get unique room names from sessions that don't already exist
      const sessionRoomNames = new Set();
      const existingRoomNames = new Set(existingRooms.map(room => room.room_name?.toLowerCase()));
      
      sessions.forEach(session => {
        if (session.room_name && !existingRoomNames.has(session.room_name.toLowerCase())) {
          sessionRoomNames.add(session.room_name);
        }
      });

      // Create dropdown items for session rooms
      const roomItems = Array.from(sessionRoomNames).map(roomName => {
        // Find sessions for this room to get additional info
        const roomSessions = sessions.filter(s => s.room_name === roomName);
        const sessionCount = roomSessions.length;
        
        return {
          label: `${roomName} (${sessionCount} session${sessionCount !== 1 ? 's' : ''})`,
          value: roomName,
          sessionData: {
            roomName,
            sessions: roomSessions,
            suggestedCapacity: Math.max(50, sessionCount * 25), // Suggest capacity based on sessions
          }
        };
      });

      setSessionRoomItems(roomItems);
    }
  }, [sessions, existingRooms]);

  // Setup speaker dropdown
  useEffect(() => {
    if (speakers.length > 0) {
      const speakerDropdownItems = speakers.map(speaker => ({
        label: speaker.full_name,
        value: speaker.id,
        speaker: speaker
      }));
      setSpeakerItems(speakerDropdownItems);
    }
  }, [speakers]);

  // Handle selection from session room dropdown
  const handleSessionRoomSelect = (value) => {
    const selectedItem = sessionRoomItems.find(item => item.value === value);
    if (selectedItem) {
      const { sessionData } = selectedItem;
      
      // Pre-fill form with session data
      setNewRoom(prev => ({
        ...prev,
        name: sessionData.roomName,
        capacity: sessionData.suggestedCapacity.toString(),
        location: '', // Could be extracted from session location if available
      }));
      
      setUseSessionData(true);
      
      // Show info about the sessions
      Alert.alert(
        'Room Info from Sessions',
        `Found ${sessionData.sessions.length} session${sessionData.sessions.length !== 1 ? 's' : ''} for "${sessionData.roomName}".\n\nSuggested capacity: ${sessionData.suggestedCapacity} people\n\nPlease review and adjust the details as needed.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleAdd = () => {
    // Validate required fields
    if (!newRoom.name.trim()) {
      Alert.alert('Validation Error', 'Room name is required.');
      return;
    }
    
    if (!newRoom.capacity || isNaN(newRoom.capacity) || parseInt(newRoom.capacity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid capacity.');
      return;
    }

    // Check if room name already exists
    const duplicateRoom = existingRooms.find(
      room => room.room_name?.toLowerCase() === newRoom.name.toLowerCase()
    );
    
    if (duplicateRoom) {
      Alert.alert('Duplicate Room', 'A room with this name already exists.');
      return;
    }

    // Get speaker ID if speaker is selected
    const selectedSpeaker = speakerItems.find(item => item.value === speakerValue);
    const roomData = {
      ...newRoom,
      speaker: selectedSpeaker ? selectedSpeaker.value : null,
      speakerName: selectedSpeaker ? selectedSpeaker.speaker.full_name : null,
      fromSessionData: useSessionData
    };

    onAdd(roomData);
    handleClose();
  };

  const handleClose = () => {
    setNewRoom({ name: '', capacity: '', location: '', speaker: '' });
    setSessionRoomValue(null);
    setSpeakerValue(null);
    setUseSessionData(false);
    setSessionRoomOpen(false);
    setSpeakerOpen(false);
    onClose();
  };

  const clearForm = () => {
    setNewRoom({ name: '', capacity: '', location: '', speaker: '' });
    setSessionRoomValue(null);
    setSpeakerValue(null);
    setUseSessionData(false);
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
          <Text style={styles.modalTitle}>Add New Room</Text>
          
          <View style={styles.contentContainer}>
            
            {/* Session Room Selector */}
            {sessionRoomItems.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📅 Quick Add from Sessions</Text>
                <Text style={styles.sectionSubtitle}>
                  Select a room from your scheduled sessions to auto-fill details
                </Text>
                
                <View style={styles.dropdownContainer}>
                  <DropDownPicker
                    open={sessionRoomOpen}
                    value={sessionRoomValue}
                    items={sessionRoomItems}
                    setOpen={(open) => {
                      if (open) setSpeakerOpen(false);
                      setSessionRoomOpen(open);
                    }}
                    setValue={setSessionRoomValue}
                    setItems={setSessionRoomItems}
                    placeholder="Select room from sessions..."
                    onChangeValue={handleSessionRoomSelect}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    textStyle={styles.dropdownText}
                    zIndex={3000}
                    zIndexInverse={1000}
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                  />
                </View>
                
                <View style={styles.divider} />
              </View>
            )}

            {/* Manual Entry Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🏢 Room Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter room name"
                  value={newRoom.name}
                  onChangeText={text => setNewRoom({...newRoom, name: text})}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Capacity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter capacity"
                  keyboardType="numeric"
                  value={newRoom.capacity}
                  onChangeText={text => setNewRoom({...newRoom, capacity: text})}
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location (optional)"
                  value={newRoom.location}
                  onChangeText={text => setNewRoom({...newRoom, location: text})}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              {/* Speaker Selector */}
              {speakerItems.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Speaker</Text>
                  <DropDownPicker
                    open={speakerOpen}
                    value={speakerValue}
                    items={speakerItems}
                    setOpen={(open) => {
                      if (open) setSessionRoomOpen(false);
                      setSpeakerOpen(open);
                    }}
                    setValue={setSpeakerValue}
                    setItems={setSpeakerItems}
                    placeholder="Select speaker (optional)..."
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownList}
                    textStyle={styles.dropdownText}
                    zIndex={2000}
                    zIndexInverse={2000}
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                  />
                </View>
              )}
            </View>

            {/* Info about session integration */}
            {useSessionData && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  ℹ️ This room was pre-filled from session data. You can modify any details before adding.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearForm}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAdd}
                disabled={!newRoom.name.trim() || !newRoom.capacity}
              >
                <Text style={[
                  styles.confirmButtonText,
                  (!newRoom.name.trim() || !newRoom.capacity) && styles.disabledButtonText
                ]}>
                  Add Room
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    width: '95%',
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  buttonContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 18,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 20,
    marginBottom: 5,
  },
  inputGroup: {
    marginBottom: 18,
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
    padding: 15,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
  },
  dropdownContainer: {
    marginBottom: 18,
  },
  dropdown: {
    backgroundColor: colors.lightPink,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 50,
  },
  dropdownList: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    maxHeight: 150, // Limit dropdown height
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: colors.lightPink,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  infoContainer: {
    backgroundColor: colors.lightPink,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default AddRoomModal;