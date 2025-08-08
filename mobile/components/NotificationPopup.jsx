import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function NotificationPopup({ visible, title, message, onClose }) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide in and play
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();

      lottieRef.current?.play();

      // Auto close after 3 seconds
      const timeout = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          onClose?.();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.popup, { transform: [{ translateY: slideAnim }] }]}>
      <LottieView
        ref={lottieRef}
        source={require('../assets/lottie/Alert Notification Character.json')}
        autoPlay={false}
        loop={true}
        style={styles.lottie}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 9999,
  },
  lottie: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: '#111',
  },
  message: {
    fontSize: 14,
    color: '#555',
  },
});
