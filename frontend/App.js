import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Dummy Data Generator with Individual Room Analytics
const generateDummyData = () => {
  const rooms = [
    {
      id: 1,
      name: 'Main Auditorium',
      type: 'Conference',
      capacity: 500,
      currentAttendees: 432,
      peakAttendees: 487,
      avgSessionTime: '3h 15m',
      satisfactionScore: 4.7,
      temperature: 22.5,
      soundLevel: 'Optimal',
      lightLevel: 'Bright',
      equipment: ['Projector', 'Sound System', 'Microphones'],
      sessions: [
        { time: '09:00', topic: 'Opening Keynote', attendees: 487, duration: 90 },
        { time: '11:00', topic: 'Tech Panel Discussion', attendees: 456, duration: 120 },
        { time: '14:00', topic: 'Networking Session', attendees: 432, duration: 60 },
      ],
      hourlyData: [
        { hour: '09', attendees: 487, engagement: 95 },
        { hour: '10', attendees: 456, engagement: 88 },
        { hour: '11', attendees: 432, engagement: 92 },
        { hour: '12', attendees: 398, engagement: 85 },
        { hour: '13', attendees: 376, engagement: 78 },
        { hour: '14', attendees: 432, engagement: 90 },
        { hour: '15', attendees: 445, engagement: 87 },
        { hour: '16', attendees: 423, engagement: 89 },
      ],
      demographics: {
        gender: [
          { name: 'Female', value: 52, color: '#FF69B4' },
          { name: 'Male', value: 45, color: '#C71585' },
          { name: 'Other', value: 3, color: '#FFB6C1' },
        ],
        age: [
          { name: '18-25', value: 25, color: '#FF1493' },
          { name: '26-35', value: 35, color: '#C71585' },
          { name: '36-45', value: 28, color: '#FF69B4' },
          { name: '46+', value: 12, color: '#FFB6C1' },
        ],
      },
      feedback: {
        content: 4.8,
        venue: 4.6,
        organization: 4.7,
        networking: 4.5,
      },
      issues: [
        { type: 'Audio', status: 'Resolved', time: '10:30', severity: 'Low' },
        { type: 'Temperature', status: 'Monitoring', time: '14:15', severity: 'Medium' },
      ],
    },
    {
      id: 2,
      name: 'Tech Workshop',
      type: 'Workshop',
      capacity: 150,
      currentAttendees: 142,
      peakAttendees: 148,
      avgSessionTime: '2h 45m',
      satisfactionScore: 4.9,
      temperature: 21.8,
      soundLevel: 'Good',
      lightLevel: 'Bright',
      equipment: ['Computers', 'Projector', 'Whiteboards'],
      sessions: [
        { time: '10:00', topic: 'AI Development Workshop', attendees: 148, duration: 180 },
        { time: '14:00', topic: 'Coding Bootcamp', attendees: 142, duration: 240 },
      ],
      hourlyData: [
        { hour: '10', attendees: 148, engagement: 97 },
        { hour: '11', attendees: 145, engagement: 94 },
        { hour: '12', attendees: 138, engagement: 89 },
        { hour: '13', attendees: 125, engagement: 82 },
        { hour: '14', attendees: 142, engagement: 95 },
        { hour: '15', attendees: 140, engagement: 93 },
        { hour: '16', attendees: 138, engagement: 91 },
        { hour: '17', attendees: 135, engagement: 88 },
      ],
      demographics: {
        gender: [
          { name: 'Female', value: 42, color: '#FF69B4' },
          { name: 'Male', value: 56, color: '#C71585' },
          { name: 'Other', value: 2, color: '#FFB6C1' },
        ],
        age: [
          { name: '18-25', value: 45, color: '#FF1493' },
          { name: '26-35', value: 38, color: '#C71585' },
          { name: '36-45', value: 15, color: '#FF69B4' },
          { name: '46+', value: 2, color: '#FFB6C1' },
        ],
      },
      feedback: {
        content: 4.9,
        venue: 4.8,
        organization: 4.9,
        networking: 4.7,
      },
      issues: [],
    },
    {
      id: 3,
      name: 'Creative Studio',
      type: 'Creative',
      capacity: 80,
      currentAttendees: 73,
      peakAttendees: 78,
      avgSessionTime: '2h 20m',
      satisfactionScore: 4.6,
      temperature: 23.2,
      soundLevel: 'Quiet',
      lightLevel: 'Ambient',
      equipment: ['Art Supplies', 'Cameras', 'Lighting'],
      sessions: [
        { time: '11:00', topic: 'Digital Art Workshop', attendees: 78, duration: 150 },
        { time: '15:00', topic: 'Photography Session', attendees: 73, duration: 120 },
      ],
      hourlyData: [
        { hour: '11', attendees: 78, engagement: 92 },
        { hour: '12', attendees: 75, engagement: 89 },
        { hour: '13', attendees: 68, engagement: 85 },
        { hour: '14', attendees: 65, engagement: 81 },
        { hour: '15', attendees: 73, engagement: 88 },
        { hour: '16', attendees: 71, engagement: 86 },
        { hour: '17', attendees: 69, engagement: 84 },
      ],
      demographics: {
        gender: [
          { name: 'Female', value: 65, color: '#FF69B4' },
          { name: 'Male', value: 32, color: '#C71585' },
          { name: 'Other', value: 3, color: '#FFB6C1' },
        ],
        age: [
          { name: '18-25', value: 38, color: '#FF1493' },
          { name: '26-35', value: 42, color: '#C71585' },
          { name: '36-45', value: 18, color: '#FF69B4' },
          { name: '46+', value: 2, color: '#FFB6C1' },
        ],
      },
      feedback: {
        content: 4.7,
        venue: 4.5,
        organization: 4.6,
        networking: 4.4,
      },
      issues: [
        { type: 'Lighting', status: 'Resolved', time: '12:00', severity: 'Low' },
      ],
    },
    {
      id: 4,
      name: 'Networking Lounge',
      type: 'Social',
      capacity: 200,
      currentAttendees: 187,
      peakAttendees: 195,
      avgSessionTime: '1h 45m',
      satisfactionScore: 4.4,
      temperature: 22.8,
      soundLevel: 'Moderate',
      lightLevel: 'Warm',
      equipment: ['Sound System', 'Bar Setup', 'Lounge Furniture'],
      sessions: [
        { time: '12:00', topic: 'Lunch Networking', attendees: 195, duration: 90 },
        { time: '17:00', topic: 'Evening Mixer', attendees: 187, duration: 120 },
      ],
      hourlyData: [
        { hour: '12', attendees: 195, engagement: 78 },
        { hour: '13', attendees: 182, engagement: 75 },
        { hour: '14', attendees: 165, engagement: 72 },
        { hour: '15', attendees: 148, engagement: 69 },
        { hour: '16', attendees: 152, engagement: 71 },
        { hour: '17', attendees: 187, engagement: 76 },
        { hour: '18', attendees: 178, engagement: 74 },
      ],
      demographics: {
        gender: [
          { name: 'Female', value: 48, color: '#FF69B4' },
          { name: 'Male', value: 49, color: '#C71585' },
          { name: 'Other', value: 3, color: '#FFB6C1' },
        ],
        age: [
          { name: '18-25', value: 22, color: '#FF1493' },
          { name: '26-35', value: 45, color: '#C71585' },
          { name: '36-45', value: 25, color: '#FF69B4' },
          { name: '46+', value: 8, color: '#FFB6C1' },
        ],
      },
      feedback: {
        content: 4.2,
        venue: 4.5,
        organization: 4.4,
        networking: 4.8,
      },
      issues: [
        { type: 'Noise Level', status: 'Monitoring', time: '18:30', severity: 'Medium' },
      ],
    },
    {
      id: 5,
      name: 'VIP Lounge',
      type: 'Premium',
      capacity: 50,
      currentAttendees: 45,
      peakAttendees: 48,
      avgSessionTime: '4h 30m',
      satisfactionScore: 4.9,
      temperature: 21.5,
      soundLevel: 'Quiet',
      lightLevel: 'Elegant',
      equipment: ['Premium Seating', 'Private Bar', 'Concierge'],
      sessions: [
        { time: '10:00', topic: 'Executive Breakfast', attendees: 48, duration: 120 },
        { time: '16:00', topic: 'VIP Reception', attendees: 45, duration: 180 },
      ],
      hourlyData: [
        { hour: '10', attendees: 48, engagement: 98 },
        { hour: '11', attendees: 46, engagement: 96 },
        { hour: '12', attendees: 43, engagement: 94 },
        { hour: '13', attendees: 41, engagement: 92 },
        { hour: '14', attendees: 38, engagement: 89 },
        { hour: '15', attendees: 42, engagement: 93 },
        { hour: '16', attendees: 45, engagement: 97 },
        { hour: '17', attendees: 44, engagement: 95 },
      ],
      demographics: {
        gender: [
          { name: 'Female', value: 55, color: '#FF69B4' },
          { name: 'Male', value: 43, color: '#C71585' },
          { name: 'Other', value: 2, color: '#FFB6C1' },
        ],
        age: [
          { name: '18-25', value: 8, color: '#FF1493' },
          { name: '26-35', value: 32, color: '#C71585' },
          { name: '36-45', value: 45, color: '#FF69B4' },
          { name: '46+', value: 15, color: '#FFB6C1' },
        ],
      },
      feedback: {
        content: 4.9,
        venue: 4.8,
        organization: 4.9,
        networking: 5.0,
      },
      issues: [],
    },
  ];

  const overallStats = {
    totalAttendees: rooms.reduce((sum, room) => sum + room.currentAttendees, 0),
    totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
    averageSatisfaction: rooms.reduce((sum, room) => sum + room.satisfactionScore, 0) / rooms.length,
    activeRooms: rooms.length,
    totalSessions: rooms.reduce((sum, room) => sum + room.sessions.length, 0),
    avgTemperature: rooms.reduce((sum, room) => sum + room.temperature, 0) / rooms.length,
    peakHour: '09:00',
    totalRevenue: '$47,832',
    dailyGrowth: '+12.3%',
    checkIns: 1247,
    checkOuts: 368,
    avgDwellTime: '2h 47m'
  };

  return { rooms, overallStats };
};

