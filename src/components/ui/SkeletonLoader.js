// src/components/ui/SkeletonLoader.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolateColor,
} from 'react-native-reanimated';

export function SkeletonBox({ width, height, radius = 8, style }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#e8e0d4', '#f5f0ea']),
  }));

  return (
    <Animated.View style={[{ width, height, borderRadius: radius }, animStyle, style]} />
  );
}

export function RoomCardSkeleton() {
  return (
    <View style={styles.roomCard}>
      <SkeletonBox width="100%" height={180} radius={16} />
      <View style={styles.roomCardBody}>
        <SkeletonBox width="60%" height={18} radius={4} style={styles.mb8} />
        <SkeletonBox width="40%" height={14} radius={4} style={styles.mb8} />
        <SkeletonBox width="30%" height={14} radius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roomCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  roomCardBody: { padding: 16 },
  mb8: { marginBottom: 8 },
});
