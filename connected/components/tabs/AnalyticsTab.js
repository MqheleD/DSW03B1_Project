import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';
import DonutChart from '../charts/DonutChart';
import ScrollableBarChart from '../charts/ScrollableBarChart';

const AnalyticsTab = ({ 
  rooms, 
  attendees, 
  alerts, 
  sessions = [], // Added sessions prop
  totalCapacity, 
  totalOccupancy 
}) => {
  const [analyticsView, setAnalyticsView] = useState('overview');
  const [stats, setStats] = useState({
    totalAttendees: 0,
    maleCount: 0,
    femaleCount: 0,
    avgAge: 0,
    ageGroups: {},
  });

  useEffect(() => {
    calculateStats();
  }, [attendees]);

  const calculateStats = () => {
    // Filter for attendees who are checked in AND currently in a room
    const activeAttendees = attendees.filter(a => a.is_checked_in === true && a.current_room_id !== null);
    const totalAttendees = activeAttendees.length;
    
    const maleCount = activeAttendees.filter(a => a.gender?.toLowerCase() === 'male').length;
    const femaleCount = activeAttendees.filter(a => a.gender?.toLowerCase() === 'female').length;

    // Calculate age data from active attendees (in rooms)
    let avgAge = 0;
    let ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0,
    };

    if (activeAttendees.length > 0) {
      const validAges = activeAttendees.filter(a => a.age && a.age > 0);
      if (validAges.length > 0) {
        const totalAge = validAges.reduce((sum, a) => sum + parseInt(a.age), 0);
        avgAge = totalAge / validAges.length;
      }

      ageGroups = {
        '18-24': activeAttendees.filter(a => parseInt(a.age) >= 18 && parseInt(a.age) <= 24).length,
        '25-34': activeAttendees.filter(a => parseInt(a.age) >= 25 && parseInt(a.age) <= 34).length,
        '35-44': activeAttendees.filter(a => parseInt(a.age) >= 35 && parseInt(a.age) <= 44).length,
        '45+': activeAttendees.filter(a => parseInt(a.age) >= 45).length,
      };
    }

    setStats({
      totalAttendees,
      maleCount,
      femaleCount,
      avgAge,
      ageGroups,
    });
  };

  // Session analytics calculations
  const sessionStats = React.useMemo(() => {
    const now = new Date();
    const activeSessions = sessions.filter(session => 
      new Date(session.start_time) <= now && 
      new Date(session.end_time) >= now
    );
    
    const upcomingSessions = sessions.filter(session => 
      new Date(session.start_time) > now
    );

    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    });

    const roomsWithSessions = new Set(sessions.map(s => s.room_id)).size;

    return {
      total: sessions.length,
      active: activeSessions.length,
      upcoming: upcomingSessions.length,
      today: todaySessions.length,
      roomsWithSessions
    };
  }, [sessions]);

  // Chart data
  const genderChartData = [
    { label: 'Male', value: stats.maleCount, color: colors.accent },
    { label: 'Female', value: stats.femaleCount, color: colors.primary },
  ];

  const ageChartData = Object.entries(stats.ageGroups).map(([label, value], index) => ({
    label,
    value,
    color: colors.chartColors[index % colors.chartColors.length]
  }));

  const roomOccupancyData = rooms.map(room => {
    // Find sessions for this room to match them properly
    const roomSessions = sessions.filter(session => session.room_id === room.id);
    const hasActiveSession = roomSessions.some(session => {
      const now = new Date();
      return new Date(session.start_time) <= now && 
             new Date(session.end_time) >= now;
    });

    return {
      label: room.room_name?.length > 10 ? room.room_name.substring(0, 10) + '...' : room.room_name,
      value: Math.round((room.currentOccupancy / room.capacity) * 100),
      occupancy: room.currentOccupancy,
      capacity: room.capacity,
      hasSession: hasActiveSession,
      sessionCount: roomSessions.length,
      roomId: room.id // Add room ID for debugging
    };
  });

  const eventCapacityData = [
    { label: 'Occupied', value: totalOccupancy, color: colors.primary },
    { label: 'Available', value: Math.max(0, totalCapacity - totalOccupancy), color: colors.lightPink },
  ];

  const topRoomsData = rooms
    .map(room => {
      const roomSessions = sessions.filter(session => session.room_id === room.id);
      const hasActiveSession = roomSessions.some(session => {
        const now = new Date();
        return new Date(session.start_time) <= now && 
               new Date(session.end_time) >= now;
      });

      return {
        name: room.room_name,
        occupancy: room.currentOccupancy,
        capacity: room.capacity,
        percentage: Math.round((room.currentOccupancy / room.capacity) * 100),
        hasActiveSession: hasActiveSession,
        sessionCount: roomSessions.length
      };
    })
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5);

  // Session distribution by room - only include sessions with valid room IDs
  const sessionDistributionData = React.useMemo(() => {
    const roomSessionCounts = {};
    
    // Only count sessions that have a valid room_id and match existing rooms
    const validSessions = sessions.filter(session => 
      session.room_id && rooms.some(room => room.id === session.room_id)
    );
    
    validSessions.forEach(session => {
      const room = rooms.find(r => r.id === session.room_id);
      if (room) {
        const roomName = room.room_name;
        roomSessionCounts[roomName] = (roomSessionCounts[roomName] || 0) + 1;
      }
    });

    return Object.entries(roomSessionCounts).map(([roomName, count], index) => ({
      label: roomName.length > 10 ? roomName.substring(0, 10) + '...' : roomName,
      value: count,
      color: colors.chartColors[index % colors.chartColors.length]
    }));
  }, [sessions, rooms]);

  // Debug function to check room data
  const debugRoomsData = () => {
    console.log('=== ANALYTICS DEBUG INFO ===');
    console.log('Total rooms:', rooms.length);
    console.log('Total attendees (all):', attendees.length);
    
    const checkedIn = attendees.filter(a => a.is_checked_in === true);
    const inRooms = attendees.filter(a => a.is_checked_in === true && a.current_room_id !== null);
    
    console.log('Total attendees (checked-in):', checkedIn.length);
    console.log('Total attendees (in rooms):', inRooms.length);
    
    console.log('Checked-in attendees:');
    checkedIn.forEach(a => {
      console.log(`  - ${a.full_name}: Room ${a.current_room_id || 'none'}`);
    });
    
    console.log('Total sessions:', sessions.length);
    console.log('Session stats:', sessionStats);
    
    console.log('Room-Session Analysis:');
    rooms.forEach((room, index) => {
      const roomSessions = sessions.filter(s => s.room_id === room.id);
      const roomAttendees = inRooms.filter(a => a.current_room_id === room.id);
      console.log(`${index + 1}. ${room.room_name}:`);
      console.log(`   - Room ID: ${room.id}`);
      console.log(`   - Occupancy: ${room.currentOccupancy}/${room.capacity} (${Math.round((room.currentOccupancy / room.capacity) * 100)}%)`);
      console.log(`   - Sessions: ${roomSessions.length}`);
      console.log(`   - Attendees in room: ${roomAttendees.length}`);
      if (roomSessions.length > 0) {
        roomSessions.forEach((session, idx) => {
          console.log(`     Session ${idx + 1}: ${session.title} (${session.room_id})`);
        });
      }
    });
    
    console.log('Sessions without valid rooms:');
    const orphanSessions = sessions.filter(s => !s.room_id || !rooms.some(r => r.id === s.room_id));
    orphanSessions.forEach(session => {
      console.log(`  - ${session.title}: Room ID ${session.room_id || 'null'}`);
    });
    
    console.log('Total occupancy:', totalOccupancy);
    console.log('Total capacity:', totalCapacity);
    console.log('Calculated stats:', stats);
    console.log('============================');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Analytics Navigation */}
        <View style={styles.analyticsNav}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.analyticsNavItem, analyticsView === 'overview' && styles.activeAnalyticsNav]}
              onPress={() => setAnalyticsView('overview')}
            >
              <Text style={styles.analyticsNavIcon}>{Icons.chart}</Text>
              <Text style={[styles.analyticsNavText, analyticsView === 'overview' && styles.activeAnalyticsNavText]}>
                Overview
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.analyticsNavItem, analyticsView === 'demographics' && styles.activeAnalyticsNav]}
              onPress={() => setAnalyticsView('demographics')}
            >
              <Text style={styles.analyticsNavIcon}>{Icons.users}</Text>
              <Text style={[styles.analyticsNavText, analyticsView === 'demographics' && styles.activeAnalyticsNavText]}>
                Demographics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.analyticsNavItem, analyticsView === 'rooms' && styles.activeAnalyticsNav]}
              onPress={() => setAnalyticsView('rooms')}
            >
              <Text style={styles.analyticsNavIcon}>{Icons.room}</Text>
              <Text style={[styles.analyticsNavText, analyticsView === 'rooms' && styles.activeAnalyticsNavText]}>
                Rooms
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Debug Button - Remove in production */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={debugRoomsData}
        >
          <Text style={styles.debugButtonText}>🔍 Debug Analytics</Text>
        </TouchableOpacity>

        {analyticsView === 'overview' && (
          <>
            {/* Summary Cards - Removed Session Cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.modernSummaryCard, styles.gradientCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.users}</Text>
                  <Text style={styles.cardTrend}>{Icons.trend}</Text>
                </View>
                <Text style={styles.cardNumber}>{stats.totalAttendees}</Text>
                <Text style={styles.cardLabel}>Active Attendees</Text>
                <Text style={styles.cardSubtext}>Currently in rooms</Text>
              </View>
              
              <View style={[styles.modernSummaryCard, styles.warningCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.fire}</Text>
                  <Text style={styles.cardTrend}>{Icons.trend}</Text>
                </View>
                <Text style={styles.cardNumber}>
                  {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%
                </Text>
                <Text style={styles.cardLabel}>Capacity Used</Text>
                <Text style={styles.cardSubtext}>Real-time</Text>
              </View>
              
              <View style={[styles.modernSummaryCard, styles.successCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.room}</Text>
                  <Text style={styles.cardTrend}>{Icons.star}</Text>
                </View>
                <Text style={styles.cardNumber}>{rooms.length}</Text>
                <Text style={styles.cardLabel}>Active Rooms</Text>
                <Text style={styles.cardSubtext}>All operational</Text>
              </View>
              
              <View style={[styles.modernSummaryCard, styles.errorCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.alert}</Text>
                  <Text style={styles.cardTrend}>{Icons.clock}</Text>
                </View>
                <Text style={styles.cardNumber}>{alerts.length}</Text>
                <Text style={styles.cardLabel}>Active Alerts</Text>
                <Text style={styles.cardSubtext}>
                  {alerts.filter(a => a.severity === 'high').length} high priority
                </Text>
              </View>
            </View>

            {/* Event Capacity Chart */}
            <View style={styles.modernAnalyticsCard}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.modernCardTitle}>Total Event Capacity</Text>
                <Text style={styles.liveIndicator}>🔴 LIVE</Text>
              </View>
              <Text style={styles.chartDescription}>
                Current occupancy: {totalOccupancy.toLocaleString()} / {totalCapacity.toLocaleString()} people
              </Text>
              <View style={styles.chartRow}>
                <DonutChart data={eventCapacityData} size={180} totalLabel="People" />
                <View style={styles.chartLegend}>
                  {eventCapacityData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>
                        {item.value.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {analyticsView === 'demographics' && (
          <>
            {/* Gender Distribution */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Gender Distribution</Text>
              <View style={styles.chartRow}>
                <DonutChart data={genderChartData} size={140} totalLabel="People" />
                <View style={styles.chartLegend}>
                  {genderChartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Age Distribution */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Age Distribution</Text>
              <View style={styles.chartRow}>
                <DonutChart data={ageChartData} size={140} totalLabel="People" />
                <View style={styles.chartLegend}>
                  {ageChartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.chartSubtext}>Average age: {stats.avgAge.toFixed(1)} years</Text>
            </View>
          </>
        )}

        {analyticsView === 'rooms' && (
          <>
            {/* Room Occupancy Chart */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Room Occupancy Levels</Text>
              <Text style={styles.chartDescription}>
                Real-time occupancy percentages across all rooms
              </Text>
              <ScrollableBarChart data={roomOccupancyData} height={200} />
              
              {/* Room Details List */}
              <Text style={styles.roomDetailsTitle}>Room Details:</Text>
              {roomOccupancyData.map((room, index) => (
                <View key={index} style={styles.roomDetailItem}>
                  <View style={styles.roomDetailMain}>
                    <Text style={styles.roomDetailName}>
                      {room.label}
                      {room.hasSession && <Text style={styles.liveSessionIndicator}> 🔴 LIVE</Text>}
                      {room.sessionCount > 0 && !room.hasSession && (
                        <Text style={styles.sessionCountIndicator}> ({room.sessionCount} sessions)</Text>
                      )}
                    </Text>
                    <Text style={styles.roomDetailStats}>
                      {room.occupancy}/{room.capacity} ({room.value}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Top Performing Rooms */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Top Performing Rooms</Text>
              {topRoomsData.slice(0, 3).map((room, index) => (
                <View key={index} style={styles.topRoomItem}>
                  <View style={styles.topRoomRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.topRoomInfo}>
                    <Text style={styles.topRoomName}>
                      {room.name}
                      {room.hasActiveSession && <Text style={styles.liveSessionIndicator}> 🔴</Text>}
                      {room.sessionCount > 0 && (
                        <Text style={styles.sessionCountIndicator}> ({room.sessionCount})</Text>
                      )}
                    </Text>
                    <Text style={styles.topRoomStats}>
                      {room.occupancy} attendees • {room.percentage}% full
                    </Text>
                  </View>
                  <View style={styles.topRoomChart}>
                    <DonutChart 
                      data={[
                        { label: 'Occupied', value: room.occupancy, color: colors.primary },
                        { label: 'Available', value: room.capacity - room.occupancy, color: colors.lightPink }
                      ]} 
                      size={60} 
                      showTotal={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  analyticsNav: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  analyticsNavItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeAnalyticsNav: {
    backgroundColor: colors.primary,
  },
  analyticsNavIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  analyticsNavText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeAnalyticsNavText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#666',
    padding: 8,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  modernSummaryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientCard: {
    backgroundColor: colors.primary,
  },
  warningCard: {
    backgroundColor: colors.warning,
  },
  successCard: {
    backgroundColor: colors.success,
  },
  errorCard: {
    backgroundColor: colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 20,
    color: colors.background,
  },
  cardTrend: {
    fontSize: 16,
    color: colors.background,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '500',
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  modernAnalyticsCard: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  liveIndicator: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
  },
  chartDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  roomDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  roomDetailItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightPink,
  },
  roomDetailMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomDetailName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  roomDetailStats: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  liveSessionIndicator: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
  },
  sessionCountIndicator: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: 'normal',
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
  chartSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  topRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightPink,
  },
  topRoomRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  topRoomInfo: {
    flex: 1,
  },
  topRoomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  topRoomStats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  topRoomChart: {
    marginLeft: 15,
  },
  sessionTimelineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  timelineStatItem: {
    alignItems: 'center',
  },
  timelineStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  timelineStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AnalyticsTab;