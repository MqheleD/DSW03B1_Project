import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Svg, Rect, Circle, Path, Text as SvgText } from "react-native-svg";

export default function EventMapScreen() {
  // Dynamic screen dimensions with listener for orientation changes
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Original content dimensions (aspect ratio 1:1)
  const originalWidth = 1000;
  const originalHeight = 1000;

  // Calculate dynamic SVG dimensions to maintain aspect ratio
  const { svgWidth, svgHeight, scaleFactor } = useMemo(() => {
    const screenAspect = dimensions.width / dimensions.height;
    const contentAspect = originalWidth / originalHeight;

    let width, height;
    if (screenAspect > contentAspect) {
      // Screen is wider than content - height determines size
      height = dimensions.height;
      width = height * contentAspect;
    } else {
      // Screen is taller than content - width determines size
      width = dimensions.width;
      height = width / contentAspect;
    }

    return {
      svgWidth: width,
      svgHeight: height,
      scaleFactor: width / originalWidth
    };
  }, [dimensions]);

  // Event data
  const events = [
    {
      id: 1,
      x: 300,
      y: 300,
      title: "Keynote Stage",
      type: "Main Stage",
      description: "Opening keynote with industry leaders from Pixar, Blizzard, and Industrial Light & Magic",
      schedule: "Day 1 - 9:00 AM",
      icon: "🎤",
      category: "All"
    },
    {
      id: 2,
      x: 700,
      y: 300,
      title: "Animation Workshops",
      type: "Workshop",
      description: "Hands-on sessions for 2D/3D animation techniques with professional animators",
      schedule: "Day 1 - 11:00 AM | Day 2 - 2:00 PM",
      icon: "🎨",
      category: "Animation"
    },
    {
      id: 3,
      x: 500,
      y: 600,
      title: "VR Gaming Arena",
      type: "Interactive",
      description: "Try the latest VR games and hardware from leading developers",
      schedule: "All Days - Ongoing",
      icon: "🎮",
      category: "Gaming"
    },
    {
      id: 4,
      x: 200,
      y: 700,
      title: "VFX Breakdowns",
      type: "Presentation",
      description: "Behind-the-scenes looks at VFX from blockbuster films and shows",
      schedule: "Day 2 - 3:00 PM | Day 3 - 10:00 AM",
      icon: "🎥",
      category: "VFX"
    },
    {
      id: 5,
      x: 800,
      y: 700,
      title: "Career Fair",
      type: "Networking",
      description: "Meet with recruiters from top animation, gaming, and VFX studios",
      schedule: "Day 3 - 12:00 PM to 5:00 PM",
      icon: "💼",
      category: "All"
    },
    {
      id: 6,
      x: 500,
      y: 1100,
      title: "Closing Ceremony",
      type: "Celebration",
      description: "Wrap-up event with awards and highlights from the festival",
      schedule: "Day 3 - 5:00 PM",
      icon: "🎉",
      category: "All"
    }
  ];

  // Scale event coordinates to new dimensions
  const scaledEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      x: event.x * scaleFactor,
      y: event.y * scaleFactor,
      r: 60 * scaleFactor
    }));
  }, [scaleFactor]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values
  const scale = useSharedValue(1); // Now starts at 1 since we're scaling the content
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset map to initial position and scale
  const resetMap = () => {
    scale.value = withTiming(1, { duration: 300 });
    translateX.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // Gesture handlers (unchanged)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(resetMap);

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      scale.value = withTiming(
        Math.min(Math.max(scale.value, 0.5)), // Minimum zoom
        { duration: 200 }
      );
      savedScale.value = scale.value;
    })

  // Compose gestures
  const composedGestures = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
    console.log(`Event pressed: ${event.title}`);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <Text style={styles.navTitle}>AVIJOZI {new Date().getFullYear()}</Text>
        </View>

        <View style={styles.mapContainer}>
          <GestureDetector gesture={composedGestures}>
            <Animated.View style={[styles.svgContainer, animatedStyle]}>
              <Svg
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${originalWidth} ${originalHeight}`}
              >
                {/* Grid */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Path d={`M ${i * 100} 0 L ${i * 100} 1000`} stroke="#ccc" strokeWidth="2" />
                    <Path d={`M 0 ${i * 100} L 1000 ${i * 100}`} stroke="#ccc" strokeWidth="2" />
                  </React.Fragment>
                ))}

                {/* Your event circles */}
                {events.map(event => (
                  <Circle
                    key={event.id}
                    cx={event.x}
                    cy={event.y}
                    r={60}
                    fill={getEventColor(event.category)}

                    // This is a little buggy, but it works sometimes
                    onPress={() => {
                      handleEventPress(event);
                      // alert(Event: ${event.title});
                      console.log(`Event: ${event.title}`);
                    }}
                  />
                ))}
              </Svg>
            </Animated.View>
          </GestureDetector>
        {/* Event Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedEvent && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getEventColor(selectedEvent.category) }]}>
                      <Text style={styles.categoryText}>{selectedEvent.category}</Text>
                    </View>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.eventIconContainer}>
                      <Text style={styles.eventIcon}>{selectedEvent.icon}</Text>
                      <Text style={styles.eventType}>{selectedEvent.type}</Text>
                    </View>

                    <Text style={styles.modalDescription}>{selectedEvent.description}</Text>

                    <View style={styles.scheduleContainer}>
                      <Text style={styles.scheduleLabel}>SCHEDULE</Text>
                      <Text style={styles.scheduleText}>{selectedEvent.schedule}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
        </View>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Helper function to get color based on event category
const getEventColor = (category) => {
  switch (category) {
    case "Animation": return "#FF9E3F";
    case "Gaming": return "#6B5B95";
    case "VFX": return "#2EC4B6";
    case "Networking": return "#F7B7A3";
    case "Celebration": return "#000000";
    default: return "#E71D36";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  navBar: {
    height: 80,
    backgroundColor: "#2B2D42",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e8f4f8",
  },
  svgContainer: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    zIndex: 1000,
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "blue",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2B2D42",
    marginBottom: 10,
    textAlign: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  modalBody: {
    padding: 20,
  },
  eventIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  eventIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    color: "#6B5B95",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  modalDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "center",
  },
  scheduleContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  scheduleLabel: {
    fontSize: 12,
    color: "#6B5B95",
    fontWeight: "600",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  scheduleText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#2B2D42",
    padding: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});