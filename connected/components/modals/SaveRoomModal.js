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
  Alert,
} from 'react-native';
import { colors } from '../../constants/theme';
import supabase from '../../supabaseClient';

const SaveRoomModal = ({ visible, room, attendees, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!room) return null;

  // Calculate room demographics
  const roomAttendees = attendees.filter(a => a.analytics_room_id === room.id || a.current_room_id === room.id);
  
  const genderCounts = {
    male: roomAttendees.filter(a => a.gender?.toLowerCase() === 'male').length,
    female: roomAttendees.filter(a => a.gender?.toLowerCase() === 'female').length,
    nonBinary: roomAttendees.filter(a => a.gender?.toLowerCase() === 'non-binary').length,
    preferNotToSay: roomAttendees.filter(a => a.gender?.toLowerCase() === 'prefer not to say' || !a.gender).length,
  };

  const ageCounts = {
    age18_24: roomAttendees.filter(a => a.age >= 18 && a.age <= 24).length,
    age25_34: roomAttendees.filter(a => a.age >= 25 && a.age <= 34).length,
    age35_44: roomAttendees.filter(a => a.age >= 35 && a.age <= 44).length,
    age45Plus: roomAttendees.filter(a => a.age >= 45).length,
  };

  const totalAttendees = roomAttendees.length;
  const averageAge = totalAttendees > 0 
    ? roomAttendees.reduce((sum, a) => sum + (a.age || 0), 0) / totalAttendees 
    : 0;
  const occupancyPercentage = room.capacity > 0 
    ? (totalAttendees / room.capacity) * 100 
    : 0;

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Insert saved room data
      const { data: savedRoom, error: saveRoomError } = await supabase
        .from('saved_rooms')
        .insert([{
          room_id: room.id,
          room_name: room.room_name || room.name,
          saved_by: 'Admin User', // You can get this from user context
          total_attendees: totalAttendees,
          capacity: room.capacity,
          occupancy_percentage: Math.round(occupancyPercentage * 100) / 100,
          male_count: genderCounts.male,
          female_count: genderCounts.female,
          non_binary_count: genderCounts.nonBinary,
          prefer_not_to_say_count: genderCounts.preferNotToSay,
          age_18_24: ageCounts.age18_24,
          age_25_34: ageCounts.age25_34,
          age_35_44: ageCounts.age35_44,
          age_45_plus: ageCounts.age45Plus,
          average_age: Math.round(averageAge * 100) / 100,
          notes: notes.trim() || null,
        }])
        .select()
        .single();

      if (saveRoomError) throw saveRoomError;

      // Insert attendee snapshots
      if (roomAttendees.length > 0) {
        const attendeeSnapshots = roomAttendees.map(attendee => ({
          saved_room_id: savedRoom.id,
          attendee_id: attendee.id,
          full_name: attendee.full_name,
          email: attendee.email,
          age: attendee.age,
          gender: attendee.gender,
          occupation: attendee.occupation,
          organization: attendee.organization,
          check_in_time: attendee.check_in_time,
        }));

        const { error: saveAttendeesError } = await supabase
          .from('saved_room_attendees')
          .insert(attendeeSnapshots);

        if (saveAttendeesError) throw saveAttendeesError;
      }

      // Set analytics_room_id for attendees who don't have it set
      const attendeesWithoutAnalyticsRoom = roomAttendees.filter(a => !a.analytics_room_id);
      if (attendeesWithoutAnalyticsRoom.length > 0) {
        const { error: updateAnalyticsError } = await supabase
          .from('attendees')
          .update({ analytics_room_id: room.id })
          .in('id', attendeesWithoutAnalyticsRoom.map(a => a.id));

        if (updateAnalyticsError) throw updateAnalyticsError;
      }

      // Move all attendees currently in this room to null (they're no longer in any active room)
      // But preserve their analytics_room_id for historical data
      const { error: updateCurrentRoomError } = await supabase
        .from('attendees')
        .update({ current_room_id: null })
        .eq('current_room_id', room.id);

      if (updateCurrentRoomError) throw updateCurrentRoomError;

      // Delete any alerts for this room
      const { error: deleteAlertsError } = await supabase
        .from('alerts')
        .delete()
        .eq('room_id', room.id);

      if (deleteAlertsError) {
        console.error('Error deleting alerts:', deleteAlertsError);
        // Don't throw, just log the error
      }

      // Delete any sessions for this room (since room will be archived)
      const { error: deleteSessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('room_id', room.id);

      if (deleteSessionsError) {
        console.error('Error deleting sessions:', deleteSessionsError);
        // Don't throw, just log the error
      }

      setNotes('');
      onSave();
      Alert.alert(
        'Room Archived Successfully!', 
        `"${room.room_name}" has been saved with ${totalAttendees} attendees and will be archived from active use. All attendees have been checked out and sessions have been cleared.`
      );
      
    } catch (error) {
      console.error('Error saving room:', error);
      Alert.alert('Error', 'Failed to save room data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setNotes('');
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
            <Text style={styles.modalTitle}>Save Room Data</Text>
            
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{room.room_name || room.name}</Text>
              <Text style={styles.saveTimestamp}>
                Saving at: {new Date().toLocaleString()}
              </Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Data Preview</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{totalAttendees}</Text>
                  <Text style={styles.statLabel}>Total Attendees</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{room.capacity}</Text>
                  <Text style={styles.statLabel}>Capacity</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{Math.round(occupancyPercentage)}%</Text>
                  <Text style={styles.statLabel}>Occupancy</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{averageAge.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg Age</Text>
                </View>
              </View>

              <View style={styles.demographicsPreview}>
                <Text style={styles.subSectionTitle}>Gender Distribution</Text>
                <View style={styles.demographicRow}>
                  <Text style={styles.demographicItem}>Male: {genderCounts.male}</Text>
                  <Text style={styles.demographicItem}>Female: {genderCounts.female}</Text>
                </View>
                <View style={styles.demographicRow}>
                  <Text style={styles.demographicItem}>Non-Binary: {genderCounts.nonBinary}</Text>
                  <Text style={styles.demographicItem}>Not specified: {genderCounts.preferNotToSay}</Text>
                </View>

                <Text style={styles.subSectionTitle}>Age Distribution</Text>
                <View style={styles.demographicRow}>
                  <Text style={styles.demographicItem}>18-24: {ageCounts.age18_24}</Text>
                  <Text style={styles.demographicItem}>25-34: {ageCounts.age25_34}</Text>
                </View>
                <View style={styles.demographicRow}>
                  <Text style={styles.demographicItem}>35-44: {ageCounts.age35_44}</Text>
                  <Text style={styles.demographicItem}>45+: {ageCounts.age45Plus}</Text>
                </View>
              </View>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Add any notes about this room snapshot..."
                multiline={true}
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>Important - Room Will Be Archived:</Text>
                <Text style={styles.warningText}>
                  This will create a permanent snapshot and ARCHIVE this room from active use. 
                  All attendees will be checked out but their analytics data will be preserved.
                  The room will no longer appear in the active rooms list.
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.confirmButtonText}>
                  {saving ? 'Archiving...' : 'Save & Archive Room'}
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
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  roomInfo: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 5,
  },
  saveTimestamp: {
    fontSize: 12,
    color: colors.background,
    opacity: 0.9,
  },
  previewSection: {
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 3,
  },
  demographicsPreview: {
    marginTop: 10,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  demographicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  demographicItem: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  notesSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
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
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
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

export default SaveRoomModal;