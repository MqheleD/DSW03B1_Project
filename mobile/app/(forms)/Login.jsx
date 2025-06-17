import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from "../supabaseClient";
import { UserAuth } from '@/hooks/AuthContext';

export default function Login() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name,setName]=useState('');
  const [surname,setSurnameName]=useState('');
  const [email,setEmail]=useState('');
  const [emailError, setEmailError] = useState('');


   const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('*Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const { session, signInUser } = UserAuth();
  console.log(session);

  //login logic
  const handleLogin = async () => {
     try {
      const result = await signInUser(email, password)  
      if (result.success) {
        Alert.alert('Logged in successfully!');
        router.navigate('/(tabs)/home')
      }
    }
    catch (error){
      console.log("there was an error: ", error)
    }
  }
 

  return (
    <View style={styles.container}>
      
      <View style={styles.SignupDesign}>
        <Text style={styles.Heading}>LOGIN</Text>
        <View style={styles.inputContainer}>
          <TextInput value={name} style={styles.inputfield} placeholder="Name:"  onChangeText={setName}/>
          <TextInput value={surname} style={styles.inputfield} placeholder="Surname:"  onChangeText={setSurnameName} />
          <Text  style={{color:'red'}}>{emailError}</Text>
          <TextInput 
            keyboardType="email-address"
             autoCapitalize="none"
            value={email}
            style={styles.inputfield}
            placeholder="Email:"
            onChangeText={validateEmail}/>
       
  <View style={styles.passwordContainer}>
  <TextInput
    style={[{ flex: 1,}]}
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

  

      <TouchableOpacity onPress={() => router.navigate('/(forms)/ForgotPassword')}>
      <Text style={styles.linkText}>Forgot Password?</Text>
       </TouchableOpacity>
        </View>
      </View>

  <View style={{ marginLeft: "50%", marginTop: "64%" }}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ fontSize: 16, marginRight: 5 }}>Login</Text>
    <TouchableOpacity
      onPress={() => router.navigate('/(tabs)/home')}
      // onPress={handleLogin}
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

   <TouchableOpacity onPress={() => router.navigate('/(forms)/SignIn')}>
     <Text style={styles.linkText}>Sign up?</Text>
  </TouchableOpacity>
 
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  SignupDesign: {
    backgroundColor: '#003459',
    width: '100%',
    height: '50%',
    alignItems: 'center',
    borderBottomRightRadius: '10%',
    borderBottomLeftRadius: '20%',
    paddingTop: '30%',
    elevation: 2,
  },
  Heading: {
    color: '#95B2CA',
    fontWeight: 'bold',
    fontSize: 25,
    marginBottom: 40,
    textShadowColor: '#112250',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    width: '92%',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    elevation: 2,
    paddingTop: '10%',
    paddingBottom: '10%',
    alignItems: 'center',
  },
  inputfield: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: 'black',
    marginLeft: '5%',
    marginBottom: '5%',
    width: '90%',
    padding: 8,
    elevation: 2,
  },
  buttonGroup: {
    marginTop: 30,
    width: '90%',
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#dddddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
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


