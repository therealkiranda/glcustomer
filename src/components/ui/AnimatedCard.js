// src/components/ui/AnimatedCard.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function AnimatedCard({ children, onPress, style }) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); opacity.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); opacity.value = withSpring(1); }}
    >
      <Animated.View style={[styles.card, animStyle, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
