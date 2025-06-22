import {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '@/hooks/ThemeContext';

export default function Network() {
  const Width = 30;

  const people = [
    {
      id: 1,
      name: 'Tiana Mc',
      title: 'Designer',
      company: 'PixelLab',
      imageUri: null,
      linkedin: 'https://www.linkedin.com/in/kimberly-zinzile-khumalo-bb16552a9',
      Email: 'kimzinzile@gmail.com',
    },
    {
      id: 2,
      name: 'Lebo M',
      title: 'Developer',
      company: 'CodeSpace',
      imageUri: null,
      linkedin: null,
      Email: null,
    },
    {
      id: 3,
      name: 'Kim Z',
      title: 'game dev',
      company: 'Inkwell',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
    {
      id: 4,
      name: 'Zola T',
      title: 'Analyst',
      company: 'DataX',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
    {
      id: 5,
      name: 'Zola T',
      title: 'Analyst',
      company: 'DataX',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
    {
      id: 6,
      name: 'Zola T',
      title: 'Analyst',
      company: 'DataX',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
    {
      id: 7,
      name: 'stdytdftuf',
      title: 'Analyst',
      company: 'fjghjgk',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
    {
      id: 8,
      name: 'vjvjjh',
      title: 'Analyst',
      company: 'vhjvbjhb',
      imageUri: null,
      linkedin: '',
      Email: null,
    },
  ];

  const [Visible, setVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { currentColors } = useContext(ThemeContext);

const handleEmail = ({ email }) => {
  const subject = 'Great connecting at Avijozi';
  const body = 'Hi there,\n\nI’m contacting you regarding our connection at Avijozi. Let’s keep in touch.';
  const mailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(mailUrl);
};


  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: currentColors.background }]}>
      <TouchableOpacity style={[styles.tapButton, { backgroundColor: currentColors.cardBackground }]} onPress={() => setVisible(true)}>
        <Text style={[styles.tapText, {color: currentColors.textPrimary}]}>Tap to share</Text>
        <View style={[styles.circle, { width: Width, height: Width, borderRadius: Width / 2, backgroundColor: currentColors.primaryButton }]}>
          <Ionicons name="person-outline" size={20} color="black" />
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
          {people.length === 0 ? (
            <View style={styles.noConnectionsContainer}>
              <View style={styles.centerConnection}>
                <View style={styles.noConnectionIconCircle}>
                  <Ionicons name="person-outline" size={40} color="#333" />
                </View>
                <Text style={styles.noConnectionsText}>No Connections</Text>
                <Text>Don't be shy</Text>
              </View>
            </View>
          ) : (
            people.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={[styles.Container, { backgroundColor: currentColors.cardBackground }]}
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
                    <Text style={[styles.name, {color: currentColors.textPrimary}]}>{person.name}</Text>
                    <View style={styles.details}>
                      <Text style={[styles.infor, {color: currentColors.secondaryButton}]}>{person.title}</Text>
                      <Text style={styles.infor}>|</Text>
                      <Text style={[styles.infor, {color: currentColors.secondaryButton}]}>{person.company}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

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
                  <TouchableOpacity onPress={() => setVisible(false)} style={styles.buttonClose}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedPerson.linkedin) {
                        Linking.openURL(selectedPerson.linkedin);
                      } else {
                        Alert.alert('No LinkedIn profile available');
                      }
                    }}
                    style={styles.buttonLinkedIn}
                  >
                    <Text style={styles.buttonText}>View LinkedIn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedPerson.Email) {
                        let email = selectedPerson.Email;
                        handleEmail({ email });
                      } else {
                        Alert.alert('Email unavailable');
                      }
                    }}
                    style={styles.buttonLinkedIn}
                  >
                    <Text style={styles.buttonText}>Email</Text>
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
    backgroundColor: 'white',
  },
  tapButton: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
    paddingTop: 15,
    elevation: 5,
  },
  tapText: {
    color: 'white',
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
  Container: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#f2f4ff',
    minHeight: 100,
    borderColor: '#e3f0f4',
    elevation: 2,
    borderWidth: 2,
    borderRadius: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: '#CEDFE8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccddcb',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'grey',
  },
  profileDetails: {
    marginLeft: 10,
  },
  name: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    marginTop: 4,
  },
  infor: {
    marginRight: 4,
    color: '#FF7A7A',
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
    color: '#FF7A7A',
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
    color: 'white',
  },
  noConnectionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
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