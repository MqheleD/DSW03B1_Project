import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../supabaseClient';
import { UserAuth } from '@/hooks/AuthContext';

export default function Signin() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([
    { label: 'Guest', value: 'guest' },
    { label: 'Speaker', value: 'speaker' },
  ]);

  const [openInterest, setOpenInterest] = useState(false);
  const [interest, setInterest] = useState(null);
  const [interestsList, setInterestsList] = useState([
    { label: '3D animation', value: '3D animation' },
    { label: 'AI integration', value: 'AI integration' },
    { label: 'VFX', value: 'VFX' },
    { label: 'Character development', value: 'Character development' },
    { label: 'Film and television', value: 'film and television' },
  ]);

  const [show, setShow] = useState(true);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [occupation, setOccupation] = useState('');
  const [organisation, setOgarnisation] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterets] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { session, signUpNewUser } = UserAuth();
  console.log(session);
  
  // sign up logic
  const handleSignup = async (e) => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match!');
      return;
    }

    console.log("Signing in");

    try {
      const result = await signUpNewUser(email, password)  
      if (result.success) {
        Alert.alert('Signed up successfully!');
        router.navigate('/(forms)/Login')
      }
    }
    catch (error) {
      console.log("there was an error: ", error)
    }
  }

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('*Invalid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.SignupDesign}>
          {show ? (
            <>
              <Text style={styles.Heading}>Sign Up</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputfield} placeholder="Name:" value={name} onChangeText={setName} />
                <TextInput style={styles.inputfield} placeholder="Surname:" value={surname} onChangeText={setSurname} />
                <TextInput style={styles.inputfield} placeholder="Occupation:" value={occupation} onChangeText={setOccupation} />
                <TextInput style={styles.inputfield} placeholder="Organisation:" value={organisation} onChangeText={setOgarnisation} />
                <TextInput style={styles.inputfield} keyboardType="numeric" placeholder="Age:" value={age} onChangeText={setAge} />
                <TextInput style={styles.inputfield} value={gender} placeholder="Gender: *Optional" onChangeText={setGender} />
                <TouchableOpacity onPress={() => setShow(false)} style={{ backgroundColor: 'white', marginTop: '5%', borderRadius: 20, padding: 5, elevation: 2 }}>
                  <Ionicons name="chevron-forward-outline" size={30} color="black" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputfield} value={interests} placeholder="Interests:" onChangeText={setInterets} />
                <Text style={{color:'red'}}>{emailError}</Text>
                <TextInput 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  style={styles.inputfield}
                  placeholder="Email:"
                  onChangeText={(text) => {
                    setEmail(text);
                    validateEmail(text)
                  }}
                />
                
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={{ flex: 1 }}
                    value={password}
                    placeholder="Password:"
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <Ionicons
                      name={passwordVisible ? 'eye-off' : 'eye'}
                      size={24}
                      color="gray"
                      style={styles.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={{ flex: 1 }}
                    value={confirmPassword}
                    placeholder="Confirm Password:"
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!passwordVisible}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <Ionicons
                      name={passwordVisible ? 'eye-off' : 'eye'}
                      size={24}
                      color="gray"
                      style={styles.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ zIndex: 2000, width: '90%' }}>
                  <DropDownPicker
                    open={openInterest}
                    value={interest}
                    items={interestsList}
                    setOpen={setOpenInterest}
                    setValue={(callback) => setInterest(callback(interest))}
                    setItems={setInterestsList}
                    placeholder="Select Interest"
                    style={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                    }}
                    dropDownContainerStyle={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                      marginBottom: '20%', 
                    }}
                    selectedItemContainerStyle={{ backgroundColor: '#88A8D1' }}
                    selectedItemLabelStyle={{
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                    listItemLabelStyle={{
                      color: 'black',
                    }}
                  />
                </View>

                <View style={{ zIndex: 1000, width: '90%' }}>
                  <DropDownPicker
                    open={open}
                    value={role}
                    items={roles}
                    setOpen={setOpen}
                    setValue={(callback) => setRole(callback(role))}
                    setItems={setRoles}
                    placeholder="Select Role"
                    style={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                    }}
                    dropDownContainerStyle={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                    }}
                    selectedItemContainerStyle={{ backgroundColor: '#88A8D1' }}
                    selectedItemLabelStyle={{
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                    listItemLabelStyle={{
                      color: 'black',
                    }}
                  />
                </View>

                <TouchableOpacity onPress={() => setShow(true)} style={{ backgroundColor: 'white', marginTop: '5%', borderRadius: 20, padding: 5, elevation: 2 }}>
                  <Ionicons name="chevron-back-outline" size={30} color="black" />
                </TouchableOpacity>
              </View>

              <View style={{ marginLeft: "50%", marginTop: openInterest ? 250 : "10%" }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 5 }}>Sign Up</Text>
                  <TouchableOpacity
                    onPress={handleSignup}
                    style={{
                      backgroundColor: 'black',
                      borderRadius: 20,
                      padding: 5,
                      elevation: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.navigate('/(forms)/Login')}>
                  <Text style={styles.linkText}>Log in?</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 50,
  },
  Heading: {
    color: "#95B2CA",
    fontWeight: 'bold',
    fontSize: 25,
    marginBottom: 40,
    textShadowColor: '#112250',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 2,
    elevation: 2,
    overflow: 'visible',
  },
  inputfield: {
    flex: 1,
    alignSelf: 'flex-start',
    backgroundColor: "white",
    color: "black",
    marginLeft: '5%',
    marginBottom: '5%',
    width: "90%",
    padding: 8,
    elevation: 2
  },
  linkText: {
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  SignupDesign: {
    backgroundColor: "#003459",
    width: "100%",
    height: "50%",
    alignItems: "center",
    borderBottomRightRadius: "10%",
    borderBottomLeftRadius: "20%",
    paddingTop: "30%",
    elevation: 2
  },
  inputContainer: {
    width: '92%',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    elevation: 2,
    paddingTop: "10%",
    paddingBottom: "10%",
    alignItems: "center"
  },
  passwordContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '5%',
    marginBottom: '5%',
    width: '90%',
    paddingHorizontal: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
});