import React, { useState, useEffect } from 'react';
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

// Color scheme - Pink, White, Black with modern gradients
const colors = {
  primary: '#E91E63',
  secondary: '#FCE4EC',
  accent: '#AD1457',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#757575',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  overlay: 'rgba(0,0,0,0.5)',
  chartColors: ['#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FF9800'],
  gradientStart: '#E91E63',
  gradientEnd: '#AD1457',
  cardShadow: 'rgba(233, 30, 99, 0.1)',
};

// Simple icons as text
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
};

// Mock data - Updated for larger festival
const initialRooms = [
  { id: 1, name: 'Animation Studio', capacity: 250, currentOccupancy: 185, status: 'normal', speaker: 'John Lasseter' },
  { id: 2, name: 'VFX Lab', capacity: 200, currentOccupancy: 140, status: 'normal', speaker: 'Kathleen Kennedy' },
  { id: 3, name: 'Film Screening', capacity: 500, currentOccupancy: 425, status: 'warning', speaker: 'Christopher Nolan' },
  { id: 4, name: 'Interactive Tech', capacity: 300, currentOccupancy: 225, status: 'normal', speaker: 'Hideo Kojima' },
  { id: 5, name: 'Networking Hub', capacity: 400, currentOccupancy: 375, status: 'warning', speaker: 'Multiple Speakers' },
  { id: 6, name: 'AI Research', capacity: 150, currentOccupancy: 110, status: 'normal', speaker: 'Fei-Fei Li' },
  { id: 7, name: 'Main Auditorium', capacity: 1000, currentOccupancy: 900, status: 'critical', speaker: 'Kevin Feige' },
  { id: 8, name: 'Game Development', capacity: 350, currentOccupancy: 280, status: 'normal', speaker: 'Shigeru Miyamoto' },
  { id: 9, name: 'Documentary Corner', capacity: 180, currentOccupancy: 145, status: 'normal', speaker: 'Werner Herzog' },
  { id: 10, name: 'Student Showcase', capacity: 200, currentOccupancy: 160, status: 'normal', speaker: 'Various Students' },
];

// Expanded mock attendee data for analytics
const initialAttendees = [
  { id: 1, age: 25, gender: 'male', roomId: 1, timestamp: new Date(), qrCode: 'ATT001' },
  { id: 2, age: 28, gender: 'female', roomId: 2, timestamp: new Date(), qrCode: 'ATT002' },
  { id: 3, age: 22, gender: 'female', roomId: 1, timestamp: new Date(), qrCode: 'ATT003' },
  { id: 4, age: 30, gender: 'male', roomId: 3, timestamp: new Date(), qrCode: 'ATT004' },
  { id: 5, age: 26, gender: 'female', roomId: 4, timestamp: new Date(), qrCode: 'ATT005' },
  { id: 6, age: 35, gender: 'male', roomId: 5, timestamp: new Date(), qrCode: 'ATT006' },
  { id: 7, age: 24, gender: 'female', roomId: 6, timestamp: new Date(), qrCode: 'ATT007' },
  { id: 8, age: 29, gender: 'male', roomId: 7, timestamp: new Date(), qrCode: 'ATT008' },
  { id: 9, age: 31, gender: 'female', roomId: 2, timestamp: new Date(), qrCode: 'ATT009' },
  { id: 10, age: 27, gender: 'male', roomId: 3, timestamp: new Date(), qrCode: 'ATT010' },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: i + 11,
    age: Math.floor(Math.random() * 30) + 18,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    roomId: Math.floor(Math.random() * 10) + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    qrCode: `ATT${String(i + 11).padStart(3, '0')}`
  }))
];

const initialAlerts = [
  { 
    id: 1, 
    roomId: 7, 
    type: 'overcrowding', 
    message: 'Main Auditorium is at 90% capacity', 
    severity: 'high', 
    timestamp: new Date(),
    sentToWorkers: true,
  },
  { 
    id: 2, 
    roomId: 3, 
    type: 'technical', 
    message: 'Audio issues reported in Film Screening room', 
    severity: 'medium', 
    timestamp: new Date(),
    sentToWorkers: false,
  },
];

