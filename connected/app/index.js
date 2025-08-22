import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import supabase from '../supabaseClient';
import { colors, Icons } from '../constants/theme';
import RoomsTab from '../components/tabs/RoomsTab';
import AnalyticsTab from '../components/tabs/AnalyticsTab';
import AlertsTab from '../components/tabs/AlertsTab';
import SettingsTab from '../components/tabs/SettingsTab';
import SavedRoomsTab from '../components/tabs/SavedRoomsTab';
import SessionsTab from '@/components/tabs/SessionsTab';

const EventDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [userRole, setUserRole] = useState('admin');
  const [rooms, setRooms] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]); // Added sessions state
  const [speakers, setSpeakers] = useState([]); // Added speakers state
  const [loading, setLoading] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
    
    // Set up real-time subscriptions
    const roomSubscription = supabase
      .channel('rooms-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, 
        () => fetchRooms()
      )
      .subscribe();

    const alertSubscription = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, 
        () => fetchAlerts()
      )
      .subscribe();

    const attendeeSubscription = supabase
      .channel('attendees-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees' }, 
        () => fetchAttendees()
      )
      .subscribe();

    // Add sessions subscription
    const sessionSubscription = supabase
      .channel('sessions-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, 
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(alertSubscription);
      supabase.removeChannel(attendeeSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRooms(),
      fetchAlerts(),
      fetchAttendees(),
      fetchSessions(),
      fetchSpeakers()
    ]);
    setLoading(false);
  };

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms...');
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .or('is_archived.is.null,is_archived.eq.false')
        .order('room_name', { ascending: true });

      if (error) throw error;
      
      const roomsWithOccupancy = await Promise.all(data.map(async (room) => {
        const { count: analyticsCount, error: analyticsError } = await supabase
          .from('attendees')
          .select('*', { count: 'exact', head: true })
          .eq('analytics_room_id', room.id)
          .eq('is_checked_in', true);
        
        if (analyticsError) {
          console.error('Error counting analytics attendees for room:', room.id, analyticsError);
        }
        
        const currentOccupancy = room.current_occupancy || 0;
        const analyticsOccupancy = analyticsCount || 0;
        
        return {
          ...room,
          currentOccupancy: currentOccupancy,
          analyticsOccupancy: analyticsOccupancy,
          status: currentOccupancy > room.capacity * 0.9 ? 'critical' : 
                 currentOccupancy > room.capacity * 0.7 ? 'warning' : 'normal'
        };
      }));

      setRooms(roomsWithOccupancy);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('IsActive', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedAlerts = data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.created_at)
      }));
      
      setAlerts(parsedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      
      setAttendees(data || []);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  // New function to fetch sessions
  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions...');
      const { data, error } = await supabase
        .from('sessions')
        .select('id, title, description, start_time, end_time, room_id, speaker_id, tags')
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      setSessions(data || []);
      console.log('Sessions fetched:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // New function to fetch speakers
  const fetchSpeakers = async () => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select('id, full_name, photo_url')
        .order('full_name', { ascending: true });

      if (error) throw error;
      
      setSpeakers(data || []);
    } catch (error) {
      console.error('Error fetching speakers:', error);
    }
  };

  // Create occupancy map for sessions
  const occupancyMap = React.useMemo(() => {
    const counts = {};
    attendees.forEach((attendee) => {
      if (attendee.current_room_id && attendee.is_checked_in) {
        counts[attendee.current_room_id] = (counts[attendee.current_room_id] || 0) + 1;
      }
    });
    return counts;
  }, [attendees]);

  // Callback function for when sessions change
  const handleSessionChange = async (action, sessionData) => {
    console.log('Session changed:', action, sessionData);
    
    // Refresh sessions data to ensure sync
    await fetchSessions();
    
    // Optionally refresh rooms if sessions affect room status
    // await fetchRooms();
  };

  // Helper functions for session data
  const getCurrentSession = (roomId) => {
    const now = new Date();
    return sessions.find(session => 
      session.room_id === roomId && 
      new Date(session.start_time) <= now && 
      new Date(session.end_time) >= now
    );
  };

  const getNextSession = (roomId) => {
    const now = new Date();
    return sessions
      .filter(session => 
        session.room_id === roomId && 
        new Date(session.start_time) > now
      )
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  };

  const getSessionsForRoom = (roomId) => {
    return sessions.filter(session => session.room_id === roomId)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
  const totalCurrentOccupancy = rooms.reduce((sum, room) => sum + (room.currentOccupancy || 0), 0);
  
  const activeRoomIds = rooms.map(room => room.id);
  const analyticsAttendees = attendees.filter(a => 
    a.analytics_room_id && 
    a.is_checked_in && 
    activeRoomIds.includes(a.analytics_room_id)
  );
  const totalAnalyticsOccupancy = analyticsAttendees.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avijozi Dashboard</Text>
          <Text style={styles.headerSubtitle}>Professional Event Management</Text>
        </View>
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Tab Navigation - Now Scrollable */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabScrollContent}
          >
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'rooms' && styles.activeTab]}
              onPress={() => setActiveTab('rooms')}
            >
              <Text style={[styles.tabIcon, activeTab === 'rooms' && styles.activeTabIcon]}>
                {Icons.room || '🏢'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'rooms' && styles.activeTabLabel]}>
                Rooms
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'sessions' && styles.activeTab]}
              onPress={() => setActiveTab('sessions')}
            >
              <Text style={[styles.tabIcon, activeTab === 'sessions' && styles.activeTabIcon]}>
                {Icons.calendar || '📅'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'sessions' && styles.activeTabLabel]}>
                Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'analytics' && styles.activeTab]}
              onPress={() => setActiveTab('analytics')}
            >
              <Text style={[styles.tabIcon, activeTab === 'analytics' && styles.activeTabIcon]}>
                {Icons.analytics || '📊'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.activeTabLabel]}>
                Analytics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
              onPress={() => setActiveTab('saved')}
            >
              <Text style={[styles.tabIcon, activeTab === 'saved' && styles.activeTabIcon]}>
                {Icons.save || '💾'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'saved' && styles.activeTabLabel]}>
                Saved
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'alerts' && styles.activeTab]}
              onPress={() => setActiveTab('alerts')}
            >
              <Text style={[styles.tabIcon, activeTab === 'alerts' && styles.activeTabIcon]}>
                {Icons.alert || '⚠️'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'alerts' && styles.activeTabLabel]}>
                Alerts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabIcon, activeTab === 'settings' && styles.activeTabIcon]}>
                {Icons.settings || '⚙️'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>
                Settings
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'rooms' && (
              <RoomsTab 
                rooms={rooms}
                setRooms={setRooms}
                fetchRooms={fetchRooms}
                userRole={userRole}
                attendees={attendees}
                fetchAttendees={fetchAttendees}
                // Pass session-related props
                sessions={sessions}
                speakers={speakers}
                getCurrentSession={getCurrentSession}
                getNextSession={getNextSession}
                getSessionsForRoom={getSessionsForRoom}
              />
            )}
            {activeTab === 'sessions' && (
              <SessionsTab 
                // Pass shared state and functions
                rooms={rooms}
                speakers={speakers}
                sessions={sessions}
                setSessions={setSessions}
                occupancyMap={occupancyMap}
                onSessionChange={handleSessionChange}
                fetchSessions={fetchSessions}
                userRole={userRole}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                rooms={rooms}
                attendees={attendees} // Pass all attendees, not just analyticsAttendees
                alerts={alerts}
                sessions={sessions}
                totalCapacity={totalCapacity}
                totalOccupancy={totalCurrentOccupancy} // Use current occupancy, not analytics
              />
            )}
            {activeTab === 'saved' && (
              <SavedRoomsTab 
                userRole={userRole}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertsTab 
                alerts={alerts}
                fetchAlerts={fetchAlerts}
                rooms={rooms}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab 
                userRole={userRole}
                setUserRole={setUserRole}
                rooms={rooms}
                attendees={attendees}
                alerts={alerts}
                sessions={sessions} // Pass sessions to settings
                totalCapacity={totalCapacity}
                totalOccupancy={totalCurrentOccupancy}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.text,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    color: colors.background,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: colors.background,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.lightPink,
  },
  tabScrollView: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 80,
  },
  tabScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: colors.lightPink,
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 24, // Increased from 18
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activeTabIcon: {
    color: colors.primary,
    fontSize: 26, // Slightly larger for active state
  },
  tabLabel: {
    fontSize: 12, // Increased from 9
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13, // Slightly larger for active state
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default EventDashboard;