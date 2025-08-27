import React, { useState,useEffect } from 'react';
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
   Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import supabase from '../supabaseClient';
import { UserAuth } from '@/hooks/AuthContext';
import * as Asset from 'expo-asset';

export default function Signin() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([
    { label: 'Guest', value: 'guest' },
    { label: 'Speaker', value: 'speaker' },
  ]);

  const [openInterest, setOpenInterest] = useState(false);
  // const [interest, setInterest] = useState(null);
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
  const [organisation, setOrganisation] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]); // Changed to array since multiple interests possible
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

const { session, signUpNewUser, updateProfile } = UserAuth();
  // console.log(session);

  // sign up logic
  // const handleSignup = async (e) => {
  //   if (password !== confirmPassword) {
  //     Alert.alert('Passwords do not match!');
  //     return;
  //   }

  //   console.log("Signing in");

  //   try {
  //     const result = await signUpNewUser(email, password)  
  //     if (result.success) {
  //       Alert.alert('Signed up successfully!');
  //       router.push('/(forms)/Login')
  //     }
  //   }
  //   catch (error) {
  //     console.log("there was an error: ", error)
  //   }
  // }

// const handleSignup = async () => {
//   // Basic validation
//   if (password !== confirmPassword) {
//     Alert.alert('Passwords do not match!');
//     return;
//   }

//   if (!name || !surname || !email || !password || !role) {
//     Alert.alert('Please fill all required fields');
//     return;
//   }

//   try {
//     // Step 1: Sign up the user in Supabase Auth
//     // const { data: signupData, error: signupError } = await supabase.auth.signUp({
//     const { data: signupData, error: signupError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (signupError) throw signupError;

//     if (!signupData.user) {
//       throw new Error('Signup failed. Please check your email for verification.');
//     }

//     // Step 2: Insert additional profile information
//     const { error: profileError } = await supabase
//       .from('attendees')
//       .insert({
//         id: signupData.user.id,  // use the auth ID
//         full_name: name + ' ' + surname,
//         email: email,
//         age: age ? parseInt(age) : null,
//         gender: gender || null,
//         occupation: occupation,
//         organization: organisation,
//         role,
//         city,
//         country,
//         interests,
//       });

//     if (profileError) throw profileError;

//     Alert.alert('Signed up successfully!');
//     router.push('/(forms)/Login');

//   } catch (error) {
//     console.error("Signup Error:", error);
//     Alert.alert('Signup failed', error.message || 'An unexpected error occurred.');
//   }
// };

// const handleSignup = async () => {
//   if (password !== confirmPassword) {
//     Alert.alert('Passwords do not match!');
//     return;
//   }

//   if (!name || !surname || !email || !password || !role) {
//     Alert.alert('Please fill all required fields');
//     return;
//   }

//   try {
//     const result = await signUpNewUser(email, password);

//     if (!result.success) {
//       Alert.alert('Signup failed', result.message || 'An unexpected error occurred.');
//       return;
//     }

//     const user = result.data?.user;
//     if (!user) {
//       Alert.alert('Signup failed', 'User object not returned.');
//       return;
//     }

//     const fullName = `${name} ${surname}`;

//     const { error: profileError } = await supabase
//       .from('attendees')
//       .insert({
//         id: user.id,
//         full_name: fullName,
//         email,
//         age: age ? parseInt(age) : null,
//         gender: gender || null,
//         occupation,
//         organization: organisation || null,
//         country,
//         city,
//         interests: interests.length > 0 ? interests : null,
//         role,
//       });

//     if (profileError) throw profileError;

//     Alert.alert('Signed up successfully!');
//     router.push('/(forms)/Login');
//   } catch (error) {
//     console.error('[Signup Error]', error);
//     Alert.alert('Signup failed', error.message || 'An unexpected error occurred.');
//   }
// };


 useEffect(() => {
  async function preloadImages() {
    await Asset.fromModule(require('../../assets/images/Drones (00000)111.png')).downloadAsync();
    
  }
  preloadImages();
}, []);
const [imageLoaded, setImageLoaded] = useState(false);
const env_master_ = require('../../assets/images/../../assets/images/Drones (00000)111.png');



