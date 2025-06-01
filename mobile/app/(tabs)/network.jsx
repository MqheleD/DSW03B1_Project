import React from 'react';
import {View,SafeAreaView,Text,StyleSheet,Image,ScrollView,TouchableOpacity,Linking,Alert,Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Network() {
  const Width = 30;

  const people = [
     { id: 1, name: "Tiana Mc", title: "Designer", company: "PixelLab", imageUri: null ,linkedin: "https://www.linkedin.com/in/kimberly-zinzile-khumalo-bb16552a9"},
    { id: 2, name: "Lebo M", title: "Developer", company: "CodeSpace", imageUri: null ,linkedin: null},
    { id: 3, name: "Kim Z", title: "game dev", company: "Inkwell", imageUri: null ,linkedin: ""},
    { id: 4, name: "Zola T", title: "Analyst", company: "DataX", imageUri: null ,linkedin: ""},
    { id: 5, name: "Zola T", title: "Analyst", company: "DataX", imageUri: null,linkedin: "" },
    { id: 6, name: "Zola T", title: "Analyst", company: "DataX", imageUri: null,linkedin: "" },
    { id: 7, name: "stdytdftuf", title: "Analyst", company: "fjghjgk", imageUri: null,linkedin: "" },
    { id: 8, name: "vjvjjh", title: "Analyst", company: "vhjvbjhb", imageUri: null,linkedin: "" },

  ];

  const [Visible, setVisible] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState(null);

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity style={styles.tapButton}>
        <Text style={styles.tapText}>Tap to share</Text>
        <View style={[styles.circle, { width: Width, height: Width, borderRadius: Width / 2 }]}>
          <Ionicons name="person-outline" size={20} color="black" />
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {people.length === 0 ? (
          <View style={styles.noConnectionsContainer}>
            <View style={styles.centerConnection}>
              <View style={styles.noConnectionIconCircle}>
                <Ionicons name="person-outline" size={40} color="#333" />
              </View>
              <Text style={styles.noConnectionsText}>No Connections</Text>
              <Text>Dont be shy</Text>
            </View>
          </View>
        ) : (

          /* you can use it to look through data from the database */
          people.map((person) => (
            <TouchableOpacity
              key={person.id}
              style={styles.Container}
              onPress={() => {
                setSelectedPerson(person);
                setVisible(true);
              }}
            >
              <View style={styles.profileRow}>
                {person.imageUri ? (
                  <Image source={{ uri: person.imageUri }} style={styles.profileImage} />
                ) : (
                  <View style={styles.circleIconContainer}>
                    <Ionicons name="person-outline" size={30} color="#333" />
                  </View>
                )}
                <View style={styles.profileDetails}>
                  <Text style={styles.name}>{person.name}</Text>
                  <View style={styles.details}>
                    <Text style={styles.infor}>{person.title}</Text>
                    <Text style={styles.infor}>|</Text>
                    <Text style={styles.infor}>{person.company}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={Visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedPerson && (
              <>
                <Text style={styles.modalTitle}>Profile Info</Text>
                <Text style={styles.modularText}>Name: {selectedPerson.name}</Text>
                <Text style={styles.modularText}>Title: {selectedPerson.title}</Text>
                <Text style={styles.modularText}>Company: {selectedPerson.company}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setVisible(false)}
                    style={styles.buttonClose}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedPerson.linkedin) {
                        Linking.openURL(selectedPerson.linkedin);
                      } else {
                        Alert.alert("No LinkedIn profile available");
                      }
                    }}
                    style={styles.buttonLinkedIn}
                  >
                    <Text style={styles.buttonText}>View LinkedIn</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  tapButton: {
    backgroundColor: "#000000",
    marginTop: "10%",
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  tapText: {
    color: "white",
    marginBottom: 10,
    fontSize: 16,
  },
  circle: {
    backgroundColor: '#FF7A7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  Container: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#E5E4E2",
    borderColor: "#C0C0C0",
    borderWidth: 1,
    borderRadius: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "grey",
  },
  profileDetails: {
    marginLeft: 10,
  },
  name: {
    color: "#000000",
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: "row",
    marginTop: 4,
  },
  infor: {
    marginRight: 4,
    color: "#FF7A7A",
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#FF7A7A"
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  buttonClose: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonLinkedIn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'black',
  },
  modularText: {
    color: "white"
  },
  noConnectionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  polaroidContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  noConnectionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noConnectionsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
});
