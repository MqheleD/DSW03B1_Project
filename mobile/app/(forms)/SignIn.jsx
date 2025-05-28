import React, { useState } from 'react';
import { StyleSheet,Text, TextInput, View,TouchableOpacity, Text as RNText, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Login from './Login';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";



export default function Signin() {

const navigation = useNavigation();


  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([
    { label: 'Guest', value: 'guest' },
    { label: 'Speaker', value: 'speaker' }
  ]);



  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.Heading}>SIGN UP</Text>

        <View style={styles.form}>
          {["Name", "Surname", "Email", "City", "Country"].map((field, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.label}>{field}:</Text>
              <TextInput style={styles.inputfield} />
            </View>
          ))}
        </View>

        <Text style={styles.dropdownLabel}>Select Role:</Text>

        <View style={{ zIndex: 1000, width: '90%' }}>
          <DropDownPicker
            open={open}
            value={role}
            items={roles}
            setOpen={setOpen}
            setValue={setRole}
            setItems={setRoles}
            placeholder="Select Role"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
            zIndexInverse={100}
            selectedItemContainerStyle={{ backgroundColor: '#ffc0cb' }}
            selectedItemLabelStyle={{
              color: 'black',
              fontWeight: 'bold',
            }}
            listItemLabelStyle={{
              color: 'black',
            }}
          />
        </View>

        <TouchableOpacity style={styles.customButton} onPress={() => alert('Signed in!')}>
          <RNText style={styles.buttonText}>Sign In</RNText>

        </TouchableOpacity>
  <TouchableOpacity onPress={() => router.navigate('/(forms)/Login')}>
      <Text style={styles.linkText}>Login?</Text>
      </TouchableOpacity>

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
    paddingTop: 50,
    paddingBottom: 50,
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
  dropdownLabel: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: '500',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  dropdown: {
    borderColor: '#000',
    marginTop:50,
  },
  dropdownContainer: {
    borderColor: '#000',
  
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









