import * as Location from 'expo-location';
import { useEffect, useRef, useState, useContext } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { ThemeContext } from "@/hooks/ThemeContext";

export default function MapScreen() {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showCompass, setShowCompass] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showFilterTray, setShowFilterTray] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { currentColors, isDarkMode } = useContext(ThemeContext);
  
  
  // Filtering state
  const [activeFilters, setActiveFilters] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  const mapRef = useRef(null);

  // Location categories for filtering
  const locationCategories = [
    { id: 'stage', name: 'Stages', icon: 'microphone', color: '#FF6B6B', active: true },
    { id: 'food', name: 'Food Courts', icon: 'restaurant', color: '#4ECDC4', active: true },
    { id: 'gaming', name: 'Gaming Zones', icon: 'videogame-asset', color: '#45B7D1', active: true },
    { id: 'workshop', name: 'Workshops', icon: 'school', color: '#F9A826', active: true },
    { id: 'toilet', name: 'Restrooms', icon: 'wc', color: '#6A89CC', active: true },
    { id: 'entrance', name: 'Entrances', icon: 'door-sliding', color: '#A55EEA', active: true },
    { id: 'firstaid', name: 'First Aid', icon: 'local-hospital', color: '#FC5C65', active: true },
    { id: 'parking', name: 'Parking', icon: 'local-parking', color: '#26DE81', active: true },
    { id: 'lounge', name: 'Lounges', icon: 'weekend', color: '#9b59b6', active: true },
    { id: 'info', name: 'Info Desks', icon: 'info', color: '#3498db', active: true },
    { id: 'media', name: 'Media', icon: 'ondemand-video', color: '#e67e22', active: true },
    { id: 'exhibit', name: 'Exhibits', icon: 'art-track', color: '#1abc9c', active: true },
    { id: 'HQ', name: 'Headquarters', icon: 'corporate-fare', color: '#7f8c8d', active: true },
    { id: 'studio', name: 'Studios', icon: 'live-tv', color: '#d35400', active: true },
  ];

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
    
    // Initialize active filters with all category IDs
    setActiveFilters(locationCategories.map(cat => cat.id));
    setFilteredCategories(locationCategories);
    
    return () => subscription?.remove();
  }, []);

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery) {
      setFilteredCategories(
        locationCategories.filter(category =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(locationCategories);
    }
  }, [searchQuery]);

  // Toggle filter category
  const toggleFilter = (categoryId) => {
    if (activeFilters.includes(categoryId)) {
      setActiveFilters(activeFilters.filter(id => id !== categoryId));
    } else {
      setActiveFilters([...activeFilters, categoryId]);
    }
  };

  // Map configuration
  const eventLocation = {
    latitude: -26.1217898,
    longitude: 28.0463631,
    latitudeDelta: 0.0015,
    longitudeDelta: 0.0015,
  };

  // Sample points of interest
  const pointsOfInterest = [
    {
      "id": "1",
      "title": "Main Entrance",
      "latitude": -26.1219,
      "longitude": 28.0464,
      "type": "entrance"
    },
    {
      "id": "2",
      "title": "Parking Lot",
      "latitude": -26.1217,
      "longitude": 28.0462,
      "type": "parking"
    },
    {
      "id": "3",
      "title": "Chocolate Fountain",
      "latitude": -26.120792,
      "longitude": 28.045650,
      "type": "gaming"
    },
    {
      "id": "4",
      "title": "Bean Bag Garden",
      "latitude": -26.120509,
      "longitude": 28.045719,
      "type": "gaming"
    },
    {
      "id": "5",
      "title": "Restroom A",
      "latitude": -26.119957,
      "longitude": 28.045547,
      "type": "toilet"
    },
    {
      "id": "6",
      "title": "Drone Zone",
      "latitude": -26.12067,
      "longitude": 28.045329,
      "type": "lounge"
    },
    {
      "id": "7",
      "title": "First Aid",
      "latitude": -26.120560,
      "longitude": 28.045513,
      "type": "firstaid"
    },
    {
      "id": "8",
      "title": "Stands",
      "latitude": -26.120129,
      "longitude": 28.045772,
      "type": "exhibit"
    },
    {
      "id": "9",
      "title": "Food Court A",
      "latitude": -26.120295,
      "longitude": 28.045932,
      "type": "food"
    },
    {
      "id": "10",
      "title": "Food Court B",
      "latitude": -26.120101,
      "longitude": 28.046176,
      "type": "food"
    },
    {
      "id": "11",
      "title": "Event Entrance",
      "latitude": -26.121129,
      "longitude": 28.045683,
      "type": "entrance"
    },
    {
      "id": "12",
      "title": "Headquarters",
      "latitude": -26.121057,
      "longitude": 28.046391,
      "type": "HQ"
    },
    {
      "id": "13",
      "title": "Studio 7",
      "latitude": -26.120913,
      "longitude": 28.046226,
      "type": "studio"
    },
    {
      "id": "14",
      "title": "Restroom",
      "latitude": -26.120989,
      "longitude": 28.046131,
      "type": "toilet"
    },
    {
      "id": "15",
      "title": "Crew Parking B",
      "latitude": -26.120727,
      "longitude": 28.046299,
      "type": "parking"
    },
    {
      "id": "16",
      "title": "Studio 6",
      "latitude": -26.1209978,
      "longitude": 28.046003,
      "type": "studio"
    },
    {
      "id": "17",
      "title": "Studio 5",
      "latitude": -26.1209875,
      "longitude": 28.045858,
      "type": "studio"
    },
    {
      "id": "18",
      "title": "Help Desk",
      "latitude": -26.120994,
      "longitude": 28.045641,
      "type": "info"
    },
    {
      "id": "19",
      "title": "Media Wall",
      "latitude": -26.120997,
      "longitude": 28.045728,
      "type": "media"
    },
    {
      "id": "20",
      "title": "VIP Lounge",
      "latitude": -26.120457,
      "longitude": 28.046088,
      "type": "lounge"
    },
    {
      "id": "21",
      "title": "Rose Garden",
      "latitude": -26.120356,
      "longitude": 28.045373,
      "type": "workshop"
    },
    {
      "id": "22",
      "title": "Gaming Expo Cinema",
      "latitude": -26.120943,
      "longitude": 28.045271,
      "type": "gaming"
    },
    {
      "id": "23",
      "title": "Studio 1",
      "latitude": -26.120859,
      "longitude": 28.045761,
      "type": "studio"
    },
    {
      "id": "24",
      "title": "Studio 2",
      "latitude": -26.120732,
      "longitude": 28.045880,
      "type": "studio"
    },
    {
      "id": "25",
      "title": "Studio 3",
      "latitude": -26.120525,
      "longitude": 28.046,
      "type": "studio"
    },
    {
      "id": "26",
      "title": "Studio 4",
      "latitude": -26.12061893208052,
      "longitude": 28.04595,
      "type": "studio"
    },
    {
      "id": "27",
      "title": "Coffee Shop",
      "latitude": -26.120525,
      "longitude": 28.04594,
      "type": "food"
    },
    {
      "id": "28",
      "title": "VIP Restroom",
      "latitude": -26.120587,
      "longitude": 28.046059,
      "type": "toilet"
    }
  ];

  // Filter points of interest based on active filters
  const filteredPOIs = pointsOfInterest.filter(poi => 
    activeFilters.includes(poi.type)
  );

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
    mapRef.current?.getCamera().then(camera => {
      const newRegion = {
        ...camera.region,
        latitudeDelta: camera.region.latitudeDelta / 2,
        longitudeDelta: camera.region.longitudeDelta / 2,
      };
      animateToRegion(newRegion);
    });
  };

  const zoomOut = () => {
    mapRef.current?.getCamera().then(camera => {
      const newRegion = {
        ...camera.region,
        latitudeDelta: camera.region.latitudeDelta * 2,
        longitudeDelta: camera.region.longitudeDelta * 2,
      };
      animateToRegion(newRegion);
    });
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

  const resetMap = () => {
    animateToRegion(eventLocation);
  }

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
          {filteredPOIs.map(poi => {
            const category = locationCategories.find(cat => cat.id === poi.type);
            return (
              <Marker
                key={poi.id}
                coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                title={poi.title}
                description={poi.description}
                onPress={() => handleMarkerPress(poi)}
              >
                <View style={[styles.marker, { backgroundColor: category?.color || '#4285F4' }]}>
                  <MaterialIcons 
                    name={category?.icon || 'place'} 
                    size={16} 
                    color="white" 
                  />
                </View>
              </Marker>
            );
          })}
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
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Filter Tray */}
        {showFilterTray && (
          <View style={[styles.filterTray, { backgroundColor: currentColors.navBarBackground }]}>
            <Text style={[styles.filterTitle, {color: currentColors.textPrimary}]}>Filter Locations</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location types..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView style={styles.filterScroll}>
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterItem,
                    { opacity: activeFilters.includes(category.id) ? 1 : 0.5 }
                  ]}
                  onPress={() => toggleFilter(category.id)}
                >
                  <View style={[styles.filterColor, { backgroundColor: category.color }]} />
                  <MaterialIcons 
                    name={category.icon} 
                    size={20} 
                    color={category.color} 
                    style={styles.filterIcon} 
                  />
                  <Text style={[styles.filterText, {color: currentColors.textPrimary}]}>{category.name}</Text>
                  <View style={styles.spacer} />
                  {activeFilters.includes(category.id) ? (
                    <Ionicons name="checkbox" size={20} color={category.color} />
                  ) : (
                    <Ionicons name="square-outline" size={20} color="#7f8c8d" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Reset Filters Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setActiveFilters(locationCategories.map(cat => cat.id));
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeTrayButton}
              onPress={() => setShowFilterTray(false)}
            >
              <Text style={styles.closeTrayText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          {/* Location Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: currentColors.navBarBackground }]}
            onPress={centerOnUserLocation}
          >
            <FontAwesome6 name="location-crosshairs" size={24} color={currentColors.primaryButton} />
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: currentColors.navBarBackground }]}
            onPress={() => setShowFilterTray(!showFilterTray)}
          >
            <Ionicons name="filter" size={24} color="#4285F4" />
          </TouchableOpacity>

          {/* Reset Map */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: currentColors.navBarBackground }]}
            onPress={resetMap}
          >
            <Ionicons name="refresh" size={24} color={currentColors.primaryButton} />
          </TouchableOpacity>
        </View>

        {/* Map Type Selector */}
        <View style={styles.mapTypeSelector}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.activeMapType]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[styles.mapTypeButtonText, mapType === 'standard' && styles.activeMapTypeText]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeMapType]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[styles.mapTypeButtonText, mapType === 'satellite' && styles.activeMapTypeText]}>Satellite</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    flex: 1,
  },
  marker: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  controlsContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  locationButton: {
    // backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTypeSelector: {
    position: 'absolute',
    top: 80,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  mapTypeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeMapType: {
    backgroundColor: '#4285F4',
  },
  mapTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeMapTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterTray: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 300,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  filterIcon: {
    marginRight: 10,
  },
  filterText: {
    fontSize: 15,
    // color: '#2c3e50',
  },
  spacer: {
    flex: 1,
  },
  resetButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeTrayButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeTrayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  modalCoords: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