// Custom Chart Components for React Native
const PieChart = ({ data, size = 150 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;
  
  return (
    <View style={[styles.chartContainer, { width: size, height: size }]}>
      <View style={styles.pieChartBase}>
        {data.map((item, index) => {
          const percentage = item.value / data.reduce((sum, d) => sum + d.value, 0);
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage * circumference;
          cumulativePercentage += percentage;
          
          return (
            <View
              key={index}
              style={[
                styles.pieSlice,
                {
                  backgroundColor: colors.chartColors[index % colors.chartColors.length],
                  transform: [
                    { rotate: `${(cumulativePercentage - percentage) * 360}deg` }
                  ]
                }
              ]}
            />
          );
        })}
      </View>
      <View style={styles.pieChartCenter}>
        <Text style={styles.pieChartCenterText}>
          {data.reduce((sum, d) => sum + d.value, 0)}
        </Text>
        <Text style={styles.pieChartCenterLabel}>Total</Text>
      </View>
    </View>
  );
};

const BarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <View style={[styles.barChartContainer, { height }]}>
      <View style={styles.barChart}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60);
          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={styles.barValue}>{item.value}</Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: colors.chartColors[index % colors.chartColors.length],
                  }
                ]}
              />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const LineChart = ({ data, height = 150 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const width = screenWidth - 80;
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - 40 - ((item.value / maxValue) * (height - 60))
  }));

  return (
    <View style={[styles.lineChartContainer, { height }]}>
      <View style={styles.lineChart}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              { bottom: 20 + ratio * (height - 40) }
            ]}
          />
        ))}
        
        {/* Data points */}
        {points.map((point, index) => (
          <View key={index}>
            <View
              style={[
                styles.dataPoint,
                {
                  left: point.x - 4,
                  bottom: height - point.y - 4
                }
              ]}
            />
            <Text
              style={[
                styles.dataLabel,
                {
                  left: point.x - 15,
                  bottom: 5
                }
              ]}
            >
              {data[index].label}
            </Text>
          </View>
        ))}
        
        {/* Line connecting points */}
        <View style={styles.line} />
      </View>
    </View>
  );
};

const DonutChart = ({ data, size = 120 }) => {
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
                  backgroundColor: colors.chartColors[index % colors.chartColors.length],
                  width: `${percentage}%`,
                }
              ]}
            />
          );
        })}
      </View>
      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterText}>{total}</Text>
      </View>
    </View>
  );
};

const AVIJOZIDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [userRole, setUserRole] = useState('admin');
  const [rooms, setRooms] = useState(initialRooms);
  const [attendees, setAttendees] = useState(initialAttendees);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [analyticsView, setAnalyticsView] = useState('overview'); // 'overview', 'demographics', 'rooms'
  
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

  // Generate real-time hourly data based on actual attendee check-ins
  const generateHourlyData = () => {
    const now = new Date();
    const hours = [];
    
    // Generate last 8 hours of data
    for (let i = 7; i >= 0; i--) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const hourStart = new Date(hour);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      // Count attendees who checked in during this hour
      const attendeesInHour = attendees.filter(attendee => {
        const checkInTime = new Date(attendee.timestamp);
        return checkInTime >= hourStart && checkInTime < hourEnd;
      }).length;
      
      // Add some simulated activity if no real data
      const simulatedActivity = Math.floor(Math.random() * 20) + 5;
      const totalActivity = attendeesInHour + simulatedActivity;
      
      hours.push({
        label: hour.getHours() === 0 ? '12AM' : 
               hour.getHours() === 12 ? '12PM' :
               hour.getHours() > 12 ? `${hour.getHours() - 12}PM` : `${hour.getHours()}AM`,
        value: totalActivity,
        realCheckins: attendeesInHour
      });
    }
    
    return hours;
  };

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
    { label: 'Male', value: maleCount },
    { label: 'Female', value: femaleCount },
  ];

  const ageChartData = Object.entries(ageGroups).map(([label, value]) => ({
    label,
    value
  }));

  const roomOccupancyData = rooms.map(room => ({
    label: room.name.split(' ')[0],
    value: Math.round((room.currentOccupancy / room.capacity) * 100)
  }));

  const hourlyData = generateHourlyData();

  const topRoomsData = rooms
    .map(room => ({
      name: room.name,
      attendees: attendees.filter(a => a.roomId === room.id).length,
      capacity: room.capacity,
      occupancy: Math.round((room.currentOccupancy / room.capacity) * 100)
    }))
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 5);

  // Enhanced Analytics Tab with modern charts
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

            {/* Real-time Activity Chart */}
            <View style={styles.modernAnalyticsCard}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.modernCardTitle}>Hourly Check-in Activity</Text>
                <Text style={styles.liveIndicator}>🔴 LIVE</Text>
              </View>
              <Text style={styles.chartDescription}>
                Shows attendee check-ins and room entries per hour (last 8 hours)
              </Text>
              <LineChart data={hourlyData} height={180} />
              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterText}>
                  📊 Current hour: {hourlyData[hourlyData.length - 1]?.realCheckins || 0} real check-ins
                </Text>
              </View>
            </View>

            {/* Quick Insights */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Quick Insights</Text>
              <View style={styles.insightsGrid}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{Icons.fire}</Text>
                  <Text style={styles.insightTitle}>Peak Hour</Text>
                  <Text style={styles.insightValue}>
                    {(() => {
                      const maxHour = hourlyData.reduce((max, hour) => hour.value > max.value ? hour : max, hourlyData[0]);
                      return maxHour?.label || '4:00 PM';
                    })()}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{Icons.star}</Text>
                  <Text style={styles.insightTitle}>Most Popular</Text>
                  <Text style={styles.insightValue}>
                    {(() => {
                      const maxRoom = topRoomsData[0];
                      return maxRoom?.name?.split(' ')[0] || 'Main Auditorium';
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
                <DonutChart data={genderChartData} size={140} />
                <View style={styles.chartLegend}>
                  {genderChartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: colors.chartColors[index] }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Age Distribution with Bar Chart */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Age Distribution</Text>
              <BarChart data={ageChartData} height={220} />
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
            {/* Room Occupancy Chart */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Room Occupancy Levels</Text>
              <BarChart data={roomOccupancyData} height={200} />
            </View>

            {/* Top Performing Rooms */}
            <View style={styles.modernAnalyticsCard}>
              <Text style={styles.modernCardTitle}>Top Performing Rooms</Text>
              {topRoomsData.map((room, index) => (
                <View key={index} style={styles.topRoomItem}>
                  <View style={styles.topRoomRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.topRoomInfo}>
                    <Text style={styles.topRoomName}>{room.name}</Text>
                    <Text style={styles.topRoomStats}>{room.attendees} attendees • {room.occupancy}% capacity</Text>
                  </View>
                  <View style={styles.topRoomMetric}>
                    <Text style={styles.topRoomValue}>{room.attendees}</Text>
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

  // Keep original components for other tabs
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
        updateRoomOccupancy(selectedRoomForScan, 1);
        
        Alert.alert(
          'Success', 
          `${attendeeData.name || 'Attendee'} checked into ${rooms.find(r => r.id === selectedRoomForScan)?.name}`
        );
      }
      
      setShowQRScanModal(false);
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code format');
    }
  };

  const processManualQR = () => {
    if (!scannedQRCode) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }
    
    const mockQRData = {
      id: scannedQRCode,
      age: Math.floor(Math.random() * 30) + 18,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      name: `Attendee ${scannedQRCode}`
    };
    
    processAttendeeQRCode(JSON.stringify(mockQRData));
    setScannedQRCode('');
  };

  const updateAttendeeRoom = (attendeeId, newRoomId) => {
    setAttendees(prevAttendees => 
      prevAttendees.map(attendee => 
        attendee.id === attendeeId 
          ? { ...attendee, roomId: newRoomId, timestamp: new Date() }
          : attendee
      )
    );
    Alert.alert('Success', 'Attendee moved to new room');
  };

  const updateRoomOccupancy = (roomId, change) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              currentOccupancy: Math.max(0, Math.min(room.capacity, room.currentOccupancy + change)),
            }
          : room
      )
    );
  };

  const addAttendee = () => {
    if (!newAttendee.age) {
      Alert.alert('Error', 'Please enter attendee age');
      return;
    }

    const attendee = {
      id: attendees.length + 1,
      age: parseInt(newAttendee.age),
      gender: newAttendee.gender,
      roomId: newAttendee.roomId,
      timestamp: new Date(),
      qrCode: `ATT${String(attendees.length + 1).padStart(3, '0')}`
    };

    setAttendees([...attendees, attendee]);
    
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === newAttendee.roomId 
          ? { ...room, currentOccupancy: Math.min(room.capacity, room.currentOccupancy + 1) }
          : room
      )
    );

    setNewAttendee({ age: '', gender: 'male', roomId: rooms[0]?.id || 1 });
    setShowAddAttendeeModal(false);
    Alert.alert('Success', 'Attendee added successfully!');
  };

  const addAlert = () => {
    if (!newAlert.message) {
      Alert.alert('Error', 'Please enter alert message');
      return;
    }

    const alert = {
      id: alerts.length + 1,
      ...newAlert,
      timestamp: new Date(),
      sentToWorkers: userRole === 'admin',
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ roomId: rooms[0]?.id || 1, type: 'technical', message: '', severity: 'medium' });
    setShowAlertModal(false);
    
    if (userRole === 'admin') {
      Alert.alert('Success', 'Alert sent to all workers!');
    } else {
      Alert.alert('Success', 'Alert created successfully!');
    }
  };

  const addRoom = () => {
    if (!newRoom.name || !newRoom.capacity) {
      Alert.alert('Error', 'Please fill in all room details');
      return;
    }

    const room = {
      id: rooms.length + 1,
      name: newRoom.name,
      capacity: parseInt(newRoom.capacity),
      speaker: newRoom.speaker || 'TBA',
      currentOccupancy: 0,
      status: 'normal',
    };

    setRooms([...rooms, room]);
    setNewRoom({ name: '', capacity: '', speaker: '' });
    setShowAddRoomModal(false);
    Alert.alert('Success', 'Room added successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.success;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.success;
    }
  };

  const getRoomAnalytics = (roomId) => {
    const roomAttendees = attendees.filter(a => a.roomId === roomId);
    const ageGroups = {
      '18-24': roomAttendees.filter(a => a.age >= 18 && a.age <= 24).length,
      '25-34': roomAttendees.filter(a => a.age >= 25 && a.age <= 34).length,
      '35-44': roomAttendees.filter(a => a.age >= 35 && a.age <= 44).length,
      '45+': roomAttendees.filter(a => a.age >= 45).length,
    };
    
    return {
      total: roomAttendees.length,
      male: roomAttendees.filter(a => a.gender === 'male').length,
      female: roomAttendees.filter(a => a.gender === 'female').length,
      avgAge: roomAttendees.reduce((sum, a) => sum + a.age, 0) / roomAttendees.length || 0,
      youngestAge: roomAttendees.length > 0 ? Math.min(...roomAttendees.map(a => a.age)) : 0,
      oldestAge: roomAttendees.length > 0 ? Math.max(...roomAttendees.map(a => a.age)) : 0,
      ageGroups: ageGroups,
      attendees: roomAttendees
    };
  };

  // Room Card Component
  const RoomCard = ({ room }) => {
    const roomAnalytics = getRoomAnalytics(room.id);
    
    return (
      <TouchableOpacity 
        style={styles.roomCard}
        onPress={() => {
          setSelectedRoom(room);
          setShowRoomDemographicsModal(true);
        }}
      >
        <View style={styles.roomHeader}>
          <Text style={styles.roomIcon}>{Icons.room}</Text>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomSpeaker}>{Icons.speaker} {room.speaker}</Text>
            <View style={styles.roomStats}>
              <Text style={styles.roomCapacity}>
                {Icons.users} {room.currentOccupancy}/{room.capacity}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(room.status) }]}>
                <Text style={styles.statusText}>{room.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          {userRole === 'worker' && (
            <TouchableOpacity
              style={styles.qrScanButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedRoomForScan(room.id);
                setShowQRScanModal(true);
              }}
            >
              <Text style={styles.qrScanIcon}>{Icons.qr}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((room.currentOccupancy / room.capacity) * 100, 100)}%`,
                  backgroundColor: getStatusColor(room.status)
                }
              ]} 
            />
          </View>
          <Text style={styles.percentageText}>
            {Math.round((room.currentOccupancy / room.capacity) * 100)}%
          </Text>
        </View>

        <View style={styles.roomAnalyticsPreview}>
          <Text style={styles.roomAnalyticsText}>
            👨 {roomAnalytics.male} | 👩 {roomAnalytics.female} | Avg: {roomAnalytics.avgAge.toFixed(1)}y
          </Text>
          <Text style={styles.tapToViewDetails}>Tap to view detailed demographics</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Rooms Tab
  const RoomsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Room Status</Text>
        <View style={styles.headerButtons}>
          {userRole === 'admin' && (
            <>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowAddRoomModal(true)}
              >
                <Text style={styles.buttonIcon}>{Icons.plus}</Text>
                <Text style={styles.buttonText}>Add Room</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowAddAttendeeModal(true)}
              >
                <Text style={styles.buttonIcon}>{Icons.users}</Text>
                <Text style={styles.buttonText}>Add Attendee</Text>
              </TouchableOpacity>
            </>
          )}
          {userRole === 'worker' && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowQRScanModal(true)}
            >
              <Text style={styles.buttonIcon}>{Icons.scan}</Text>
              <Text style={styles.buttonText}>Scan QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {rooms.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </ScrollView>
  );

  // Alerts Tab
  const AlertsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Room Problems & Alerts</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowAlertModal(true)}
        >
          <Text style={styles.buttonIcon}>{Icons.plus}</Text>
          <Text style={styles.buttonText}>Add Alert</Text>
        </TouchableOpacity>
      </View>

      {alerts.map(alert => (
        <View key={alert.id} style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>{Icons.alert}</Text>
            <View style={styles.alertInfo}>
              <Text style={styles.alertRoom}>
                {rooms.find(room => room.id === alert.roomId)?.name}
              </Text>
              <Text style={styles.alertType}>{alert.type}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
              <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <View style={styles.alertFooter}>
            <Text style={styles.alertTime}>
              {alert.timestamp.toLocaleTimeString()}
            </Text>
            {alert.sentToWorkers && (
              <Text style={styles.sentStatus}>✓ Sent to Workers</Text>
            )}
          </View>
        </View>
      ))}

      {alerts.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{Icons.bell}</Text>
          <Text style={styles.emptyText}>No active alerts</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>AVIJOZI Festival</Text>
        
        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, userRole === 'admin' && styles.activeRole]}
            onPress={() => setUserRole('admin')}
          >
            <Text style={[styles.roleText, userRole === 'admin' && styles.activeRoleText]}>
              Admin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, userRole === 'worker' && styles.activeRole]}
            onPress={() => setUserRole('worker')}
          >
            <Text style={[styles.roleText, userRole === 'worker' && styles.activeRoleText]}>
              Worker
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={styles.tabIcon}>{Icons.room}</Text>
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Rooms
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={styles.tabIcon}>{Icons.analytics}</Text>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={styles.tabIcon}>{Icons.bell}</Text>
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'rooms' && <RoomsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'alerts' && <AlertsTab />}

      {/* Modals */}
      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQRScanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan Attendee QR Code</Text>
            
            <Text style={styles.inputLabel}>Selected Room:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroller}>
              {rooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.roomChip, selectedRoomForScan === room.id && styles.activeRoomChip]}
                  onPress={() => setSelectedRoomForScan(room.id)}
                >
                  <Text style={[styles.roomChipText, selectedRoomForScan === room.id && styles.activeRoomChipText]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.manualQRContainer}>
              <Text style={styles.inputLabel}>Manual QR Code (for testing):</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter QR code (e.g., ATT001)"
                placeholderTextColor={colors.textSecondary}
                value={scannedQRCode}
                onChangeText={setScannedQRCode}
              />
              <TouchableOpacity
                style={styles.processQRButton}
                onPress={processManualQR}
              >
                <Text style={styles.processQRButtonText}>Process QR Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qrFormatExample}>
              <Text style={styles.qrFormatTitle}>Expected QR Code Format:</Text>
              <Text style={styles.qrFormatText}>
                {`{"id": "ATT001", "age": 25, "gender": "male", "name": "John Doe"}`}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQRScanModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Attendee Modal */}
      <Modal
        visible={showAddAttendeeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddAttendeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Attendee</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor={colors.textSecondary}
              value={newAttendee.age}
              onChangeText={(text) => setNewAttendee({...newAttendee, age: text})}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Gender:</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[styles.genderButton, newAttendee.gender === 'male' && styles.activeGenderButton]}
                onPress={() => setNewAttendee({...newAttendee, gender: 'male'})}
              >
                <Text style={styles.genderButtonIcon}>{Icons.male}</Text>
                <Text style={[styles.genderButtonText, newAttendee.gender === 'male' && styles.activeGenderText]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, newAttendee.gender === 'female' && styles.activeGenderButton]}
                onPress={() => setNewAttendee({...newAttendee, gender: 'female'})}
              >
                <Text style={styles.genderButtonIcon}>{Icons.female}</Text>
                <Text style={[styles.genderButtonText, newAttendee.gender === 'female' && styles.activeGenderText]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Room:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroller}>
              {rooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.roomChip, newAttendee.roomId === room.id && styles.activeRoomChip]}
                  onPress={() => setNewAttendee({...newAttendee, roomId: room.id})}
                >
                  <Text style={[styles.roomChipText, newAttendee.roomId === room.id && styles.activeRoomChipText]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddAttendeeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={addAttendee}
              >
                <Text style={styles.confirmButtonText}>Add Attendee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Room Modal */}
      <Modal
        visible={showAddRoomModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Room</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Room Name"
              placeholderTextColor={colors.textSecondary}
              value={newRoom.name}
              onChangeText={(text) => setNewRoom({...newRoom, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Speaker Name"
              placeholderTextColor={colors.textSecondary}
              value={newRoom.speaker}
              onChangeText={(text) => setNewRoom({...newRoom, speaker: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Capacity"
              placeholderTextColor={colors.textSecondary}
              value={newRoom.capacity}
              onChangeText={(text) => setNewRoom({...newRoom, capacity: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddRoomModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={addRoom}
              >
                <Text style={styles.confirmButtonText}>Add Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Alert Modal */}
      <Modal
        visible={showAlertModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {userRole === 'admin' ? 'Send Alert to Workers' : 'Create Alert'}
            </Text>
            
            <Text style={styles.inputLabel}>Room:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroller}>
              {rooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.roomChip, newAlert.roomId === room.id && styles.activeRoomChip]}
                  onPress={() => setNewAlert({...newAlert, roomId: room.id})}
                >
                  <Text style={[styles.roomChipText, newAlert.roomId === room.id && styles.activeRoomChipText]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Alert message"
              placeholderTextColor={colors.textSecondary}
              value={newAlert.message}
              onChangeText={(text) => setNewAlert({...newAlert, message: text})}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Severity:</Text>
            <View style={styles.severityButtons}>
              {['low', 'medium', 'high'].map(severity => (
                <TouchableOpacity
                  key={severity}
                  style={[styles.severityButton, newAlert.severity === severity && styles.activeSeverityButton]}
                  onPress={() => setNewAlert({...newAlert, severity})}
                >
                  <Text style={[styles.severityButtonText, newAlert.severity === severity && styles.activeSeverityText]}>
                    {severity.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAlertModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={addAlert}
              >
                <Text style={styles.confirmButtonText}>
                  {userRole === 'admin' ? 'Send Alert' : 'Create Alert'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Room Demographics Modal */}
      <Modal
        visible={showRoomDemographicsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoomDemographicsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.demographicsModalContent}>
            {selectedRoom && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRoom.name} Demographics</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowRoomDemographicsModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  {(() => {
                    const analytics = getRoomAnalytics(selectedRoom.id);
                    const genderData = [
                      { label: 'Male', value: analytics.male },
                      { label: 'Female', value: analytics.female }
                    ];
                    const ageData = Object.entries(analytics.ageGroups).map(([label, value]) => ({
                      label,
                      value
                    }));
                    
                    return (
                      <>
                        {/* Room Info Summary */}
                        <View style={styles.roomSummaryCard}>
                          <View style={styles.roomSummaryHeader}>
                            <Text style={styles.roomSummaryTitle}>{selectedRoom.name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRoom.status) }]}>
                              <Text style={styles.statusText}>{selectedRoom.status.toUpperCase()}</Text>
                            </View>
                          </View>
                          <Text style={styles.roomSummarySpeaker}>{Icons.speaker} {selectedRoom.speaker}</Text>
                          <View style={styles.roomSummaryStats}>
                            <Text style={styles.roomSummaryCapacity}>
                              Capacity: {selectedRoom.currentOccupancy}/{selectedRoom.capacity} 
                              ({Math.round((selectedRoom.currentOccupancy / selectedRoom.capacity) * 100)}%)
                            </Text>
                            <Text style={styles.roomSummaryAttendees}>
                              Checked-in Attendees: {analytics.total}
                            </Text>
                          </View>
                        </View>

                        {analytics.total > 0 ? (
                          <>
                            {/* Quick Stats Grid */}
                            <View style={styles.quickStatsGrid}>
                              <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{analytics.total}</Text>
                                <Text style={styles.quickStatLabel}>Total Attendees</Text>
                              </View>
                              <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{analytics.avgAge.toFixed(1)}y</Text>
                                <Text style={styles.quickStatLabel}>Average Age</Text>
                              </View>
                              <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{analytics.male}</Text>
                                <Text style={styles.quickStatLabel}>Male</Text>
                              </View>
                              <View style={styles.quickStatCard}>
                                <Text style={styles.quickStatNumber}>{analytics.female}</Text>
                                <Text style={styles.quickStatLabel}>Female</Text>
                              </View>
                            </View>

                            {/* Gender Distribution */}
                            <View style={styles.demographicsSection}>
                              <Text style={styles.sectionTitle}>Gender Distribution</Text>
                              <View style={styles.chartRow}>
                                <DonutChart data={genderData} size={120} />
                                <View style={styles.chartLegend}>
                                  {genderData.map((item, index) => (
                                    <View key={index} style={styles.legendItem}>
                                      <View style={[styles.legendColor, { backgroundColor: colors.chartColors[index] }]} />
                                      <Text style={styles.legendText}>{item.label}</Text>
                                      <Text style={styles.legendValue}>{item.value} ({Math.round((item.value/analytics.total)*100)}%)</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </View>

                            {/* Age Distribution */}
                            <View style={styles.demographicsSection}>
                              <Text style={styles.sectionTitle}>Age Distribution</Text>
                              <BarChart data={ageData} height={180} />
                              <View style={styles.ageStatsRow}>
                                <Text style={styles.ageStatText}>Youngest: {analytics.youngestAge}y</Text>
                                <Text style={styles.ageStatText}>Oldest: {analytics.oldestAge}y</Text>
                                <Text style={styles.ageStatText}>Range: {analytics.oldestAge - analytics.youngestAge}y</Text>
                              </View>
                            </View>

                            {/* Detailed Breakdown */}
                            <View style={styles.demographicsSection}>
                              <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
                              <View style={styles.detailsGrid}>
                                {Object.entries(analytics.ageGroups).map(([ageGroup, count], index) => (
                                  <View key={index} style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>{ageGroup} years</Text>
                                    <Text style={styles.detailValue}>{count}</Text>
                                    <Text style={styles.detailPercentage}>
                                      {analytics.total > 0 ? Math.round((count/analytics.total)*100) : 0}%
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>

                            {/* Recent Check-ins */}
                            <View style={styles.demographicsSection}>
                              <Text style={styles.sectionTitle}>Recent Check-ins</Text>
                              {analytics.attendees
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .slice(0, 5)
                                .map((attendee, index) => (
                                  <View key={index} style={styles.attendeeItem}>
                                    <Text style={styles.attendeeIcon}>
                                      {attendee.gender === 'male' ? Icons.male : Icons.female}
                                    </Text>
                                    <View style={styles.attendeeInfo}>
                                      <Text style={styles.attendeeDetails}>
                                        {attendee.qrCode} • Age {attendee.age} • {attendee.gender}
                                      </Text>
                                      <Text style={styles.attendeeTime}>
                                        {attendee.timestamp.toLocaleTimeString()}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              {analytics.attendees.length > 5 && (
                                <Text style={styles.moreAttendeesText}>
                                  +{analytics.attendees.length - 5} more attendees
                                </Text>
                              )}
                            </View>
                          </>
                        ) : (
                          <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>{Icons.users}</Text>
                            <Text style={styles.emptyText}>No checked-in attendees yet</Text>
                            <Text style={styles.emptySubtext}>
                              Use QR scanner to check attendees into this room
                            </Text>
                          </View>
                        )}
                      </>
                    );
                  })()}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    minWidth: 70,
    alignItems: 'center',
  },
  activeRole: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeRoleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.3,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginLeft: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 6,
  },
  buttonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Enhanced Analytics Styles
  analyticsNav: {
    marginBottom: 20,
  },
  analyticsNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeAnalyticsNav: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  analyticsNavIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  analyticsNavText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeAnalyticsNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Modern Summary Cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modernSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.1)',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  cardTrend: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Modern Analytics Cards
  modernAnalyticsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.05)',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.3,
  },
  liveIndicator: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  chartFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartFooterText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Quick Insights
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },

  // Chart Components
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartBase: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    backgroundColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: 0,
    left: '50%',
    transformOrigin: '0 100%',
  },
  pieChartCenter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pieChartCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  pieChartCenterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  barChartContainer: {
    paddingVertical: 10,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  lineChartContainer: {
    paddingVertical: 10,
    position: 'relative',
  },
  lineChart: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dataLabel: {
    position: 'absolute',
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    opacity: 0.6,
  },

  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChart: {
    flexDirection: 'row',
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  donutSegment: {
    height: '100%',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartLegend: {
    flex: 1,
    marginLeft: 20,
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
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  chartSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Demographics Details
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  detailPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Top Rooms
  topRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.03)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  topRoomRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topRoomInfo: {
    flex: 1,
  },
  topRoomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  topRoomStats: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topRoomMetric: {
    alignItems: 'center',
  },
  topRoomValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Status Grid
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  normalStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  warningStatus: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  criticalStatus: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Original styles
  roomCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  roomSpeaker: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomCapacity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  qrScanButton: {
    backgroundColor: colors.accent,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  qrScanIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    minWidth: 35,
  },
  roomAnalyticsPreview: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roomAnalyticsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tapToViewDetails: {
    fontSize: 10,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Room Demographics Modal Styles
  demographicsModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 0,
    width: screenWidth - 20,
    maxHeight: screenHeight * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roomSummaryCard: {
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  roomSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  roomSummarySpeaker: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  roomSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomSummaryCapacity: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  roomSummaryAttendees: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickStatCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  demographicsSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  ageStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ageStatText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(233, 30, 99, 0.03)',
    borderRadius: 8,
    marginBottom: 8,
  },
  attendeeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeDetails: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  attendeeTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moreAttendeesText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertRoom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  alertType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sentStatus: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  manualQRContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  processQRButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  processQRButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrFormatExample: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  qrFormatTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  qrFormatText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  genderButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.background,
  },
  activeGenderButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  activeGenderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roomScroller: {
    marginBottom: 15,
  },
  roomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.background,
  },
  activeRoomChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roomChipText: {
    fontSize: 12,
    color: colors.text,
  },
  activeRoomChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  severityButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  activeSeverityButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  activeSeverityText: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AVIJOZIDashboard;
