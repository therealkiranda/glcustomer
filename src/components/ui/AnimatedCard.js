// src/components/ui/AnimatedCard.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedCard({ children, onPress, style, delay = 0 }) {
  const { theme } = useTheme();
  const opacity   = useSharedValue(0);
  const translateY= useSharedValue(24);
  const scale     = useSharedValue(1);

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn  = () => { scale.value = withSpring(0.975, { damping: 15, stiffness: 300 }); };
  const handlePressOut = () => { scale.value = withSpring(1,     { damping: 15, stiffness: 300 }); };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.card,
        { backgroundColor: theme.white, borderColor: theme.border },
        style,
        animStyle,
      ]}
    >
      {children}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
});
