import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const eventDate = new Date('2025-09-13T09:00:00');
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
      
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownTitle}>Event Countdown</Text>
      <View style={styles.countdownGrid}>
        <View style={styles.countdownItem}>
          <Text style={styles.countdownNumber}>{timeLeft.days}</Text>
          <Text style={styles.countdownLabel}>DAYS</Text>
        </View>
        <View style={styles.countdownItem}>
          <Text style={styles.countdownNumber}>{timeLeft.hours}</Text>
          <Text style={styles.countdownLabel}>HOURS</Text>
        </View>
        <View style={styles.countdownItem}>
          <Text style={styles.countdownNumber}>{timeLeft.minutes}</Text>
          <Text style={styles.countdownLabel}>MINUTES</Text>
        </View>
        <View style={styles.countdownItem}>
          <Text style={styles.countdownNumber}>{timeLeft.seconds}</Text>
          <Text style={styles.countdownLabel}>SECONDS</Text>
        </View>
      </View>
    </View>
  );
};

const SettingsTab = ({ 
  userRole, 
  setUserRole, 
  rooms, 
  attendees, 
  alerts, 
  totalCapacity, 
  totalOccupancy,
  analyticsAttendees,
  totalAnalyticsOccupancy
}) => {
  
  // Calculate correct stats
  const activeRooms = rooms.length;
  const totalRegisteredAttendees = attendees.length;
  const currentlyCheckedIn = attendees.filter(a => a.is_checked_in && a.current_room_id).length;
  const analyticsAttendeesCount = analyticsAttendees ? analyticsAttendees.length : 0;
  const capacityUsagePercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  const highPriorityAlerts = alerts.filter(a => a.severity === 'high').length;

  console.log('Settings Tab Stats:', {
    activeRooms,
    totalRegisteredAttendees,
    currentlyCheckedIn,
    analyticsAttendeesCount,
    totalCapacity,
    totalOccupancy,
    capacityUsagePercentage,
    alerts: alerts.length,
    highPriorityAlerts
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Header */}
        <View style={styles.eventHeaderCard}>
          <View style={styles.eventLogoContainer}>
            <Text style={styles.eventLogo}>AVIJOZI</Text>
            <Text style={styles.eventYear}>2025</Text>
          </View>
          <Text style={styles.eventTagline}>Professional Event Management Dashboard</Text>
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailItem}>
              <Text style={styles.eventDetailIcon}>{Icons.calendar || '📅'}</Text>
              <Text style={styles.eventDetailText}>Sat 13 - Sun 14 September 2025</Text>
            </View>
            <View style={styles.eventDetailItem}>
              <Text style={styles.eventDetailIcon}>{Icons.location || '📍'}</Text>
              <Text style={styles.eventDetailText}>Convention Center, Main City</Text>
            </View>
          </View>
        </View>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* User Role Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.shield || '🛡️'}</Text>
            <Text style={styles.sectionTitle}>User Access Level</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select your role to customize dashboard permissions
          </Text>
          
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                userRole === 'admin' && styles.activeRoleButton
              ]}
              onPress={() => setUserRole('admin')}
            >
              <Text style={styles.roleIcon}>👑</Text>
              <Text style={[
                styles.roleButtonText,
                userRole === 'admin' && styles.activeRoleButtonText
              ]}>
                Administrator
              </Text>
              <Text style={styles.roleDescription}>Full access to all features</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                userRole === 'staff' && styles.activeRoleButton
              ]}
              onPress={() => setUserRole('staff')}
            >
              <Text style={styles.roleIcon}>👤</Text>
              <Text style={[
                styles.roleButtonText,
                userRole === 'staff' && styles.activeRoleButtonText
              ]}>
                Staff Member
              </Text>
              <Text style={styles.roleDescription}>View and track attendees</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Statistics */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.analytics || '📊'}</Text>
            <Text style={styles.sectionTitle}>Live Event Statistics</Text>
          </View>
          <Text style={styles.sectionDescription}>Real-time event performance metrics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>{Icons.room || '🏢'}</Text>
              <Text style={styles.statNumber}>{activeRooms}</Text>
              <Text style={styles.statLabel}>Active Venues</Text>
              <Text style={styles.statStatus}>All Operational</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>{Icons.users || '👥'}</Text>
              <Text style={styles.statNumber}>{currentlyCheckedIn}</Text>
              <Text style={styles.statLabel}>Currently Here</Text>
              <Text style={styles.statStatus}>Live Monitoring</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>{Icons.capacity || '📏'}</Text>
              <Text style={styles.statNumber}>{totalCapacity.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Capacity</Text>
              <Text style={styles.statStatus}>{capacityUsagePercentage}% Used</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>{Icons.alert || '⚠️'}</Text>
              <Text style={styles.statNumber}>{alerts.length}</Text>
              <Text style={styles.statLabel}>Active Alerts</Text>
              <Text style={styles.statStatus}>
                {highPriorityAlerts} High Priority
              </Text>
            </View>
          </View>

          {/* Additional Stats Row */}
          <View style={styles.additionalStats}>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>{totalRegisteredAttendees}</Text>
              <Text style={styles.additionalStatLabel}>Total Registered</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>{analyticsAttendeesCount}</Text>
              <Text style={styles.additionalStatLabel}>Analytics Pool</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>{totalOccupancy}</Text>
              <Text style={styles.additionalStatLabel}>Current Occupancy</Text>
            </View>
          </View>
        </View>

        {/* System Information */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.info || 'ℹ️'}</Text>
            <Text style={styles.sectionTitle}>System Information</Text>
          </View>
          <Text style={styles.sectionDescription}>Dashboard and event management details</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform Version</Text>
              <Text style={styles.infoValue}>Avijozi Dashboard v2.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>Real-time sync enabled</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data Refresh</Text>
              <Text style={styles.infoValue}>Live updates</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Server Status</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.infoValue}>Online</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.settingsFooter}>
          <Text style={styles.footerText}>Powered by Avijozi Management</Text>
          <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eventHeaderCard: {
    backgroundColor: colors.primary,
    margin: 15,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eventLogoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  eventLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.background,
    letterSpacing: 3,
  },
  eventYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
    opacity: 0.9,
    marginTop: 5,
  },
  eventTagline: {
    fontSize: 16,
    color: colors.background,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  eventDetails: {
    alignItems: 'center',
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.background,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '500',
  },
  countdownContainer: {
    backgroundColor: colors.background,
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  countdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countdownItem: {
    alignItems: 'center',
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    width: '22%',
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  countdownLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginTop: 5,
  },
  settingsSection: {
    backgroundColor: colors.background,
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeRoleButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  activeRoleButtonText: {
    color: colors.primary,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.primary,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
  },
  statStatus: {
    fontSize: 10,
    color: colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  additionalStatItem: {
    alignItems: 'center',
  },
  additionalStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  additionalStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  settingsFooter: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    opacity: 0.7,
  },
});

export default SettingsTab;