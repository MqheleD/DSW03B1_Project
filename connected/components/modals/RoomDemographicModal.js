import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../constants/theme';
import DonutChart from '../charts/DonutChart';

const RoomDemographicsModal = ({ 
  visible, 
  room, 
  attendees, 
  sessions = [], // Added sessions prop
  speakers = [], // Added speakers prop
  onClose 
}) => {
  if (!room) return null;
  
  // Calculate demographics for the selected room
  // Use current_room_id for current attendees in the room (live data)
  const currentRoomAttendees = attendees.filter(a => a.current_room_id === room.id);
  
  // Use analytics_room_id for analytics data (preserved data)
  const analyticsRoomAttendees = attendees.filter(a => a.analytics_room_id === room.id);
  
  // Use current attendees for the display (since we want to see who's actually there now)
  const roomAttendees = currentRoomAttendees;
  
  // Session information for this room
  const roomSessions = sessions.filter(session => session.room_id === room.id);
  const now = new Date();
  
  const currentSession = roomSessions.find(session => 
    new Date(session.start_time) <= now && 
    new Date(session.end_time) >= now
  );
  
  const nextSession = roomSessions
    .filter(session => new Date(session.start_time) > now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to get speaker name
  const getSpeakerName = (speakerId) => {
    if (!speakerId) return 'No speaker assigned';
    const speaker = speakers.find(s => s.id === speakerId);
    return speaker ? speaker.full_name : 'Unknown speaker';
  };
  
  const maleCount = roomAttendees.filter(a => a.gender?.toLowerCase() === 'male').length;
  const femaleCount = roomAttendees.filter(a => a.gender?.toLowerCase() === 'female').length;
  const nonBinaryCount = roomAttendees.filter(a => a.gender?.toLowerCase() === 'non-binary').length;
  const preferNotToSayCount = roomAttendees.filter(a => 
    a.gender?.toLowerCase() === 'prefer not to say' || !a.gender
  ).length;
  
  const ageGroups = {
    '18-24': roomAttendees.filter(a => {
      const age = parseInt(a.age);
      return age >= 18 && age <= 24;
    }).length,
    '25-34': roomAttendees.filter(a => {
      const age = parseInt(a.age);
      return age >= 25 && age <= 34;
    }).length,
    '35-44': roomAttendees.filter(a => {
      const age = parseInt(a.age);
      return age >= 35 && age <= 44;
    }).length,
    '45+': roomAttendees.filter(a => {
      const age = parseInt(a.age);
      return age >= 45;
    }).length,
  };

  const genderData = [
    { label: 'Male', value: maleCount, color: colors.accent },
    { label: 'Female', value: femaleCount, color: colors.primary },
    { label: 'Non-Binary', value: nonBinaryCount, color: colors.warning },
    { label: 'Prefer not to say', value: preferNotToSayCount, color: colors.textSecondary },
  ].filter(item => item.value > 0);

  const ageData = Object.entries(ageGroups).map(([label, value], index) => ({
    label,
    value,
    color: colors.chartColors[index % colors.chartColors.length]
  })).filter(item => item.value > 0);

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
            <Text style={styles.modalTitle}>
              {room.room_name || room.name} - Room Details
            </Text>
            
            {/* Session Information */}
            {(currentSession || nextSession || roomSessions.length > 0) && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionInfoTitle}>📅 Session Information</Text>
                
                {currentSession && (
                  <View style={styles.currentSessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionStatusBadge}>🔴 LIVE NOW</Text>
                      <Text style={styles.sessionTime}>
                        {formatTime(currentSession.start_time)} - {formatTime(currentSession.end_time)}
                      </Text>
                    </View>
                    <Text style={styles.sessionTitle}>{currentSession.title}</Text>
                    <Text style={styles.sessionSpeaker}>
                      👤 {getSpeakerName(currentSession.speaker_id)}
                    </Text>
                    {currentSession.description && (
                      <Text style={styles.sessionDescription}>{currentSession.description}</Text>
                    )}
                  </View>
                )}
                
                {!currentSession && nextSession && (
                  <View style={styles.nextSessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.nextSessionBadge}>📅 UP NEXT</Text>
                      <Text style={styles.sessionTime}>
                        {formatTime(nextSession.start_time)}
                      </Text>
                    </View>
                    <Text style={styles.sessionTitle}>{nextSession.title}</Text>
                    <Text style={styles.sessionSpeaker}>
                      👤 {getSpeakerName(nextSession.speaker_id)}
                    </Text>
                  </View>
                )}

                {roomSessions.length > 1 && (
                  <Text style={styles.sessionCount}>
                    Total: {roomSessions.length} session{roomSessions.length !== 1 ? 's' : ''} scheduled for this room
                  </Text>
                )}
              </View>
            )}
            
            {/* Room Statistics */}
            <View style={styles.roomStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{roomAttendees.length}</Text>
                <Text style={styles.statLabel}>Currently Here</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{room.capacity}</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {room.capacity > 0 ? Math.round((roomAttendees.length / room.capacity) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>Full</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{analyticsRoomAttendees.length}</Text>
                <Text style={styles.statLabel}>Total Registered</Text>
              </View>
            </View>
            
            {roomAttendees.length > 0 ? (
              <>
                {/* Attendee List */}
                <Text style={styles.chartTitle}>
                  Current Attendees ({roomAttendees.length})
                  {currentSession && <Text style={styles.liveSessionIndicator}> - Attending: {currentSession.title}</Text>}
                </Text>
                <View style={styles.attendeeList}>
                  {roomAttendees.map(attendee => (
                    <View key={attendee.id} style={styles.attendeeItem}>
                      <View style={styles.attendeeInfo}>
                        <Text style={styles.attendeeName}>{attendee.full_name}</Text>
                        <Text style={styles.attendeeEmail}>{attendee.email}</Text>
                        {attendee.organization && (
                          <Text style={styles.attendeeOrg}>{attendee.organization}</Text>
                        )}
                        {attendee.check_in_time && (
                          <Text style={styles.attendeeCheckIn}>
                            Checked in: {new Date(attendee.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                      </View>
                      <View style={styles.attendeeMeta}>
                        {attendee.gender && (
                          <Text style={styles.attendeeGender}>{attendee.gender}</Text>
                        )}
                        {attendee.age && (
                          <Text style={styles.attendeeAge}>{attendee.age} years</Text>
                        )}
                        {attendee.scan_count && (
                          <Text style={styles.attendeeScanCount}>
                            {attendee.scan_count} scan{attendee.scan_count !== 1 ? 's' : ''}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Gender Distribution */}
                {genderData.length > 0 && (
                  <>
                    <Text style={styles.chartTitle}>Gender Distribution</Text>
                    <View style={styles.chartRow}>
                      <DonutChart 
                        data={genderData} 
                        size={140} 
                        totalLabel="People"
                      />
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
                  </>
                )}
                
                {/* Age Distribution */}
                {ageData.length > 0 && (
                  <>
                    <Text style={styles.chartTitle}>Age Distribution</Text>
                    <View style={styles.chartRow}>
                      <DonutChart 
                        data={ageData} 
                        size={140} 
                        totalLabel="People"
                      />
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
                  </>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No attendees currently in this room</Text>
                <Text style={styles.emptyStateSubtext}>
                  {analyticsRoomAttendees.length > 0 
                    ? `${analyticsRoomAttendees.length} attendees are registered to this room but have moved elsewhere`
                    : 'No attendees have checked into this room yet'
                  }
                </Text>
                {currentSession && (
                  <Text style={styles.emptySessionNote}>
                    Session "{currentSession.title}" is currently running in this room
                  </Text>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  sessionInfo: {
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  currentSessionCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  nextSessionCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionStatusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  nextSessionBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sessionTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sessionSpeaker: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sessionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  liveSessionIndicator: {
    fontSize: 14,
    color: colors.error,
    fontWeight: 'normal',
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  attendeeList: {
    marginBottom: 20,
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
    marginBottom: 2,
  },
  attendeeCheckIn: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
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
    marginBottom: 2,
  },
  attendeeScanCount: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptySessionNote: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RoomDemographicsModal;