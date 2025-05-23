import { StatusBar } from 'expo-status-bar';
import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import Signin from './SignIn';
import { useNavigation } from '@react-navigation/native';

export default function Splash() {
 const navigation = useNavigation();

  const pinkAnim = useRef(new Animated.Value(-300)).current;  
  const whiteAnim = useRef(new Animated.Value(300)).current; 

 useEffect(() => {
    Animated.parallel([
      Animated.timing(pinkAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(whiteAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
    
      setTimeout(() => {
        navigation.replace('Signin'); 
      }, 3000); 
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBlocks}>
        <Animated.View style={[styles.pinkBlock, { transform: [{ translateX: pinkAnim }] }]} />
        <Animated.View style={[styles.whiteBlock, { transform: [{ translateX: whiteAnim }] }]} />
      </View>

      <Image
        source={require('./Splash images/AVI_Jozi_Flyer_ChocolateTribe-removebg-preview (1).png')} 
        style={styles.image}
      />

      <StatusBar style="light" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundBlocks: {
    position: 'absolute',
    height: 210, 
    width: "100%", 
    top: '62%',
    marginTop: -175,
  },
  pinkBlock: {
    backgroundColor: '#E44664',
    width:"50%",
    flex: 1,
   
  },
  whiteBlock: {
    backgroundColor: '#3AD6BD',
    flex: 1,
   
  },
  image: {
    width: 250,
    height: 350,
    resizeMode: 'contain',
    zIndex: 1, 
  },
});