const handleSignup = async () => {
  if (password !== confirmPassword) {
    Alert.alert('Passwords do not match!');
    return;
  }

  if (!name || !surname || !email || !password || !role) {
    Alert.alert('Please fill all required fields');
    return;
  }

  try {
    const result = await signUpNewUser(email, password);

    if (!result.success) {
      Alert.alert('Signup failed', result.message || 'An unexpected error occurred.');
      return;
    }

    const user = result.data?.user;
    if (!user) {
      Alert.alert('Signup failed', 'User object not returned.');
      return;
    }

    const fullName = `${name} ${surname}`;
    const profileData = {
      id: user.id,
      full_name: fullName,
      email,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      occupation,
      organization: organisation || null,
      country,
      city,
      interests: interests.length > 0 ? interests : null,
      role: role,
    };

    const { error: profileError } = await supabase
      .from('attendees')
      .insert(profileData);

    if (profileError) throw profileError;

    // ✅ Sync profile with context and AsyncStorage
    await updateProfile(profileData);

    Alert.alert('Signed up successfully!');
    router.push('/(forms)/Login');
  } catch (error) {
    console.error('[Signup Error]', error);
    Alert.alert('Signup failed', error.message || 'An unexpected error occurred.');
  }
};



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
                <TextInput style={styles.inputfield} placeholderTextColor="gray" placeholder="Name:" value={name} onChangeText={setName} />
                <TextInput style={styles.inputfield} placeholderTextColor="gray" placeholder="Surname:" value={surname} onChangeText={setSurname} />
                <TextInput style={styles.inputfield} placeholderTextColor="gray" placeholder="Occupation:" value={occupation} onChangeText={setOccupation} />
                <TextInput style={styles.inputfield} placeholderTextColor="gray" placeholder="Organisation:" value={organisation} onChangeText={setOrganisation} />
                <TextInput style={styles.inputfield} placeholderTextColor="gray" keyboardType="numeric" placeholder="Age:" value={age} onChangeText={setAge} />
                <TextInput style={styles.inputfield} placeholderTextColor="gray" value={gender} placeholder="Gender: *Optional" onChangeText={setGender} />
                <TouchableOpacity onPress={() => setShow(false)} style={{ backgroundColor: 'white', marginTop: '5%', borderRadius: 20, padding: 5, elevation: 2 }}>
                  <Ionicons name="chevron-forward-outline" size={30} color="black" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                {/* <TextInput style={styles.inputfield} value={interests} placeholder="Interests:" onChangeText={setInterets} /> */}
                <Text style={{ color: 'red' }}>{emailError}</Text>
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



                <View style={{ zIndex: 2000, width: '90%' }}>
                  <DropDownPicker
                    open={openInterest}
                    value={interests}
                    items={interestsList}
                    setOpen={setOpenInterest}
                    // setValue={(callback) => setInterest(callback(interest))}
                    setValue={setInterests}
                    setItems={setInterestsList}
                    multiple={true}
                    placeholder="Select Interest"
                    style={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                      marginBottom: '5%',
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
                    // setValue={(callback) => setRole(callback(role))}
                    setValue={setRole}
                    setItems={setRoles}
                    placeholder="Select Role"
                    style={{
                      borderWidth: 0,
                      backgroundColor: 'white',
                      elevation: 2,
                      marginBottom: '5%',
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

                <TouchableOpacity onPress={() => setShow(true)} style={{ backgroundColor: 'white', marginTop: '5%', borderRadius: 20, padding: 5, elevation: 2 }}>
                  <Ionicons name="chevron-back-outline" size={30} color="black" />
                </TouchableOpacity>
              </View>

              <View style={{ marginLeft: "50%", marginTop: openInterest ? 250 : "10%" }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop:'40%',marginBttom:'6%'}}>
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
                  <Text style={styles.linkText}>Login?</Text>
                </TouchableOpacity>
                
              </View>
              
            </>
          )}
        </View>
          
      </ScrollView>
    {/*<View style={styles.imageSize}>*/}
        <Image source={env_master_} style={styles.image} />       
      {/*</View>*/}
     
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
  color: 'white',
  fontWeight: 'bold',
  fontSize: 25,
  textShadowColor: '#D10023',
  textShadowOffset: { width: 2, height: 1 },
  textShadowRadius: 2,
   marginBottom: 40,
   paddingTop:0,
   
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
    color: '#f08fa1ff', 
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  SignupDesign: {
    backgroundColor: '#E34664', 
    width: '100%',
    height: '60%',
    alignItems: 'center',
    borderBottomRightRadius: '10%',
    borderBottomLeftRadius: '10%',
    paddingTop: '20%',
    elevation: 2,
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
  image: {
    width: 500,
    height: 450,
    resizeMode: "contain", 
   
  },
  imageSize:{
       marginLeft:0,
        width: '100%', 
        height:'32%', 
       //lignItems:'center' 
  }
});