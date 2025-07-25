
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from "../supabaseClient";
import { UserAuth } from '@/hooks/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  

  const { session, signInUser } = UserAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/Speaker'); // 🚀 already logged in
    }
  }, [session]);

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('*Invalid email address');
    } else {
      setEmailError('');
    }
  };

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Please fill in both email and password.');
    return;
  }

  try {
    const result = await signInUser(email, password);
    if (result.success) {
      // const fullName = result.profile.full_name || result.profile.name || 'User';
      // Alert.alert(Welcome back, ${fullName}!);
      
      
      // Alert.prompt(user)
      // router.replace('/(tabs)/home');
      // router.replace('/(screens)/Speaker');
    } else {
      Alert.alert('Login failed', result.message || 'Invalid credentials.');
    }
  } catch (error) {
    Alert.alert('Login failed', error.message || 'An unexpected error occurred.');
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.SignupDesign}>
          <Text style={styles.Heading}>LOGIN</Text>
          <View style={styles.inputContainer}>
            <Text style={{ color: 'red' }}>{emailError}</Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email:"
              placeholderTextColor="gray"
              value={email}
              style={styles.inputfield}
              onChangeText={validateEmail}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={{ flex: 1 }}
                value={password}
                placeholder="Password:"
                placeholderTextColor="gray"
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

        <View style={styles.buttonWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center' ,marginTop:'40%',marginBottom:'6%'}}>
            <Text style={{ fontSize: 16, marginRight: 5 }}>Login</Text>
            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.navigate('/(forms)/SignIn')}>
            <Text style={styles.linkText}>Sign up?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 40,
  },
  SignupDesign: {
    backgroundColor: '#003459',
    width: '100%',
    height: '60%',
    alignItems: 'center',
    borderBottomRightRadius: '10%',
    borderBottomLeftRadius: '10%',
    paddingTop: '50%',
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
  linkText: {
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginRight:14
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingRight: '5%',
  },
  loginButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