const StatCard = ({ title, value, subtitle, color = '#FF1493', icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      {icon && <Text style={[styles.statIcon, { color }]}>{icon}</Text>}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const ChartCard = ({ title, children, height = 220 }) => (
  <View style={[styles.chartCard, { height: height + 60 }]}>
    <Text style={styles.chartTitle}>{title}</Text>
    {children}
  </View>
);

const RoomDetailModal = ({ room, visible, onClose }) => {
  if (!room) return null;

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#000',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{room.name} - Detailed Analytics</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Room Status Overview */}
          <View style={styles.statusOverview}>
            <StatCard
              title="Current Occupancy"
              value={`${room.currentAttendees}/${room.capacity}`}
              subtitle={`${Math.round((room.currentAttendees / room.capacity) * 100)}% Full`}
              color="#FF1493"
              icon="👥"
            />
            <StatCard
              title="Satisfaction Score"
              value={`${room.satisfactionScore}/5.0`}
              subtitle="Real-time Rating"
              color="#C71585"
              icon="⭐"
            />
            <StatCard
              title="Avg Session Time"
              value={room.avgSessionTime}
              subtitle="Per Attendee"
              color="#FF69B4"
              icon="⏱️"
            />
            <StatCard
              title="Environment"
              value={`${room.temperature}°C`}
              subtitle={`${room.soundLevel} Sound`}
              color="#FFB6C1"
              icon="🌡️"
            />
          </View>

          {/* Hourly Engagement Chart */}
          <ChartCard title="Hourly Attendance & Engagement" height={250}>
            <LineChart
              data={{
                labels: room.hourlyData.map(h => h.hour),
                datasets: [
                  {
                    data: room.hourlyData.map(h => h.attendees),
                    color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`,
                    strokeWidth: 3,
                  },
                  {
                    data: room.hourlyData.map(h => h.engagement),
                    color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
                legend: ['Attendees', 'Engagement %'],
              }}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ChartCard>

          {/* Gender Demographics */}
          <ChartCard title="Gender Distribution" height={200}>
            <PieChart
              data={room.demographics.gender.map(g => ({
                name: g.name,
                population: g.value,
                color: g.color,
                legendFontColor: '#FFF',
              }))}
              width={screenWidth - 60}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </ChartCard>

          {/* Age Demographics */}
          <ChartCard title="Age Group Distribution" height={200}>
            <BarChart
              data={{
                labels: room.demographics.age.map(a => a.name),
                datasets: [{ data: room.demographics.age.map(a => a.value) }],
              }}
              width={screenWidth - 60}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </ChartCard>

          {/* Feedback Breakdown */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>Detailed Feedback Scores</Text>
            {Object.entries(room.feedback).map(([category, score]) => (
              <View key={category} style={styles.feedbackRow}>
                <Text style={styles.feedbackLabel}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreBar}>
                    <View
                      style={[
                        styles.scoreFill,
                        { width: `${(score / 5) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreText}>{score}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Active Sessions */}
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Today's Sessions</Text>
            {room.sessions.map((session, idx) => (
              <View key={idx} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTime}>{session.time}</Text>
                  <Text style={styles.sessionDuration}>{session.duration}min</Text>
                </View>
                <Text style={styles.sessionTopic}>{session.topic}</Text>
                <Text style={styles.sessionAttendees}>
                  {session.attendees} attendees
                </Text>
              </View>
            ))}
          </View>

          {/* Equipment & Facilities */}
          <View style={styles.facilitiesSection}>
            <Text style={styles.sectionTitle}>Equipment & Facilities</Text>
            <View style={styles.equipmentGrid}>
              {room.equipment.map((item, idx) => (
                <View key={idx} style={styles.equipmentItem}>
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Issues & Alerts */}
          {room.issues.length > 0 && (
            <View style={styles.issuesSection}>
              <Text style={styles.sectionTitle}>Issues & Alerts</Text>
              {room.issues.map((issue, idx) => (
                <View key={idx} style={[
                  styles.issueCard,
                  {
                    borderLeftColor: issue.severity === 'High' ? '#FF4444' :
                      issue.severity === 'Medium' ? '#FF8800' : '#44FF44'
                  }
                ]}>
                  <View style={styles.issueHeader}>
                    <Text style={styles.issueType}>{issue.type}</Text>
                    <Text style={[
                      styles.issueStatus,
                      { color: issue.status === 'Resolved' ? '#44FF44' : '#FF8800' }
                    ]}>
                      {issue.status}
                    </Text>
                  </View>
                  <Text style={styles.issueTime}>Reported at {issue.time}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setData(generateDummyData());
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Avijozi Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartConfig = {
    backgroundColor: '#000',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#000',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
  };

  const openRoomDetails = (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const closeRoomDetails = () => {
    setModalVisible(false);
    setSelectedRoom(null);
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.dashboardTitle}>Avijozi Event Dashboard</Text>
        <Text style={styles.dashboardSubtitle}>Real-time Analytics & Insights</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Attendees"
          value={data.overallStats.totalAttendees.toLocaleString()}
          subtitle={`${Math.round((data.overallStats.totalAttendees / data.overallStats.totalCapacity) * 100)}% Capacity`}
          color="#FF1493"
          icon="👥"
        />
        <StatCard
          title="Active Rooms"
          value={`${data.overallStats.activeRooms}`}
          subtitle={`${data.overallStats.totalSessions} Sessions`}
          color="#C71585"
          icon="🏢"
        />
        <StatCard
          title="Avg Satisfaction"
          value={`${data.overallStats.averageSatisfaction.toFixed(1)}/5.0`}
          subtitle="Across All Rooms"
          color="#FF69B4"
          icon="⭐"
        />
        <StatCard
          title="Revenue Today"
          value={data.overallStats.totalRevenue}
          subtitle="Peak Hour: 9:00 AM"
          color="#FFB6C1"
          icon="💰"
        />
      </View>

      {/* Additional Stats Row */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Check-ins Today"
          value={data.overallStats.checkIns.toLocaleString()}
          subtitle={`${data.overallStats.dailyGrowth} vs yesterday`}
          color="#FF1493"
          icon="📥"
        />
        <StatCard
          title="Avg Dwell Time"
          value={data.overallStats.avgDwellTime}
          subtitle="Per Attendee"
          color="#C71585"
          icon="⏰"
        />
        <StatCard
          title="Peak Attendance"
          value="487"
          subtitle="9:00 AM - Main Auditorium"
          color="#FF69B4"
          icon="📈"
        />
        <StatCard
          title="Live Attendees"
          value={data.overallStats.totalAttendees - data.overallStats.checkOuts}
          subtitle={`${data.overallStats.checkOuts} departed`}
          color="#FFB6C1"
          icon="🏃"
        />
      </View>

      {/* Room Utilization Chart */}
      <ChartCard title="Room Utilization Overview" height={250}>
        <BarChart
          data={{
            labels: data.rooms.map(r => r.name.split(' ')[0]),
            datasets: [{
              data: data.rooms.map(r => Math.round((r.currentAttendees / r.capacity) * 100)),
            }],
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </ChartCard>

      {/* Satisfaction Comparison */}
      <ChartCard title="Room Satisfaction Comparison" height={250}>
        <LineChart
          data={{
            labels: data.rooms.map(r => r.name.split(' ')[0]),
            datasets: [{
              data: data.rooms.map(r => r.satisfactionScore),
            }],
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </ChartCard>

      {/* Hourly Attendance Trends */}
      <ChartCard title="Event-wide Hourly Attendance" height={250}>
        <LineChart
          data={{
            labels: ['09', '10', '11', '12', '13', '14', '15', '16', '17'],
            datasets: [{
              data: [758, 729, 673, 627, 599, 692, 712, 686, 652],
            }],
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </ChartCard>

      {/* Popular Room Rankings */}
      <ChartCard title="Most Popular Rooms by Peak Attendance" height={250}>
        <BarChart
          data={{
            labels: data.rooms.map(r => r.name.split(' ')[0]),
            datasets: [{
              data: data.rooms.map(r => r.peakAttendees),
            }],
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </ChartCard>
    </ScrollView>
  );

  const renderRooms = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.dashboardTitle}>Individual Room Analytics</Text>
        <Text style={styles.dashboardSubtitle}>Tap any room for detailed insights</Text>
      </View>

      {data.rooms.map((room) => (
        <TouchableOpacity
          key={room.id}
          style={styles.advancedRoomCard}
          onPress={() => openRoomDetails(room)}
        >
          <View style={styles.roomCardHeader}>
            <View>
              <Text style={styles.roomCardName}>{room.name}</Text>
              <Text style={styles.roomCardType}>{room.type} Room</Text>
            </View>
            <View style={styles.roomCardBadges}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: room.currentAttendees > room.capacity * 0.8 ? '#FF1493' : '#32CD32' }
              ]}>
                <Text style={styles.statusText}>
                  {room.currentAttendees > room.capacity * 0.8 ? 'Busy' : 'Available'}
                </Text>
              </View>
              <Text style={styles.satisfactionBadge}>★ {room.satisfactionScore}</Text>
            </View>
          </View>

          <View style={styles.roomCardStats}>
            <View style={styles.roomCardStat}>
              <Text style={styles.statNumber}>{room.currentAttendees}</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
            <View style={styles.roomCardStat}>
              <Text style={styles.statNumber}>{room.capacity}</Text>
              <Text style={styles.statLabel}>Capacity</Text>
            </View>
            <View style={styles.roomCardStat}>
              <Text style={styles.statNumber}>{room.peakAttendees}</Text>
              <Text style={styles.statLabel}>Peak Today</Text>
            </View>
            <View style={styles.roomCardStat}>
              <Text style={styles.statNumber}>{room.avgSessionTime}</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
          </View>

          <View style={styles.utilizationBar}>
            <View
              style={[
                styles.utilizationFill,
                {
                  width: `${Math.min(100, (room.currentAttendees / room.capacity) * 100)}%`,
                  backgroundColor: room.currentAttendees > room.capacity * 0.8 ? '#FF1493' : '#C71585'
                }
              ]}
            />
          </View>
          <Text style={styles.utilizationText}>
            {Math.round((room.currentAttendees / room.capacity) * 100)}% Full
          </Text>

          {room.issues.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>
                {room.issues.length} Active Issue{room.issues.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'overview' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'rooms' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('rooms')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'rooms' && styles.activeTabText
          ]}>
            Rooms
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {selectedTab === 'overview' ? renderOverview() : renderRooms()}

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        visible={modalVisible}
        onClose={closeRoomDetails}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  dashboardTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dashboardSubtitle: {
    color: '#AAA',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statTitle: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    color: '#777',
    fontSize: 11,
  },
  chartCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
    marginTop: 10,
  },
  advancedRoomCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    position: 'relative',
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roomCardName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomCardType: {
    color: '#AAA',
    fontSize: 12,
  },
  roomCardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  satisfactionBadge: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roomCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roomCardStat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  statLabel: {
    color: '#777',
    fontSize: 10,
  },
  utilizationBar: {
    height: 5,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 5,
  },
  utilizationText: {
    color: '#AAA',
    fontSize: 12,
    textAlign: 'right',
  },
  alertBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alertText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF1493',
  },
  tabText: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  modalContent: {
    paddingBottom: 30,
  },
  statusOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  feedbackSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedbackLabel: {
    color: '#FFF',
    fontSize: 14,
    width: '30%',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '65%',
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#FF1493',
    borderRadius: 3,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 12,
    width: 25,
    textAlign: 'right',
  },
  sessionsSection: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  sessionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sessionTime: {
    color: '#FF1493',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionDuration: {
    color: '#AAA',
    fontSize: 12,
  },
  sessionTopic: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  sessionAttendees: {
    color: '#AAA',
    fontSize: 12,
  },
  facilitiesSection: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  equipmentItem: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  equipmentText: {
    color: '#FFF',
    fontSize: 14,
  },
  issuesSection: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  issueCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  issueType: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  issueStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  issueTime: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default Dashboard;
