import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';

const RoomCard = (props) => {
  const { 
    room, 
    onPress, 
    onQRScan, 
    onEdit, 
    onDelete, 
    onSave, 
    userRole,
    // Session-related props from RoomsTab
    sessionInfo,
    currentSession,
    nextSession,
    formatTime,
    getSpeakerName,
    // Optional direct sessions and speakers (fallback)
    sessions,
    speakers
  } = props;
  
  const occupancyPercentage = Math.min(100, ((room.currentOccupancy || 0) / room.capacity) * 100);
  
  // Helper function to format time for display
  const getTimeDisplay = (dateString) => {
    if (!dateString) return '';
    if (formatTime) return formatTime(dateString);
    
    // Fallback formatting if formatTime isn't available
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to get speaker name
  const getSpeakerDisplayName = (speakerId) => {
    if (!speakerId) return 'No speaker assigned';
    if (getSpeakerName) return getSpeakerName(speakerId);
    
    // Fallback if getSpeakerName isn't available but we have speakers array
    if (speakers) {
      const speaker = speakers.find(s => s.id === speakerId);
      return speaker ? speaker.full_name : 'Unknown speaker';
    }
    
    return 'Speaker assigned';
  };

  // Get room sessions for fallback if currentSession/nextSession aren't provided
  const getRoomSessions = () => {
    if (!sessions || !room.id) return [];
    return sessions.filter(session => session.room_id === room.id)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  // Use provided session data or fallback to direct session lookup
  let displayCurrentSession = currentSession;
  let displayNextSession = nextSession;
  let roomSessions = room.roomSessions || [];

  // Fallback logic if session helpers weren't used
  if (!displayCurrentSession && !displayNextSession && sessions) {
    roomSessions = getRoomSessions();
    const now = new Date();
    
    displayCurrentSession = roomSessions.find(session => 
      new Date(session.start_time) <= now && 
      new Date(session.end_time) >= now
    );
    
    displayNextSession = roomSessions
      .filter(session => new Date(session.start_time) > now)[0];
  }

  // Determine if room has session activity
  const hasActiveSession = displayCurrentSession;
  const hasUpcomingSessions = roomSessions.length > 0 || sessionInfo?.hasUpcomingSessions;

  return (
    <TouchableOpacity 
      style={[
        styles.roomCard,
        room.status === 'warning' && styles.warningRoomCard,
        room.status === 'critical' && styles.criticalRoomCard,
        hasActiveSession && styles.activeSessionCard
      ]}
      onPress={onPress}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomTitleRow}>
          <Text style={styles.roomName} numberOfLines={2}>
            {room.room_name || room.name}
          </Text>
          {userRole === 'admin' && (
            <View style={styles.actionButtons}>
              {onSave && (
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>💾</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>{Icons.edit || '✏️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>{Icons.delete || '🗑️'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {room.location && <Text style={styles.roomLocation}>{room.location}</Text>}
      </View>

      {/* Session Information Section */}
      {(displayCurrentSession || displayNextSession || roomSessions.length > 0) && (
        <View style={styles.sessionInfo}>
          {displayCurrentSession && (
            <View style={styles.currentSession}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionStatusBadge}>🔴 LIVE</Text>
                <Text style={styles.sessionTime}>
                  {getTimeDisplay(displayCurrentSession.start_time)} - {getTimeDisplay(displayCurrentSession.end_time)}
                </Text>
              </View>
              <Text style={styles.sessionTitle} numberOfLines={2}>
                {displayCurrentSession.title}
              </Text>
              {displayCurrentSession.speaker_id && (
                <Text style={styles.sessionSpeaker}>
                  👤 {getSpeakerDisplayName(displayCurrentSession.speaker_id)}
                </Text>
              )}
            </View>
          )}
          
          {!displayCurrentSession && displayNextSession && (
            <View style={styles.nextSession}>
              <View style={styles.sessionHeader}>
                <Text style={styles.nextSessionBadge}>📅 NEXT</Text>
                <Text style={styles.sessionTime}>
                  {getTimeDisplay(displayNextSession.start_time)}
                </Text>
              </View>
              <Text style={styles.sessionTitle} numberOfLines={2}>
                {displayNextSession.title}
              </Text>
              {displayNextSession.speaker_id && (
                <Text style={styles.sessionSpeaker}>
                  👤 {getSpeakerDisplayName(displayNextSession.speaker_id)}
                </Text>
              )}
            </View>
          )}

          {!displayCurrentSession && !displayNextSession && roomSessions.length > 0 && (
            <View style={styles.scheduledSession}>
              <View style={styles.sessionHeader}>
                <Text style={styles.scheduledSessionBadge}>📅 SCHEDULED</Text>
                <Text style={styles.sessionTime}>
                  {getTimeDisplay(roomSessions[0].start_time)}
                </Text>
              </View>
              <Text style={styles.sessionTitle} numberOfLines={2}>
                {roomSessions[0].title}
              </Text>
              {roomSessions[0].speaker_id && (
                <Text style={styles.sessionSpeaker}>
                  👤 {getSpeakerDisplayName(roomSessions[0].speaker_id)}
                </Text>
              )}
            </View>
          )}

          {roomSessions.length > 1 && (
            <Text style={styles.sessionCount}>
              +{roomSessions.length - 1} more session{roomSessions.length - 1 !== 1 ? 's' : ''}
            </Text>
          )}

          {/* Show total session count from sessionInfo if available */}
          {sessionInfo?.totalSessions > 1 && roomSessions.length <= 1 && (
            <Text style={styles.sessionCount}>
              +{sessionInfo.totalSessions - 1} more session{sessionInfo.totalSessions - 1 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      {/* Empty state for rooms without sessions */}
      {!displayCurrentSession && !displayNextSession && roomSessions.length === 0 && (
        <View style={styles.noSessionInfo}>
          <Text style={styles.noSessionText}>📅 No sessions scheduled</Text>
        </View>
      )}
      
      <View style={styles.roomCapacity}>
        <Text style={styles.capacityText}>
          {room.currentOccupancy || 0}/{room.capacity}
        </Text>
        <Text style={styles.capacityLabel}>Attendees</Text>
      </View>
      
      <View style={styles.roomProgress}>  
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${occupancyPercentage}%`,
              backgroundColor: room.status === 'critical' ? colors.error : 
                              room.status === 'warning' ? colors.warning : colors.success
            }
          ]}
        />
      </View>
      
      <View style={styles.roomFooter}>
        <Text style={[
          styles.roomStatus,
          { color: room.status === 'critical' ? colors.error : 
                   room.status === 'warning' ? colors.warning : colors.success }
        ]}>
          {room.status === 'critical' ? '● Critical' : 
           room.status === 'warning' ? '● Warning' : '● Normal'}
        </Text>
        <TouchableOpacity 
          style={[
            styles.qrButton,
            hasActiveSession && styles.qrButtonActive
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onQRScan();
          }}
        >
          <Text style={styles.qrButtonText}>
            {Icons.qr || '📱'} {hasActiveSession ? 'Join' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomCard: {
    width: '100%', // Changed from 48% to 100% since wrapper handles width
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 280, // Increased to accommodate session info
  },
  warningRoomCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.warning,
    shadowColor: colors.warning,
  },
  criticalRoomCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.error,
    shadowColor: colors.error,
  },
  activeSessionCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
    shadowColor: colors.primary,
    backgroundColor: '#faf9ff', // Slightly different background for active sessions
  },
  roomHeader: {
    marginBottom: 8,
    minHeight: 50,
  },
  roomTitleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
    position: 'relative',
  },
  roomName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    width: '100%',
    lineHeight: 18,
    marginTop: 25, // Move room name down to avoid buttons
    paddingRight: 10, // Add some padding to avoid overlap
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: 0,
    zIndex: 1, // Ensure buttons are above other content
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  iconButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 14,
    color: colors.background,
  },
  roomLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  
  // Session Information Styles
  sessionInfo: {
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentSession: {
    marginBottom: 4,
  },
  nextSession: {
    marginBottom: 4,
  },
  scheduledSession: {
    marginBottom: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionStatusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nextSessionBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scheduledSessionBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.accent,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sessionTime: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 14,
    marginBottom: 2,
  },
  sessionSpeaker: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sessionCount: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noSessionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  noSessionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  roomCapacity: {
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    backgroundColor: colors.lightPink,
    borderRadius: 8,
  },
  capacityText: {
    fontSize: 22, // Slightly smaller to fit more content
    fontWeight: 'bold',
    color: colors.primary,
  },
  capacityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roomProgress: {
    height: 6, // Slightly smaller
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  roomStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  qrButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrButtonActive: {
    backgroundColor: colors.primary,
  },
  qrButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default RoomCard;