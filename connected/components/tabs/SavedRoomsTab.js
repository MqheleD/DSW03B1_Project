import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';
import DonutChart from '../charts/DonutChart';
import supabase from '../../supabaseClient';

const SavedRoomDetailsModal = ({ visible, savedRoom, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && savedRoom) {
      fetchSavedRoomAttendees();
    }
  }, [visible, savedRoom]);

  const fetchSavedRoomAttendees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_room_attendees')
        .select('*')
        .eq('saved_room_id', savedRoom.id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('Error fetching saved room attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!savedRoom) return null;

  const genderData = [
    { label: 'Male', value: savedRoom.male_count, color: colors.accent },
    { label: 'Female', value: savedRoom.female_count, color: colors.primary },
    { label: 'Non-Binary', value: savedRoom.non_binary_count, color: colors.warning },
    { label: 'Prefer not to say', value: savedRoom.prefer_not_to_say_count, color: colors.textSecondary },
  ].filter(item => item.value > 0);

  const ageData = [
    { label: '18-24', value: savedRoom.age_18_24, color: colors.chartColors[0] },
    { label: '25-34', value: savedRoom.age_25_34, color: colors.chartColors[1] },
    { label: '35-44', value: savedRoom.age_35_44, color: colors.chartColors[2] },
    { label: '45+', value: savedRoom.age_45_plus, color: colors.chartColors[3] },
  ].filter(item => item.value > 0);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{savedRoom.room_name}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>{Icons.close}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.savedRoomStats}>
              <Text style={styles.savedDate}>
                Saved: {new Date(savedRoom.saved_at).toLocaleString()}
              </Text>
              <Text style={styles.savedBy}>Saved by: {savedRoom.saved_by}</Text>
              {savedRoom.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{savedRoom.notes}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedRoom.total_attendees}</Text>
                <Text style={styles.statLabel}>Attendees</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedRoom.capacity}</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedRoom.occupancy_percentage}%</Text>
                <Text style={styles.statLabel}>Full</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedRoom.average_age}</Text>
                <Text style={styles.statLabel}>Avg Age</Text>
              </View>
            </View>

            {genderData.length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>Gender Distribution</Text>
                <View style={styles.chartRow}>
                  <DonutChart data={genderData} size={140} totalLabel="People" />
                  <View style={styles.chartLegend}>
                    {genderData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.label}</Text>
                        <Text style={styles.legendValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {ageData.length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>Age Distribution</Text>
                <View style={styles.chartRow}>
                  <DonutChart data={ageData} size={140} totalLabel="People" />
                  <View style={styles.chartLegend}>
                    {ageData.map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.label}</Text>
                        <Text style={styles.legendValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.attendeeSection}>
              <Text style={styles.chartTitle}>Attendees ({attendees.length})</Text>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                attendees.map(attendee => (
                  <View key={attendee.id} style={styles.attendeeItem}>
                    <View style={styles.attendeeInfo}>
                      <Text style={styles.attendeeName}>{attendee.full_name}</Text>
                      <Text style={styles.attendeeEmail}>{attendee.email}</Text>
                      {attendee.organization && (
                        <Text style={styles.attendeeOrg}>{attendee.organization}</Text>
                      )}
                    </View>
                    <View style={styles.attendeeMeta}>
                      {attendee.gender && (
                        <Text style={styles.attendeeGender}>{attendee.gender}</Text>
                      )}
                      {attendee.age && (
                        <Text style={styles.attendeeAge}>{attendee.age} years</Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const SavedRoomsTab = ({ userRole }) => {
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSavedRoom, setSelectedSavedRoom] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchSavedRooms();
  }, []);

  const fetchSavedRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_rooms')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedRooms(data || []);
    } catch (error) {
      console.error('Error fetching saved rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSavedRoom = async (savedRoomId) => {
    Alert.alert(
      'Delete Saved Room',
      'Are you sure you want to delete this saved room data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('saved_rooms')
                .delete()
                .eq('id', savedRoomId);

              if (error) throw error;
              
              await fetchSavedRooms();
              Alert.alert('Success', 'Saved room data deleted successfully');
            } catch (error) {
              console.error('Error deleting saved room:', error);
              Alert.alert('Error', 'Failed to delete saved room data');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const viewSavedRoomDetails = (savedRoom) => {
    setSelectedSavedRoom(savedRoom);
    setShowDetailsModal(true);
  };

  if (loading && savedRooms.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading saved rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {savedRooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateText}>No saved room data</Text>
            <Text style={styles.emptyStateSubtext}>
              Room snapshots will appear here when admins save room data
            </Text>
          </View>
        ) : (
          savedRooms.map(savedRoom => (
            <TouchableOpacity
              key={savedRoom.id}
              style={styles.savedRoomCard}
              onPress={() => viewSavedRoomDetails(savedRoom)}
            >
              <View style={styles.savedRoomHeader}>
                <View style={styles.savedRoomTitleRow}>
                  <Text style={styles.savedRoomName}>{savedRoom.room_name}</Text>
                  <Text style={styles.savedRoomDate}>
                    {new Date(savedRoom.saved_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.savedRoomTime}>
                  {new Date(savedRoom.saved_at).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.savedRoomStats}>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatNumber}>{savedRoom.total_attendees}</Text>
                  <Text style={styles.quickStatLabel}>Attendees</Text>
                </View>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatNumber}>{savedRoom.occupancy_percentage}%</Text>
                  <Text style={styles.quickStatLabel}>Capacity</Text>
                </View>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatNumber}>{savedRoom.average_age}</Text>
                  <Text style={styles.quickStatLabel}>Avg Age</Text>
                </View>
              </View>

              <View style={styles.savedRoomFooter}>
                <Text style={styles.savedBy}>Saved by {savedRoom.saved_by}</Text>
                {userRole === 'admin' && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteSavedRoom(savedRoom.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>{Icons.delete}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {savedRoom.notes && (
                <View style={styles.notesPreview}>
                  <Text style={styles.notesPreviewText} numberOfLines={2}>
                    {savedRoom.notes}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <SavedRoomDetailsModal
        visible={showDetailsModal}
        savedRoom={selectedSavedRoom}
        onClose={() => setShowDetailsModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  savedRoomCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    margin: 15,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  savedRoomHeader: {
    marginBottom: 10,
  },
  savedRoomTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  savedRoomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  savedRoomDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  savedRoomTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savedRoomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savedRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  savedBy: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.error,
  },
  notesPreview: {
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  notesPreviewText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // Modal styles
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
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
  savedRoomStats: {
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  savedDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  savedBy: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  notesContainer: {
    marginTop: 10,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    minWidth: 70,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 5,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartLegend: {
    flex: 1,
    marginLeft: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  attendeeSection: {
    marginTop: 20,
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    marginBottom: 8,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  attendeeEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  attendeeOrg: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  attendeeMeta: {
    alignItems: 'flex-end',
  },
  attendeeGender: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  attendeeAge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default SavedRoomsTab;