import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, StatusBar, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { Svg, Rect, Circle, Path, G } from "react-native-svg";
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

// Sample map tile component (in a real app, you'd use actual map tiles)
const MapTile = ({ x, y, zoom }) => {
  return (
    <Svg width={256} height={256} x={x} y={y}>
      <Rect width={256} height={256} fill="#e8f4f8" stroke="#ccc" strokeWidth={1} />
      <Path d="M0 0 L256 256" stroke="#ccc" strokeWidth={1} />
      <Path d="M256 0 L0 256" stroke="#ccc" strokeWidth={1} />
      <SvgText x={128} y={128} textAnchor="middle" fill="#999">
        {`Zoom: ${zoom}`}
      </SvgText>
    </Svg>
  );
};

export default function MapScreen() {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapType, setMapType] = useState('standard'); // 'standard', 'satellite', 'terrain'
  const [showTraffic, setShowTraffic] = useState(false);
  const [showCompass, setShowCompass] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Map configuration
  const eventLocation = {
    latitude: -26.1217898,
    longitude: 28.0463631,
    latitudeDelta: 0.0015,  // Tight zoom for a venue-level view
    longitudeDelta: 0.0015,
  };

  // Sample points of interest
  const pointsOfInterest = [
    {
      "id": "1",
      "title": "Main Stage",
      "latitude": -26.1219,
      "longitude": 28.0464,
      "type": "stage"
    },
    {
      "id": "2",
      "title": "Food Court",
      "latitude": -26.1217,
      "longitude": 28.0462,
      "type": "food"
    }
  ];

  const handleMapPress = (e) => {
    console.log("Map pressed at coordinate:", e.nativeEvent.coordinate);
  };

  const handleMarkerPress = (marker) => {
    console.log("Marker pressed:", marker.title);
    setSelectedPOI(marker);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPOI(null);
  };

  const animateToRegion = (region) => {
    mapRef.current?.animateToRegion(region, 1000);
  };

  const zoomIn = () => {
    const newRegion = {
      ...mapRef.current?.getCamera().then(camera => camera.region),
      latitudeDelta: camera.region.latitudeDelta / 2,
      longitudeDelta: camera.region.longitudeDelta / 2,
    };
    animateToRegion(newRegion);
  };

  const zoomOut = () => {
    const newRegion = {
      ...mapRef.current?.getCamera().then(camera => camera.region),
      latitudeDelta: camera.region.latitudeDelta * 2,
      longitudeDelta: camera.region.longitudeDelta * 2,
    };
    animateToRegion(newRegion);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <SafeAreaView style={styles.container}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={eventLocation}
          scrollEnabled={true}
          initialRegion={eventLocation}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={showCompass}
          showsTraffic={showTraffic}
          mapType={mapType}
          onPress={handleMapPress}
        >
          {pointsOfInterest.map(poi => (
            <Marker
              key={poi.id}
              coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
              title={poi.title}
              description={poi.description}
              onPress={() => handleMarkerPress(poi)}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>{getMarkerIcon(poi.type)}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Event details modal */}

        <Modal
          visible={isModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>

          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedPOI?.title}</Text>
            <Text style={styles.modalType}>Type: {selectedPOI?.type}</Text>
            <Text style={styles.modalCoords}>
              📍 Lat: {selectedPOI?.latitude.toFixed(6)}, Lng: {selectedPOI?.longitude.toFixed(6)}
            </Text>
            {/* Add more detail fields here */}
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          </View>
        </Modal>

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
              <Text style={styles.zoomButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Location Button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnUserLocation}
          >
            <FontAwesome6 name="location-crosshairs" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>

        {/* Map Type Selector */}
        <View style={styles.mapTypeSelector}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.activeMapType]}
            onPress={() => setMapType('standard')}
          >
            <Text style={styles.mapTypeButtonText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeMapType]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={styles.mapTypeButtonText}>Satellite</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'terrain' && styles.activeMapType]}
            onPress={() => setMapType('terrain')}
          >
            <Text style={styles.mapTypeButtonText}>Terrain</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar}>
            <Text style={styles.searchBarText}>Search for places or addresses</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Helper function to get marker icon based on event type
const getMarkerIcon = (type) => {
  switch (type) {
    case "gaming": return "🎮";
    case "masterclass": return "🎓";
    case "food": return "🍔";
    default: return "📍";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: 'transparent',
  },
  zoomControls: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationIcon: {
    width: 24,
    height: 24,
  },
  mapTypeSelector: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeMapType: {
    backgroundColor: '#4285F4',
  },
  mapTypeButtonText: {
    color: '#333',
    fontSize: 14,
  },
  activeMapTypeText: {
    color: 'white',
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBarText: {
    color: '#666',
    fontSize: 16,
  },
  marker: {
    backgroundColor: '#4285F4',
    padding: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalType: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalCoords: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontWeight: '600',
  },
});