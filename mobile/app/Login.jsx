import React from 'react';
import { StyleSheet,Text, TextInput, View,TouchableOpacity, Text as RNText, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import Signin from './SignIn';
import { useNavigation } from '@react-navigation/native';

export default function Login() {

const navigation = useNavigation();


  return (
    <View style={styles.container}>
     

 <Text style={styles.Heading}>LOGIN</Text>

        <View style={styles.form}>
          {["Name", "Surname", "Email"].map((field, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.label}>{field}:</Text>
              <TextInput style={styles.inputfield} />
            </View>
          ))}
        </View>
     <TouchableOpacity style={styles.customButton} onPress={() => alert('Signed in!')}>
          <RNText style={styles.buttonText}>LOGIN</RNText>

        </TouchableOpacity>
     <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
      <Text style={styles.linkText}>Sign up?</Text></TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   Heading: {
    fontWeight: 'bold',
    fontSize: 25,
    marginBottom: 40,
  },
  form: {
    width: '90%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    width: 80,
    fontWeight: '500',
    fontSize: 16,
    color:'#FF4E4E'
  },
  inputfield: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 8,
  },
   customButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
   linkText: {
    marginTop:20,
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
