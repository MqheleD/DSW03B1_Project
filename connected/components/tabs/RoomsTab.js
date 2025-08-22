import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';
import RoomCard from '../cards/RoomCard';
import AddRoomModal from '../modals/AddRoomModal';
import EditRoomModal from '../modals/EditRoomModal';
import RoomDemographicsModal from '../modals/RoomDemographicModal';
import QRScanModal from '../modals/QRScanModal';
import SaveRoomModal from '../modals/SaveRoomModal';
import supabase from '../../supabaseClient';

const RoomsTab = ({ 
  rooms, 
  setRooms, 
  fetchRooms, 
  userRole, 
  attendees, 
  fetchAttendees,
  // New session-related props
  sessions = [],
  speakers = [],
  getCurrentSession,
  getNextSession,
  getSessionsForRoom
}) => {
  const [loading, setLoading] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showRoomDemographicsModal, setShowRoomDemographicsModal] = useState(false);
  const [showQRScanModal, setShowQRScanModal] = useState(false);
  const [showSaveRoomModal, setShowSaveRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomForScan, setSelectedRoomForScan] = useState(null);
  const [selectedRoomForSave, setSelectedRoomForSave] = useState(null);

  // Helper function to format time for display
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

  // Enhanced room data with session information
  const enhancedRooms = React.useMemo(() => {
    return rooms.map(room => {
      const currentSession = getCurrentSession ? getCurrentSession(room.id) : null;
      const nextSession = getNextSession ? getNextSession(room.id) : null;
      const roomSessions = getSessionsForRoom ? getSessionsForRoom(room.id) : [];
      
      return {
        ...room,
        currentSession,
        nextSession,
        roomSessions,
        sessionInfo: {
          hasCurrentSession: !!currentSession,
          hasUpcomingSessions: roomSessions.length > 0,
          totalSessions: roomSessions.length,
          currentSessionTitle: currentSession?.title || null,
          nextSessionTitle: nextSession?.title || null,
          nextSessionTime: nextSession?.start_time || null
        }
      };
    });
  }, [rooms, sessions, getCurrentSession, getNextSession, getSessionsForRoom]);

  const debugRoomData = () => {
    console.log('=== ROOMS DEBUG ===');
    console.log('Total rooms:', rooms.length);
    console.log('Total sessions:', sessions.length);
    
    enhancedRooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.room_name}:`);
      console.log(`  - ID: ${room.id}`);
      console.log(`  - Current Occupancy: ${room.currentOccupancy}`);
      console.log(`  - Analytics Occupancy: ${room.analyticsOccupancy}`);
      console.log(`  - Capacity: ${room.capacity}`);
      console.log(`  - Status: ${room.status}`);
      console.log(`  - Current Session: ${room.currentSession?.title || 'None'}`);
      console.log(`  - Next Session: ${room.nextSession?.title || 'None'}`);
      console.log(`  - Total Sessions: ${room.roomSessions.length}`);
    });
    console.log('==================');
    
    // Also debug attendees
    console.log('=== ATTENDEES DEBUG ===');
    console.log('Total attendees:', attendees.length);
    attendees.forEach((attendee, index) => {
      console.log(`${index + 1}. ${attendee.full_name}:`);
      console.log(`  - Current Room ID: ${attendee.current_room_id}`);
      console.log(`  - Analytics Room ID: ${attendee.analytics_room_id}`);
      console.log(`  - Is Checked In: ${attendee.is_checked_in}`);
      console.log(`  - Email: ${attendee.email}`);
    });
    console.log('========================');

    // Debug sessions
    console.log('=== SESSIONS DEBUG ===');
    console.log('Total sessions:', sessions.length);
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.title}:`);
      console.log(`  - Room ID: ${session.room_id}`);
      console.log(`  - Start: ${session.start_time}`);
      console.log(`  - End: ${session.end_time}`);
      console.log(`  - Speaker: ${getSpeakerName(session.speaker_id)}`);
    });
    console.log('========================');
  };

  const handleAddRoom = async (newRoom) => {
    if (!newRoom.name || !newRoom.capacity || isNaN(newRoom.capacity)) {
      Alert.alert('Error', 'Please enter valid room details');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          { 
            room_name: newRoom.name,
            capacity: parseInt(newRoom.capacity),
            location: newRoom.location || '',
            speaker_id: newRoom.speaker || null,
            current_occupancy: 0,
            occupancy: 0
          }
        ])
        .select();

      if (error) throw error;

      await fetchRooms();
      setShowAddRoomModal(false);
      Alert.alert('Success', 'New room added successfully');
    } catch (error) {
      console.error('Error adding room:', error);
      Alert.alert('Error', 'Failed to add new room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async (updatedRoom) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('rooms')
        .update({
          room_name: updatedRoom.name,
          capacity: parseInt(updatedRoom.capacity),
          location: updatedRoom.location || '',
          speaker_id: updatedRoom.speaker || null
        })
        .eq('id', updatedRoom.id);

      if (error) throw error;

      await fetchRooms();
      setShowEditRoomModal(false);
      Alert.alert('Success', 'Room updated successfully');
    } catch (error) {
      console.error('Error updating room:', error);
      Alert.alert('Error', 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    // Check if room has active sessions
    const roomSessions = getSessionsForRoom ? getSessionsForRoom(roomId) : [];
    const now = new Date();
    const futureSessions = roomSessions.filter(session => new Date(session.start_time) > now);
    
    if (futureSessions.length > 0) {
      Alert.alert(
        'Cannot Delete Room',
        `This room has ${futureSessions.length} upcoming session(s). Please delete or reschedule the sessions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this room? This will also remove all associated sessions and alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // First, delete all sessions associated with this room
              const { error: deleteSessionsError } = await supabase
                .from('sessions')
                .delete()
                .eq('room_id', roomId);

              if (deleteSessionsError) {
                console.error('Error deleting sessions:', deleteSessionsError);
                // Don't throw here, continue with other deletions
              }
              
              // Delete all alerts associated with this room
              const { error: deleteAlertsError } = await supabase
                .from('alerts')
                .delete()
                .eq('room_id', roomId);

              if (deleteAlertsError) {
                console.error('Error deleting alerts:', deleteAlertsError);
                // Don't throw here, continue with room deletion
              }

              // Clear attendees from this room
              const { error: clearAttendeesError } = await supabase
                .from('attendees')
                .update({ 
                  current_room_id: null,
                  analytics_room_id: null 
                })
                .eq('current_room_id', roomId);

              if (clearAttendeesError) {
                console.error('Error clearing attendees:', clearAttendeesError);
              }

              // Finally, delete the room
              const { error: deleteRoomError } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId);

              if (deleteRoomError) throw deleteRoomError;

              await fetchRooms();
              Alert.alert('Success', 'Room, sessions, and associated data deleted successfully');
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', 'Failed to delete room. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRoomPress = (room) => {
    setSelectedRoom(room);
    setShowRoomDemographicsModal(true);
  };

  const handleQRScan = (room) => {
    setSelectedRoomForScan(room);
    setShowQRScanModal(true);
  };

  const handleEditPress = (room) => {
    setSelectedRoom(room);
    setShowEditRoomModal(true);
  };

  const handleSaveRoom = (room) => {
    // Check if room has active sessions
    const roomSessions = getSessionsForRoom ? getSessionsForRoom(room.id) : [];
    const now = new Date();
    const futureSessions = roomSessions.filter(session => new Date(session.start_time) > now);
    
    if (futureSessions.length > 0) {
      Alert.alert(
        'Room Has Active Sessions',
        `This room has ${futureSessions.length} upcoming session(s). Saving will archive the room and its sessions. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Save Anyway', 
            style: 'destructive',
            onPress: () => {
              setSelectedRoomForSave(room);
              setShowSaveRoomModal(true);
            }
          }
        ]
      );
      return;
    }
    
    setSelectedRoomForSave(room);
    setShowSaveRoomModal(true);
  };

  const handleSaveRoomComplete = async () => {
    if (!selectedRoomForSave) {
      setShowSaveRoomModal(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, remove the room from local state immediately for better UX
      const roomToArchive = selectedRoomForSave;
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomToArchive.id));
      
      // Mark the room as archived instead of deleting it
      const { error: archiveRoomError } = await supabase
        .from('rooms')
        .update({ 
          is_archived: true,
          current_occupancy: 0 // Set to 0 since it's no longer active
        })
        .eq('id', roomToArchive.id);

      if (archiveRoomError) {
        // If archiving fails, add the room back to local state
        setRooms(prevRooms => [...prevRooms, roomToArchive]);
        throw archiveRoomError;
      }

      // Archive sessions for this room instead of deleting them
      const { error: archiveSessionsError } = await supabase
        .from('sessions')
        .update({ is_archived: true })
        .eq('room_id', roomToArchive.id);

      if (archiveSessionsError) {
        console.error('Error archiving sessions:', archiveSessionsError);
        // Don't throw here, continue with other operations
      }

      // Deactivate any alerts for this room (don't delete them, just deactivate)
      const { error: deactivateAlertsError } = await supabase
        .from('alerts')
        .update({ IsActive: false })
        .eq('room_id', roomToArchive.id);

      if (deactivateAlertsError) {
        console.error('Error deactivating alerts:', deactivateAlertsError);
        // Don't throw here, continue with success
      }

      // Refresh all data to ensure analytics are updated
      await Promise.all([
        fetchRooms(),
        fetchAttendees()
      ]);
      
      Alert.alert(
        'Room Archived Successfully!', 
        `"${roomToArchive.room_name}" has been saved and archived. It's no longer active but all data is preserved. Check the Saved tab to view the archived data.`
      );
      
    } catch (error) {
      console.error('Error archiving room after save:', error);
      Alert.alert('Error', 'Failed to archive room. Please try again.');
    } finally {
      setLoading(false);
      setShowSaveRoomModal(false);
      setSelectedRoomForSave(null);
    }
  };

  const processAttendeeQRCode = async (qrData, roomId) => {
    try {
      setLoading(true);
      
      // Parse the QR data
      let attendeeData;
      try {
        attendeeData = JSON.parse(qrData);
      } catch (e) {
        // If not JSON, create basic structure
        attendeeData = {
          qr_code: `QR_${Date.now()}`,
          full_name: qrData.substring(0, 50),
          email: `guest_${Date.now()}@event.com`,
          age: 25,
          gender: 'Prefer not to say'
        };
      }
      
      // Validate and sanitize gender input
      const allowedGenders = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
      const sanitizedGender = allowedGenders.includes(attendeeData.gender) 
        ? attendeeData.gender 
        : 'Prefer not to say';
      
      // Check if attendee already exists by QR code or email
      const { data: existingAttendee, error: checkError } = await supabase
        .from('attendees')
        .select('*')
        .or(`qr_code.eq.${attendeeData.qr_code},email.eq.${attendeeData.email}`)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingAttendee) {
        // Update existing attendee's current room
        const updateData = {
          current_room_id: roomId,
          last_scan_time: new Date().toISOString(),
          scan_count: (existingAttendee.scan_count || 0) + 1,
          is_checked_in: true
        };

        // Only set analytics_room_id if it's not already set
        if (!existingAttendee.analytics_room_id) {
          updateData.analytics_room_id = roomId;
        }

        const { error: updateError } = await supabase
          .from('attendees')
          .update(updateData)
          .eq('id', existingAttendee.id);
          
        if (updateError) throw updateError;
        
        // Log the room change
        await supabase
          .from('attendance_log')
          .insert([{
            attendee_id: existingAttendee.id,
            room_id: roomId,
            action: existingAttendee.analytics_room_id ? 'room_change' : 'check_in',
            timestamp: new Date().toISOString()
          }]);
        
        const actionMessage = existingAttendee.analytics_room_id 
          ? `${existingAttendee.full_name} has moved to ${selectedRoomForScan?.room_name}`
          : `${existingAttendee.full_name} has been checked into ${selectedRoomForScan?.room_name}`;
        
        // Check if there's a current session and include it in the message
        const currentSession = getCurrentSession ? getCurrentSession(roomId) : null;
        const sessionInfo = currentSession ? `\n\nCurrent session: ${currentSession.title}` : '';
        
        Alert.alert('Attendee Updated', actionMessage + sessionInfo, [{ text: 'OK' }]);
      } else {
        // Add new attendee
        const { data: newAttendee, error: insertError } = await supabase
          .from('attendees')
          .insert([{
            full_name: attendeeData.full_name || attendeeData.name || 'Unknown Guest',
            email: attendeeData.email || `guest_${Date.now()}@event.com`,
            age: attendeeData.age || null,
            gender: sanitizedGender,
            occupation: attendeeData.occupation || null,
            organization: attendeeData.organization || null,
            country: attendeeData.country || null,
            city: attendeeData.city || null,
            phone: attendeeData.phone || null,
            ticket_type: attendeeData.ticket_type || 'general',
            current_room_id: roomId,
            analytics_room_id: roomId,
            qr_code: attendeeData.qr_code || `QR_${Date.now()}`,
            check_in_time: new Date().toISOString(),
            last_scan_time: new Date().toISOString(),
            scan_count: 1,
            is_checked_in: true
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        // Log the initial check-in
        await supabase
          .from('attendance_log')
          .insert([{
            attendee_id: newAttendee.id,
            room_id: roomId,
            action: 'check_in'
          }]);
        
        // Check if there's a current session and include it in the message
        const currentSession = getCurrentSession ? getCurrentSession(roomId) : null;
        const sessionInfo = currentSession ? `\n\nCurrent session: ${currentSession.title}` : '';
        
        Alert.alert(
          'Check-in Successful',
          `${newAttendee.full_name} has been checked into ${selectedRoomForScan?.room_name}${sessionInfo}`,
          [{ text: 'OK' }]
        );
      }
      
      // Refresh data
      await fetchRooms();
      await fetchAttendees();
      
      setShowQRScanModal(false);
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error', 
        `Failed to process attendee: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={enhancedRooms}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View>
            {/* Debug Button - Remove in production */}
            {userRole === 'admin' && (
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={debugRoomData}
              >
                <Text style={styles.debugButtonText}>🔍 Debug Room & Session Data</Text>
              </TouchableOpacity>
            )}
            
            {/* Sessions Summary */}
            {sessions.length > 0 && (
              <View style={styles.sessionsSummary}>
                <Text style={styles.sessionsSummaryTitle}>📅 Sessions Overview</Text>
                <Text style={styles.sessionsSummaryText}>
                  {sessions.length} total session{sessions.length !== 1 ? 's' : ''} scheduled across {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                </Text>
                
                {/* Current sessions indicator */}
                {enhancedRooms.some(room => room.currentSession) && (
                  <View style={styles.currentSessionsIndicator}>
                    <Text style={styles.currentSessionsText}>
                      🔴 {enhancedRooms.filter(room => room.currentSession).length} session{enhancedRooms.filter(room => room.currentSession).length !== 1 ? 's' : ''} currently active
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        renderItem={({ item: room }) => (
          <View style={styles.roomCardWrapper}>
            <RoomCard
              room={room}
              onPress={() => handleRoomPress(room)}
              onQRScan={() => handleQRScan(room)}
              onEdit={() => handleEditPress(room)}
              onDelete={() => handleDeleteRoom(room.id)}
              onSave={() => handleSaveRoom(room)}
              userRole={userRole}
              // Pass session info as additional props
              sessionInfo={room.sessionInfo}
              currentSession={room.currentSession}
              nextSession={room.nextSession}
              formatTime={formatTime}
              getSpeakerName={getSpeakerName}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>No rooms available</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'admin' 
                ? 'Tap the + button to add your first room.' 
                : 'Rooms will appear here when they are created.'
              }
            </Text>
          </View>
        )}
      />

      {userRole === 'admin' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddRoomModal(true)}
        >
          <Text style={styles.addButtonText}>{Icons.plus || '+'}</Text>
        </TouchableOpacity>
      )}

      <AddRoomModal
        visible={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        onAdd={handleAddRoom}
        sessions={sessions}
        speakers={speakers}
        existingRooms={rooms}
      />

      <EditRoomModal
        visible={showEditRoomModal}
        room={selectedRoom}
        onClose={() => setShowEditRoomModal(false)}
        onSave={handleEditRoom}
      />

      <RoomDemographicsModal
        visible={showRoomDemographicsModal}
        room={selectedRoom}
        attendees={attendees}
        sessions={selectedRoom ? getSessionsForRoom(selectedRoom.id) : []}
        speakers={speakers}
        onClose={() => setShowRoomDemographicsModal(false)}
      />

      <QRScanModal
        visible={showQRScanModal}
        room={selectedRoomForScan}
        rooms={rooms}
        currentSession={selectedRoomForScan ? getCurrentSession(selectedRoomForScan.id) : null}
        onClose={() => setShowQRScanModal(false)}
        onScan={processAttendeeQRCode}
      />

      <SaveRoomModal
        visible={showSaveRoomModal}
        room={selectedRoomForSave}
        attendees={attendees}
        sessions={selectedRoomForSave ? getSessionsForRoom(selectedRoomForSave.id) : []}
        onClose={() => setShowSaveRoomModal(false)}
        onSave={handleSaveRoomComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flatListContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  roomCardWrapper: {
    width: '48%',
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
  debugButton: {
    backgroundColor: '#666',
    padding: 10,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionsSummary: {
    backgroundColor: colors.primary,
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionsSummaryTitle: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sessionsSummaryText: {
    color: colors.background,
    fontSize: 14,
    opacity: 0.9,
  },
  currentSessionsIndicator: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  currentSessionsText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default RoomsTab;