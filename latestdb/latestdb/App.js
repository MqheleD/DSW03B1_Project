import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Avijozi color scheme - Pink, White, Black, Turquoise, Yellow
const colors = {
  primary: '#E91E63',           // Hot Pink
  secondary: '#F8BBD9',         // Light Pink
  accent: '#20B2AA',            // Light Turquoise
  background: '#FFFFFF',        // White
  surface: '#FFFFFF',           // White
  text: '#000000',              // Black
  textSecondary: '#6C757D',     // Medium gray
  border: '#F8BBD9',            // Light Pink border
  success: '#20B2AA',           // Turquoise
  warning: '#FFD700',           // Gold/Yellow
  error: '#FF1744',             // Bright Red-Pink
  overlay: 'rgba(0,0,0,0.5)',   // Semi-transparent black
  chartColors: ['#E91E63', '#FF6B9D', '#20B2AA', '#FFD700', '#FF1744'],
  gradientStart: '#E91E63',
  gradientEnd: '#FF6B9D',
  cardShadow: 'rgba(233, 30, 99, 0.1)',
  lightPink: '#FCE4EC',         // Very light pink
  darkPink: '#C2185B',          // Dark pink
  turquoise: '#00CED1',         // Dark turquoise
  lightTurquoise: '#AFEEEE',    // Pale turquoise
  yellow: '#FFEB3B',            // Bright yellow
  darkYellow: '#F57F17',        // Dark yellow
};

// Professional icons
const Icons = {
  users: '👥',
  alert: '⚠️',
  plus: '+',
  bell: '🔔',
  room: '🏢',
  analytics: '📊',
  male: '👨',
  female: '👩',
  settings: '⚙️',
  qr: '📱',
  scan: '🔍',
  speaker: '🎤',
  chart: '📈',
  pie: '🥧',
  trend: '📉',
  clock: '🕐',
  fire: '🔥',
  star: '⭐',
  capacity: '🏟️',
  calendar: '📅',
  location: '📍',
  ticket: '🎫',
  timer: '⏰',
  info: 'ℹ️',
  shield: '🛡️',
  globe: '🌍',
  heart: '❤️',
};

// Mock data - Updated for Avijozi event
const initialRooms = [
  { id: 1, name: 'Main Conference Hall', capacity: 500, currentOccupancy: 385, status: 'normal', speaker: 'Keynote Speaker' },
  { id: 2, name: 'Innovation Pavilion', capacity: 300, currentOccupancy: 240, status: 'normal', speaker: 'Tech Panel' },
  { id: 3, name: 'Workshop Alpha', capacity: 150, currentOccupancy: 135, status: 'warning', speaker: 'Expert Trainer' },
  { id: 4, name: 'Workshop Beta', capacity: 150, currentOccupancy: 110, status: 'normal', speaker: 'Senior Developer' },
  { id: 5, name: 'Networking Lounge', capacity: 200, currentOccupancy: 175, status: 'normal', speaker: 'Multiple Speakers' },
  { id: 6, name: 'Exhibition Area', capacity: 400, currentOccupancy: 350, status: 'normal', speaker: 'Various Exhibitors' },
];

// Expanded mock attendee data for analytics
const initialAttendees = [
  { id: 1, age: 28, gender: 'male', roomId: 1, timestamp: new Date(), qrCode: 'AVJ001' },
  { id: 2, age: 32, gender: 'female', roomId: 2, timestamp: new Date(), qrCode: 'AVJ002' },
  { id: 3, age: 24, gender: 'female', roomId: 1, timestamp: new Date(), qrCode: 'AVJ003' },
  { id: 4, age: 35, gender: 'male', roomId: 3, timestamp: new Date(), qrCode: 'AVJ004' },
  { id: 5, age: 29, gender: 'female', roomId: 4, timestamp: new Date(), qrCode: 'AVJ005' },
  { id: 6, age: 42, gender: 'male', roomId: 5, timestamp: new Date(), qrCode: 'AVJ006' },
  { id: 7, age: 27, gender: 'female', roomId: 6, timestamp: new Date(), qrCode: 'AVJ007' },
  { id: 8, age: 31, gender: 'male', roomId: 1, timestamp: new Date(), qrCode: 'AVJ008' },
  { id: 9, age: 26, gender: 'female', roomId: 2, timestamp: new Date(), qrCode: 'AVJ009' },
  { id: 10, age: 38, gender: 'male', roomId: 3, timestamp: new Date(), qrCode: 'AVJ010' },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: i + 11,
    age: Math.floor(Math.random() * 30) + 18,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    roomId: Math.floor(Math.random() * 6) + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    qrCode: `AVJ${String(i + 11).padStart(3, '0')}`
  }))
];

