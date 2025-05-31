import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Touchable, TouchableOpacity,Linking,Alert } from 'react-native';
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

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.tapButton}>
        <Text style={styles.tapText}>Tap to share</Text>
        <View style={[styles.circle, { width: Width, height: Width, borderRadius: Width / 2 }]}>
          <Ionicons name="person-outline" size={20} color="black" />
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* you can use it to look through data from the database */}
        {people.map((person) => (


           /* Link allows for easy navigation to linkedin profile*/
      <TouchableOpacity
  key={person.id}
  style={styles.Container}
  onPress={() =>
    Alert.alert(
      "Profile Info",
      `Name: ${person.name}\nTitle: ${person.title}\nCompany: ${person.company}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View LinkedIn",
          onPress: () => {
            if (person.linkedin) {
              Linking.openURL(person.linkedin);
            } else {
              Alert.alert("No LinkedIn profile available");
            }
          },
        },])}>
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
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  tapButton: {
    backgroundColor: "#000000",
    marginTop: "15%",
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
    paddingBottom: 20,
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
    borderColor: "grey",
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
});


