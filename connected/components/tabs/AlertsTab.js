import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, Icons } from '../../constants/theme';
import AddAlertModal from '../modals/AddAlertModal';
import supabase from '../../supabaseClient';

const AlertsTab = ({ alerts, fetchAlerts, rooms }) => {
  const [loading, setLoading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleAddAlert = async (newAlert) => {
    if (!newAlert.message) {
      Alert.alert('Error', 'Please enter an alert message');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('alerts')
        .insert([{
          room_id: newAlert.roomId,
          type: newAlert.type,
          message: newAlert.message,
          severity: newAlert.severity,
          IsActive: true,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      await fetchAlerts();
      setShowAlertModal(false);
      Alert.alert('Success', 'New alert created successfully');
    } catch (error) {
      console.error('Error inserting alert:', error);
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (alertId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('alerts')
        .update({ IsActive: false })
        .eq('id', alertId);

      if (error) throw error;

      await fetchAlerts();
      Alert.alert('Resolved', 'Alert marked as resolved.');
    } catch (error) {
      console.error('Error updating alert:', error);
      Alert.alert('Error', 'Failed to resolve alert. Please try again.');
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎉</Text>
            <Text style={styles.emptyStateText}>No active alerts</Text>
            <Text style={styles.emptyStateSubtext}>Everything is running smoothly</Text>
          </View>
        ) : (
          alerts.map(alert => {
            const room = rooms.find(r => r.id === alert.room_id);
            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  alert.severity === 'high' && styles.highAlertCard,
                  alert.severity === 'medium' && styles.mediumAlertCard,
                ]}
              >
                <View style={styles.alertHeader}>
                  <Text style={styles.alertType}>
                    {alert.type === 'overcrowding' ? '🚨 Overcrowding' : '⚠️ Technical Issue'}
                  </Text>
                  <Text style={[
                    styles.alertSeverity,
                    { color: alert.severity === 'high' ? colors.error : colors.warning }
                  ]}>
                    {alert.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                  </Text>
                </View>

                <Text style={styles.alertMessage}>{alert.message}</Text>

                <View style={styles.alertFooter}>
                  <Text style={styles.alertRoom}>
                    {room ? room.room_name : `Room ID: ${alert.room_id}`}
                  </Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => markAsResolved(alert.id)}
                >
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowAlertModal(true)}
      >
        <Text style={styles.addButtonText}>{Icons.plus}</Text>
      </TouchableOpacity>

      <AddAlertModal
        visible={showAlertModal}
        rooms={rooms}
        onClose={() => setShowAlertModal(false)}
        onAdd={handleAddAlert}
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
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
  },
  alertCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: colors.warning,
  },
  highAlertCard: {
    borderLeftColor: colors.error,
  },
  mediumAlertCard: {
    borderLeftColor: colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  alertRoom: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resolveButton: {
    backgroundColor: colors.success,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AlertsTab;