const initialAlerts = [
  { 
    id: 1, 
    roomId: 3, 
    type: 'overcrowding', 
    message: 'Workshop Alpha is at 90% capacity', 
    severity: 'high', 
    timestamp: new Date(),
    sentToWorkers: true,
  },
  { 
    id: 2, 
    roomId: 1, 
    type: 'technical', 
    message: 'Audio issues reported in Main Conference Hall', 
    severity: 'medium', 
    timestamp: new Date(),
    sentToWorkers: false,
  },
];

// Enhanced Donut Chart Component
const DonutChart = ({ data, size = 120, showTotal = true, totalLabel = "Total" }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={[styles.donutContainer, { width: size, height: size }]}>
      <View style={styles.donutChart}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View
              key={index}
              style={[
                styles.donutSegment,
                {
                  backgroundColor: item.color || colors.chartColors[index % colors.chartColors.length],
                  width: `${percentage}%`,
                }
              ]}
            />
          );
        })}
      </View>
      {showTotal && (
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterText}>{total}</Text>
          <Text style={styles.donutCenterLabel}>{totalLabel}</Text>
        </View>
      )}
    </View>
  );
};

// Enhanced Bar Chart with horizontal scrolling
const ScrollableBarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 60;
  const spacing = 15;
  
  return (
    <View style={[styles.barChartContainer, { height }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.barChartScroll}
      >
        <View style={[styles.barChart, { width: data.length * (barWidth + spacing) + spacing }]}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            return (
              <View key={index} style={[styles.barWrapper, { width: barWidth, marginHorizontal: spacing / 2 }]}>
                <Text style={styles.barValue}>{item.value}%</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors.chartColors[index % colors.chartColors.length],
                      width: barWidth - 10,
                    }
                  ]}
                />
                <Text style={styles.barLabel} numberOfLines={2}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 39,
    hours: 21,
    minutes: 15,
    seconds: 19
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

const EventDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [userRole, setUserRole] = useState('admin');
  const [rooms, setRooms] = useState(initialRooms);
  const [attendees, setAttendees] = useState(initialAttendees);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [analyticsView, setAnalyticsView] = useState('overview');
  
  // Modal states
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showQRScanModal, setShowQRScanModal] = useState(false);
  const [showRoomDemographicsModal, setShowRoomDemographicsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Form states
  const [newAttendee, setNewAttendee] = useState({ age: '', gender: 'male', roomId: 1 });
  const [newAlert, setNewAlert] = useState({ roomId: 1, type: 'technical', message: '', severity: 'medium' });
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', speaker: '' });
  const [selectedRoomForScan, setSelectedRoomForScan] = useState(1);
  const [scannedQRCode, setScannedQRCode] = useState('');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(prevRooms => 
        prevRooms.map(room => {
          const change = Math.floor(Math.random() * 5) - 2;
          const newOccupancy = Math.max(0, Math.min(room.capacity, room.currentOccupancy + change));
          return {
            ...room,
            currentOccupancy: newOccupancy,
            status: newOccupancy > room.capacity * 0.9 ? 'critical' : 
                    newOccupancy > room.capacity * 0.7 ? 'warning' : 'normal'
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Analytics calculations
  const totalAttendees = attendees.length;
  const maleCount = attendees.filter(a => a.gender === 'male').length;
  const femaleCount = attendees.filter(a => a.gender === 'female').length;
  const avgAge = attendees.reduce((sum, a) => sum + a.age, 0) / attendees.length || 0;
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupancy = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);

  // Age groups
  const ageGroups = {
    '18-24': attendees.filter(a => a.age >= 18 && a.age <= 24).length,
    '25-34': attendees.filter(a => a.age >= 25 && a.age <= 34).length,
    '35-44': attendees.filter(a => a.age >= 35 && a.age <= 44).length,
    '45+': attendees.filter(a => a.age >= 45).length,
  };

  // Chart data
  const genderChartData = [
    { label: 'Male', value: maleCount, color: colors.accent },
    { label: 'Female', value: femaleCount, color: colors.primary },
  ];

  const ageChartData = Object.entries(ageGroups).map(([label, value]) => ({
    label,
    value,
    color: colors.chartColors[Object.keys(ageGroups).indexOf(label) % colors.chartColors.length]
  }));

  const roomOccupancyData = rooms.map(room => ({
    label: room.name.length > 10 ? room.name.substring(0, 10) + '...' : room.name,
    value: Math.round((room.currentOccupancy / room.capacity) * 100)
  }));

  // Event Capacity Chart Data
  const eventCapacityData = [
    { label: 'Occupied', value: totalOccupancy, color: colors.primary },
    { label: 'Available', value: totalCapacity - totalOccupancy, color: colors.lightPink },
  ];

  const topRoomsData = rooms
    .map(room => ({
      name: room.name,
      attendees: attendees.filter(a => a.roomId === room.id).length,
      capacity: room.capacity,
      occupancy: Math.round((room.currentOccupancy / room.capacity) * 100)
    }))
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 5);

  const processAttendeeQRCode = (qrData) => {
    try {
      const attendeeData = JSON.parse(qrData);
      const existingAttendee = attendees.find(a => a.qrCode === attendeeData.id);
      
      if (existingAttendee) {
        updateAttendeeRoom(existingAttendee.id, selectedRoomForScan);
      } else {
        const newAttendeeFromQR = {
          id: attendees.length + 1,
          age: attendeeData.age,
          gender: attendeeData.gender,
          name: attendeeData.name || 'Unknown',
          roomId: selectedRoomForScan,
          timestamp: new Date(),
          qrCode: attendeeData.id
        };
        
        setAttendees([...attendees, newAttendeeFromQR]);
      }
      
      Alert.alert(
        'QR Scan Successful',
        `Attendee ${attendeeData.id ? attendeeData.id : 'unknown'} processed for room ${rooms.find(r => r.id === selectedRoomForScan)?.name || 'unknown'}`,
        [{ text: 'OK', onPress: () => setShowQRScanModal(false) }]
      );
    } catch (e) {
      Alert.alert('Error', 'Invalid QR Code format', [{ text: 'OK' }]);
    }
  };

  const updateAttendeeRoom = (attendeeId, newRoomId) => {
    setAttendees(attendees.map(a => 
      a.id === attendeeId ? { ...a, roomId: newRoomId, timestamp: new Date() } : a
    ));
  };

  const addNewAttendee = () => {
    if (!newAttendee.age || isNaN(newAttendee.age)) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }
    
    const newAtt = {
      id: attendees.length + 1,
      age: parseInt(newAttendee.age),
      gender: newAttendee.gender,
      roomId: newAttendee.roomId,
      timestamp: new Date(),
      qrCode: `AVJ${String(attendees.length + 1).padStart(3, '0')}`
    };
    
    setAttendees([...attendees, newAtt]);
    setNewAttendee({ age: '', gender: 'male', roomId: 1 });
    setShowAddAttendeeModal(false);
    Alert.alert('Success', 'New attendee added successfully');
  };

  const addNewAlert = () => {
    if (!newAlert.message) {
      Alert.alert('Error', 'Please enter an alert message');
      return;
    }
    
    const alert = {
      id: alerts.length + 1,
      roomId: newAlert.roomId,
      type: newAlert.type,
      message: newAlert.message,
      severity: newAlert.severity,
      timestamp: new Date(),
      sentToWorkers: false
    };
    
    setAlerts([...alerts, alert]);
    setNewAlert({ roomId: 1, type: 'technical', message: '', severity: 'medium' });
    setShowAlertModal(false);
    Alert.alert('Success', 'New alert created successfully');
  };

  const addNewRoom = () => {
    if (!newRoom.name || !newRoom.capacity || isNaN(newRoom.capacity)) {
      Alert.alert('Error', 'Please enter valid room details');
      return;
    }
    
    const room = {
      id: rooms.length + 1,
      name: newRoom.name,
      capacity: parseInt(newRoom.capacity),
      currentOccupancy: 0,
      status: 'normal',
      speaker: newRoom.speaker || 'TBD'
    };
    
    setRooms([...rooms, room]);
    setNewRoom({ name: '', capacity: '', speaker: '' });
    setShowAddRoomModal(false);
    Alert.alert('Success', 'New room added successfully');
  };

  const RoomsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView>
        <View style={styles.roomsGrid}>
          {rooms.map(room => (
            <TouchableOpacity 
              key={room.id} 
              style={[
                styles.roomCard,
                room.status === 'warning' && styles.warningRoomCard,
                room.status === 'critical' && styles.criticalRoomCard
              ]}
              onPress={() => {
                setSelectedRoom(room);
                setShowRoomDemographicsModal(true);
              }}
            >
              <View style={styles.roomHeader}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomSpeaker}>{room.speaker}</Text>
              </View>
              
              <View style={styles.roomCapacity}>
                <Text style={styles.capacityText}>
                  {room.currentOccupancy}/{room.capacity}
                </Text>
                <Text style={styles.capacityLabel}>Attendees</Text>
              </View>
              
              <View style={styles.roomProgress}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%`,
                      backgroundColor: room.status === 'critical' ? colors.error : 
                                      room.status === 'warning' ? colors.warning : colors.success
                    }
                  ]}
                />
              </View>
              
              <View style={styles.roomFooter}>
                <Text style={styles.roomStatus}>
                  {room.status === 'critical' ? 'Critical' : 
                   room.status === 'warning' ? 'Warning' : 'Normal'}
                </Text>
                <TouchableOpacity 
                  style={styles.qrButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedRoomForScan(room.id);
                    setShowQRScanModal(true);
                  }}
                >
                  <Text style={styles.qrButtonText}>{Icons.qr} Scan</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {userRole === 'admin' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddRoomModal(true)}
        >
          <Text style={styles.addButtonText}>{Icons.plus}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const AlertsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎉</Text>
            <Text style={styles.emptyStateText}>No active alerts</Text>
            <Text style={styles.emptyStateSubtext}>Everything is running smoothly</Text>
          </View>
        ) : (
          alerts.map(alert => (
            <View 
              key={alert.id} 
              style={[
                styles.alertCard,
                alert.severity === 'high' && styles.highAlertCard,
                alert.severity === 'medium' && styles.mediumAlertCard
              ]}
            >
              <View style={styles.alertHeader}>
                <Text style={styles.alertType}>
                  {alert.type === 'overcrowding' ? '🚨 Overcrowding' : '⚠️ Technical Issue'}
                </Text>
                <Text style={styles.alertSeverity}>
                  {alert.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                </Text>
              </View>
              
              <Text style={styles.alertMessage}>{alert.message}</Text>
              
              <View style={styles.alertFooter}>
                <Text style={styles.alertRoom}>
                  {rooms.find(r => r.id === alert.roomId)?.name || 'Unknown Room'}
                </Text>
                <Text style={styles.alertTime}>
                  {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              {!alert.sentToWorkers && userRole === 'admin' && (
                <TouchableOpacity 
                  style={styles.resolveButton}
                  onPress={() => {
                    setAlerts(alerts.filter(a => a.id !== alert.id));
                    Alert.alert('Alert Resolved', 'The alert has been marked as resolved');
                  }}
                >
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      {userRole === 'admin' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAlertModal(true)}
        >
          <Text style={styles.addButtonText}>{Icons.plus}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const SettingsTab = () => (
    <View style={styles.tabContent}>
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
              <Text style={styles.eventDetailIcon}>{Icons.calendar}</Text>
              <Text style={styles.eventDetailText}>Sat 13 - Sun 14 September 2025</Text>
            </View>
            <View style={styles.eventDetailItem}>
              <Text style={styles.eventDetailIcon}>{Icons.location}</Text>
              <Text style={styles.eventDetailText}>Convention Center, Main City</Text>
            </View>
          </View>
        </View>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* User Role Settings */}
        <View style={styles.professionalSettingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.shield}</Text>
            <Text style={styles.professionalSectionTitle}>User Access Level</Text>
          </View>
          <Text style={styles.sectionDescription}>Select your role to customize dashboard permissions</Text>
          
          <View style={styles.professionalRoleSelector}>
            <TouchableOpacity
              style={[
                styles.professionalRoleButton,
                userRole === 'admin' && styles.activeProfessionalRoleButton
              ]}
              onPress={() => setUserRole('admin')}
            >
              <Text style={styles.roleIcon}>👑</Text>
              <Text style={[
                styles.professionalRoleButtonText,
                userRole === 'admin' && styles.activeProfessionalRoleButtonText
              ]}>
                Administrator
              </Text>
              <Text style={styles.roleDescription}>Full access to all features</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.professionalRoleButton,
                userRole === 'staff' && styles.activeProfessionalRoleButton
              ]}
              onPress={() => setUserRole('staff')}
            >
              <Text style={styles.roleIcon}>👤</Text>
              <Text style={[
                styles.professionalRoleButtonText,
                userRole === 'staff' && styles.activeProfessionalRoleButtonText
              ]}>
                Staff Member
              </Text>
              <Text style={styles.roleDescription}>View and track attendees</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Statistics */}
        <View style={styles.professionalSettingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.analytics}</Text>
            <Text style={styles.professionalSectionTitle}>Event Statistics</Text>
          </View>
          <Text style={styles.sectionDescription}>Real-time event performance metrics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.professionalStatCard}>
              <Text style={styles.professionalStatIcon}>{Icons.room}</Text>
              <Text style={styles.professionalStatNumber}>{rooms.length}</Text>
              <Text style={styles.professionalStatLabel}>Active Venues</Text>
              <Text style={styles.professionalStatStatus}>All Operational</Text>
            </View>
            
            <View style={styles.professionalStatCard}>
              <Text style={styles.professionalStatIcon}>{Icons.users}</Text>
              <Text style={styles.professionalStatNumber}>{attendees.length}</Text>
              <Text style={styles.professionalStatLabel}>Attendees Tracked</Text>
              <Text style={styles.professionalStatStatus}>Live Monitoring</Text>
            </View>
            
            <View style={styles.professionalStatCard}>
              <Text style={styles.professionalStatIcon}>{Icons.capacity}</Text>
              <Text style={styles.professionalStatNumber}>{totalCapacity.toLocaleString()}</Text>
              <Text style={styles.professionalStatLabel}>Total Capacity</Text>
              <Text style={styles.professionalStatStatus}>{Math.round((totalOccupancy/totalCapacity)*100)}% Utilized</Text>
            </View>
            
            <View style={styles.professionalStatCard}>
              <Text style={styles.professionalStatIcon}>{Icons.alert}</Text>
              <Text style={styles.professionalStatNumber}>{alerts.length}</Text>
              <Text style={styles.professionalStatLabel}>Active Alerts</Text>
              <Text style={styles.professionalStatStatus}>{alerts.filter(a => a.severity === 'high').length} High Priority</Text>
            </View>
          </View>
        </View>

        {/* System Information */}
        <View style={styles.professionalSettingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.info}</Text>
            <Text style={styles.professionalSectionTitle}>System Information</Text>
          </View>
          <Text style={styles.sectionDescription}>Dashboard and event management details</Text>
          
          <View style={styles.professionalInfoCard}>
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
              <Text style={styles.infoValue}>Every 5 seconds</Text>
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

        {/* Contact & Support */}
        <View style={styles.professionalSettingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{Icons.heart}</Text>
            <Text style={styles.professionalSectionTitle}>Support & Contact</Text>
          </View>
          <Text style={styles.sectionDescription}>Get help or report issues</Text>
          
          <View style={styles.supportGrid}>
            <TouchableOpacity style={styles.supportCard}>
              <Text style={styles.supportIcon}>📧</Text>
              <Text style={styles.supportTitle}>Email Support</Text>
              <Text style={styles.supportSubtitle}>support@avijozi.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportCard}>
              <Text style={styles.supportIcon}>📱</Text>
              <Text style={styles.supportTitle}>Emergency Line</Text>
              <Text style={styles.supportSubtitle}>+1 (555) 123-4567</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportCard}>
              <Text style={styles.supportIcon}>{Icons.globe}</Text>
              <Text style={styles.supportTitle}>Website</Text>
              <Text style={styles.supportSubtitle}>www.avijozi.com</Text>
            </TouchableOpacity>
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

  const AnalyticsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
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

        {analyticsView === 'overview' && (
          <>
            {/* Enhanced Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.modernSummaryCard, styles.gradientCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.users}</Text>
                  <Text style={styles.cardTrend}>{Icons.trend}</Text>
                </View>
                <Text style={styles.cardNumber}>{totalAttendees}</Text>
                <Text style={styles.cardLabel}>Total Attendees</Text>
                <Text style={styles.cardSubtext}>+12% from yesterday</Text>
              </View>
              
              <View style={[styles.modernSummaryCard, styles.warningCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{Icons.fire}</Text>
                  <Text style={styles.cardTrend}>{Icons.trend}</Text>
                </View>
                <Text style={styles.cardNumber}>{Math.round((totalOccupancy / totalCapacity) * 100)}%</Text>
                <Text style={styles.cardLabel}>Capacity Used</Text>
                <Text style={styles.cardSubtext}>Peak: 94%</Text>
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
                <Text style={styles.cardSubtext}>2 high priority</Text>
              </View>
            </View>

            {/* Event Capacity Chart - Using DonutChart */}
            <View style={styles.modernAnalyticsCard}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.modernCardTitle}>Total Event Capacity</Text>
                <Text style={styles.liveIndicator}>🔴 LIVE</Text>
              </View>
              <Text style={styles.chartDescription}>
                Shows current occupancy vs available capacity across all rooms (Total: {totalCapacity.toLocaleString()} people)
              </Text>
              <View style={styles.chartRow}>
                <DonutChart data={eventCapacityData} size={180} totalLabel="People" />
                <View style={styles.chartLegend}>
                  {eventCapacityData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>
                        {item.value.toLocaleString()} ({Math.round((item.value/totalCapacity)*100)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterText}>
                  📊 {totalOccupancy.toLocaleString()} people currently at the event out of {totalCapacity.toLocaleString()} total capacity
                </Text>
              </View>
            </View>

            {/* Quick Insights */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Quick Insights</Text>
              <View style={styles.insightsGrid}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{Icons.capacity}</Text>
                  <Text style={styles.insightTitle}>Max Capacity</Text>
                  <Text style={styles.insightValue}>
                    {totalCapacity.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{Icons.star}</Text>
                  <Text style={styles.insightTitle}>Most Popular</Text>
                  <Text style={styles.insightValue}>
                    {(() => {
                      const maxRoom = topRoomsData[0];
                      return maxRoom?.name?.split(' ')[0] || 'Main';
                    })()}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{Icons.users}</Text>
                  <Text style={styles.insightTitle}>Avg Age</Text>
                  <Text style={styles.insightValue}>{avgAge.toFixed(1)}y</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {analyticsView === 'demographics' && (
          <>
            {/* Gender Distribution with Donut Chart */}
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

            {/* Age Distribution with Donut Chart */}
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
              <Text style={styles.chartSubtext}>Average age: {avgAge.toFixed(1)} years</Text>
            </View>

            {/* Detailed Demographics */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Detailed Breakdown</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Male Attendees</Text>
                  <Text style={styles.detailValue}>{maleCount}</Text>
                  <Text style={styles.detailPercentage}>{Math.round((maleCount/totalAttendees)*100)}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Female Attendees</Text>
                  <Text style={styles.detailValue}>{femaleCount}</Text>
                  <Text style={styles.detailPercentage}>{Math.round((femaleCount/totalAttendees)*100)}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Youngest</Text>
                  <Text style={styles.detailValue}>{Math.min(...attendees.map(a => a.age))}</Text>
                  <Text style={styles.detailPercentage}>years</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Oldest</Text>
                  <Text style={styles.detailValue}>{Math.max(...attendees.map(a => a.age))}</Text>
                  <Text style={styles.detailPercentage}>years</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {analyticsView === 'rooms' && (
          <>
            {/* Room Occupancy Chart - Scrollable */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Room Occupancy Levels</Text>
              <Text style={styles.chartDescription}>
                Scroll horizontally to view all rooms occupancy percentages
              </Text>
              <ScrollableBarChart data={roomOccupancyData} height={200} />
            </View>

            {/* Top Performing Rooms with Donut Charts */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Top Performing Rooms</Text>
              {topRoomsData.slice(0, 3).map((room, index) => (
                <View key={index} style={styles.topRoomItem}>
                  <View style={styles.topRoomRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.topRoomInfo}>
                    <Text style={styles.topRoomName}>{room.name}</Text>
                    <Text style={styles.topRoomStats}>{room.attendees} attendees • {room.occupancy}% capacity</Text>
                  </View>
                  <View style={styles.topRoomChart}>
                    <DonutChart 
                      data={[
                        { label: 'Occupied', value: room.attendees, color: colors.primary },
                        { label: 'Available', value: room.capacity - room.attendees, color: colors.lightPink }
                      ]} 
                      size={60} 
                      showTotal={false}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Room Status Overview */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Room Status Overview</Text>
              <View style={styles.statusGrid}>
                <View style={[styles.statusCard, styles.normalStatus]}>
                  <Text style={styles.statusNumber}>{rooms.filter(r => r.status === 'normal').length}</Text>
                  <Text style={styles.statusLabel}>Normal</Text>
                </View>
                <View style={[styles.statusCard, styles.warningStatus]}>
                  <Text style={styles.statusNumber}>{rooms.filter(r => r.status === 'warning').length}</Text>
                  <Text style={styles.statusLabel}>Warning</Text>
                </View>
                <View style={[styles.statusCard, styles.criticalStatus]}>
                  <Text style={styles.statusNumber}>{rooms.filter(r => r.status === 'critical').length}</Text>
                  <Text style={styles.statusLabel}>Critical</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );

  const RoomDemographicsModal = () => {
    if (!selectedRoom) return null;
    
    // Calculate demographics for the selected room
    const roomAttendees = attendees.filter(a => a.roomId === selectedRoom.id);
    const maleCount = roomAttendees.filter(a => a.gender === 'male').length;
    const femaleCount = roomAttendees.filter(a => a.gender === 'female').length;
    
    const ageGroups = {
      '18-24': roomAttendees.filter(a => a.age >= 18 && a.age <= 24).length,
      '25-34': roomAttendees.filter(a => a.age >= 25 && a.age <= 34).length,
      '35-44': roomAttendees.filter(a => a.age >= 35 && a.age <= 44).length,
      '45+': roomAttendees.filter(a => a.age >= 45).length,
    };

    const genderData = [
      { label: 'Male', value: maleCount, color: colors.accent },
      { label: 'Female', value: femaleCount, color: colors.primary },
    ];

    const ageData = Object.entries(ageGroups).map(([label, value]) => ({
      label,
      value,
      color: colors.chartColors[Object.keys(ageGroups).indexOf(label) % colors.chartColors.length]
    }));

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRoomDemographicsModal}
        onRequestClose={() => setShowRoomDemographicsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.largeModal]}>
            <Text style={styles.modalTitle}>{selectedRoom.name} Demographics</Text>
            
            <View style={styles.roomStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{selectedRoom.currentOccupancy}</Text>
                <Text style={styles.statLabel}>Current</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{selectedRoom.capacity}</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round((selectedRoom.currentOccupancy / selectedRoom.capacity) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Full</Text>
              </View>
            </View>
            
            {/* Gender Distribution Pie Chart */}
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
            
            {/* Age Distribution Pie Chart */}
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
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowRoomDemographicsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const AddAttendeeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddAttendeeModal}
      onRequestClose={() => setShowAddAttendeeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Attendee</Text>
          
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter age"
            keyboardType="numeric"
            value={newAttendee.age}
            onChangeText={text => setNewAttendee({...newAttendee, age: text})}
          />
          
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderSelector}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                newAttendee.gender === 'male' && styles.activeGenderButton
              ]}
              onPress={() => setNewAttendee({...newAttendee, gender: 'male'})}
            >
              <Text style={[
                styles.genderButtonText,
                newAttendee.gender === 'male' && styles.activeGenderButtonText
              ]}>
                {Icons.male} Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderButton,
                newAttendee.gender === 'female' && styles.activeGenderButton
              ]}
              onPress={() => setNewAttendee({...newAttendee, gender: 'female'})}
            >
              <Text style={[
                styles.genderButtonText,
                newAttendee.gender === 'female' && styles.activeGenderButtonText
              ]}>
                {Icons.female} Female
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Room</Text>
          <View style={styles.roomPicker}>
            <Picker
              selectedValue={newAttendee.roomId}
              onValueChange={(itemValue) => setNewAttendee({...newAttendee, roomId: itemValue})}
              style={styles.picker}
            >
              {rooms.map(room => (
                <Picker.Item 
                  key={room.id} 
                  label={room.name} 
                  value={room.id} 
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddAttendeeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={addNewAttendee}
            >
              <Text style={styles.confirmButtonText}>Add Attendee</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const AddAlertModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAlertModal}
      onRequestClose={() => setShowAlertModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Alert</Text>
          
          <Text style={styles.inputLabel}>Room</Text>
          <View style={styles.roomPicker}>
            <Picker
              selectedValue={newAlert.roomId}
              onValueChange={(itemValue) => setNewAlert({...newAlert, roomId: itemValue})}
            >
              {rooms.map(room => (
                <Picker.Item key={room.id} label={room.name} value={room.id} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.inputLabel}>Alert Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAlert.type === 'technical' && styles.activeTypeButton
              ]}
              onPress={() => setNewAlert({...newAlert, type: 'technical'})}
            >
              <Text style={[
                styles.typeButtonText,
                newAlert.type === 'technical' && styles.activeTypeButtonText
              ]}>
                Technical Issue
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAlert.type === 'overcrowding' && styles.activeTypeButton
              ]}
              onPress={() => setNewAlert({...newAlert, type: 'overcrowding'})}
            >
              <Text style={[
                styles.typeButtonText,
                newAlert.type === 'overcrowding' && styles.activeTypeButtonText
              ]}>
                Overcrowding
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Severity</Text>
          <View style={styles.severitySelector}>
            <TouchableOpacity
              style={[
                styles.severityButton,
                newAlert.severity === 'medium' && styles.activeSeverityButton
              ]}
              onPress={() => setNewAlert({...newAlert, severity: 'medium'})}
            >
              <Text style={[
                styles.severityButtonText,
                newAlert.severity === 'medium' && styles.activeSeverityButtonText
              ]}>
                Medium
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.severityButton,
                newAlert.severity === 'high' && styles.activeSeverityButton
              ]}
              onPress={() => setNewAlert({...newAlert, severity: 'high'})}
            >
              <Text style={[
                styles.severityButtonText,
                newAlert.severity === 'high' && styles.activeSeverityButtonText
              ]}>
                High
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter alert details"
            multiline={true}
            numberOfLines={4}
            value={newAlert.message}
            onChangeText={text => setNewAlert({...newAlert, message: text})}
          />
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={addNewAlert}
            >
              <Text style={styles.confirmButtonText}>Create Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const AddRoomModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddRoomModal}
      onRequestClose={() => setShowAddRoomModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Room</Text>
          
          <Text style={styles.inputLabel}>Room Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter room name"
            value={newRoom.name}
            onChangeText={text => setNewRoom({...newRoom, name: text})}
          />
          
          <Text style={styles.inputLabel}>Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter capacity"
            keyboardType="numeric"
            value={newRoom.capacity}
            onChangeText={text => setNewRoom({...newRoom, capacity: text})}
          />
          
          <Text style={styles.inputLabel}>Speaker/Activity (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter speaker name or activity"
            value={newRoom.speaker}
            onChangeText={text => setNewRoom({...newRoom, speaker: text})}
          />
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddRoomModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={addNewRoom}
            >
              <Text style={styles.confirmButtonText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const QRScanModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showQRScanModal}
      onRequestClose={() => setShowQRScanModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Scan Attendee QR Code</Text>
          
          <Text style={styles.inputLabel}>Select Room</Text>
          <View style={styles.roomPicker}>
            <Picker
              selectedValue={selectedRoomForScan}
              onValueChange={(itemValue) => setSelectedRoomForScan(itemValue)}
            >
              {rooms.map(room => (
                <Picker.Item key={room.id} label={room.name} value={room.id} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.qrScannerPlaceholder}>
            <Text style={styles.qrScannerText}>QR Scanner Placeholder</Text>
            <Text style={styles.qrScannerHint}>Point camera at attendee's QR code</Text>
          </View>
          
          <Text style={styles.inputLabel}>Or Enter Manually</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter QR code data"
            value={scannedQRCode}
            onChangeText={text => setScannedQRCode(text)}
          />
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowQRScanModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => processAttendeeQRCode(scannedQRCode)}
            >
              <Text style={styles.confirmButtonText}>Process Attendee</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Main App Render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Avijozi Dashboard</Text>
        <Text style={styles.headerSubtitle}>Professional Event Management</Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'rooms' && styles.activeTab]}
            onPress={() => setActiveTab('rooms')}
          >
            <Text style={[styles.tabIcon, activeTab === 'rooms' && styles.activeTabIcon]}>{Icons.room}</Text>
            <Text style={[styles.tabLabel, activeTab === 'rooms' && styles.activeTabLabel]}>Rooms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabIcon, activeTab === 'analytics' && styles.activeTabIcon]}>{Icons.analytics}</Text>
            <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.activeTabLabel]}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'alerts' && styles.activeTab]}
            onPress={() => setActiveTab('alerts')}
          >
            <Text style={[styles.tabIcon, activeTab === 'alerts' && styles.activeTabIcon]}>{Icons.alert}</Text>
            <Text style={[styles.tabLabel, activeTab === 'alerts' && styles.activeTabLabel]}>Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabIcon, activeTab === 'settings' && styles.activeTabIcon]}>{Icons.settings}</Text>
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'rooms' && <RoomsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </View>
      
      {/* Modals */}
      <AddAttendeeModal />
      <AddAlertModal />
      <AddRoomModal />
      <QRScanModal />
      <RoomDemographicsModal />
    </SafeAreaView>
  );
};

// Avijozi Styles - Updated with Pink, White, Black, Turquoise, Yellow color scheme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.text,
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.background,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  container: {
    flex: 1,
    backgroundColor: colors.lightPink,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 24,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  activeTabIcon: {
    color: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  roomsGrid: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningRoomCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.warning,
  },
  criticalRoomCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.error,
  },
  roomHeader: {
    marginBottom: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  roomSpeaker: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  roomCapacity: {
    alignItems: 'center',
    marginVertical: 10,
  },
  capacityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  capacityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  roomProgress: {
    height: 6,
    backgroundColor: colors.lightPink,
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  roomStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  qrButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  qrButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
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
    color: colors.error,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 10,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    marginBottom: 20,
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
  professionalSettingsSection: {
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
  professionalSectionTitle: {
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
  professionalRoleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  professionalRoleButton: {
    flex: 1,
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfessionalRoleButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  professionalRoleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  activeProfessionalRoleButtonText: {
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
  professionalStatCard: {
    width: '48%',
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  professionalStatIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.primary,
  },
  professionalStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  professionalStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
  },
  professionalStatStatus: {
    fontSize: 10,
    color: colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  professionalInfoCard: {
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
  supportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportCard: {
    width: '30%',
    backgroundColor: colors.lightPink,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  supportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  supportSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
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
    width: '90%',
    maxHeight: '80%',
  },
  largeModal: {
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
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
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    color: colors.text,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightPink,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeGenderButton: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeGenderButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  roomPicker: {
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    marginBottom: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightPink,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  severitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightPink,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeSeverityButton: {
    backgroundColor: colors.primary,
  },
  severityButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeSeverityButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
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
  qrScannerPlaceholder: {
    height: 200,
    backgroundColor: colors.lightPink,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  qrScannerText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  qrScannerHint: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
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
  chartFooter: {
    marginTop: 15,
  },
  chartFooterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chartSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  insightItem: {
    alignItems: 'center',
    width: '30%',
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.primary,
  },
  insightTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
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
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: '30%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  normalStatus: {
    backgroundColor: colors.lightTurquoise,
  },
  warningStatus: {
    backgroundColor: colors.yellow,
  },
  criticalStatus: {
    backgroundColor: colors.secondary,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutChart: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  donutSegment: {
    height: '100%',
  },
  donutCenter: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  donutCenterLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  barChartContainer: {
    marginBottom: 20,
  },
  barChartScroll: {
    flexGrow: 0,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  bar: {
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },
});

export default EventDashboard;
