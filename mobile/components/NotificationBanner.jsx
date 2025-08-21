// components/NotificationBanner.js
import React, { useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { 
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { ThemeContext } from '@/hooks/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const NOTIFICATION_DURATION = 3000;

export default function NotificationBanner({ 
  message, 
  animation, 
  visible, 
  onHide,
  type = 'info' 
}) {
  const { currentColors } = useContext(ThemeContext);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const progressWidth = useSharedValue(width * 0.9);

  // Define colors based on notification type
  const typeColors = {
    success: currentColors.success,
    error: currentColors.error,
    warning: currentColors.warning,
    info: currentColors.primaryButton,
  };

  const bgColor = typeColors[type] || typeColors.info;

  const hideNotification = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(-100, { duration: 400 }, () => {
      if (onHide) runOnJS(onHide)();
    });
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      // Reset animations
      opacity.value = 0;
      translateY.value = -100;
      progressWidth.value = width * 0.9;
      
      // Play haptic feedback based on type
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Show animation
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { 
        duration: 400,
        easing: Easing.out(Easing.exp)
      });
      
      // Progress bar animation
      progressWidth.value = withTiming(0, { 
        duration: NOTIFICATION_DURATION,
        easing: Easing.linear
      });

      // Auto-hide after duration
      const timeout = setTimeout(hideNotification, NOTIFICATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [visible, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={hideNotification}>
      <Animated.View style={[styles.overlay, animatedStyle]}>
        <View style={[
          styles.container, 
          { backgroundColor: bgColor }
        ]}>
          <LottieView
            source={animation}
            autoPlay
            loop={false}
            style={styles.animation}
            colorFilters={[{
              keypath: "circle",
              color: currentColors.textPrimary
            }]}
          />
          
          <Text 
            style={[
              styles.text,
              { color: currentColors.textPrimary }
            ]} 
            numberOfLines={2}
          >
            {message}
          </Text>
          
          <Animated.View 
            style={[
              styles.progressBar,
              progressStyle,
              { backgroundColor: currentColors.textPrimary }
            ]} 
          />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  container: {
    borderRadius: 12,
    padding: 16,
    width: width * 0.92,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    overflow: 'hidden',
  },
  animation: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 3,
  },
});