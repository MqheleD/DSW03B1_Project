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
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';

export default function Signin() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([
    { label: 'Guest', value: 'guest' },
    { label: 'Speaker', value: 'speaker' },
  ]);

  // Form fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: Add Supabase signup logic here
    alert('Signed up successfully!');
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
        <Text style={styles.Heading}>Sign Up</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <TextInput style={styles.inputfield} value={name} onChangeText={setName} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Surname:</Text>
            <TextInput style={styles.inputfield} value={surname} onChangeText={setSurname} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.inputfield}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>City:</Text>
            <TextInput style={styles.inputfield} value={city} onChangeText={setCity} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Country:</Text>
            <TextInput style={styles.inputfield} value={country} onChangeText={setCountry} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.inputfield}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confirm:</Text>
            <TextInput
              style={styles.inputfield}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
            />
          </View>
        </View>

        <Text style={styles.dropdownLabel}>Select Role:</Text>
        <View style={{ zIndex: 1000, width: '90%' }}>
          <DropDownPicker
            open={open}
            value={role}
            items={roles}
            setOpen={setOpen}
            setValue={(callback) => setRole(callback(role))}
            setItems={setRoles}
            placeholder="Select Role"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
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

        <TouchableOpacity style={styles.customButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate('/(forms)/Login')}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
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
    color: '#FF4E4E',
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
    marginTop: 10,
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
    marginTop: 20,
    color: 'black',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
