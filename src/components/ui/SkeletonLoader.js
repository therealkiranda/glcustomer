// src/components/ui/SkeletonLoader.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Named export alias so BlogScreen's { SkeletonBox } import works
export function SkeletonBox({ width, height, radius, style }) {
  return <Bone style={[{ width, height, borderRadius: radius }, style]} />;
}

function Bone({ style }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#e8e4de', '#f5f3ef']
    ),
  }));

  return <Animated.View style={[styles.bone, style, animStyle]} />;
}

export function RoomCardSkeleton() {
  return (
    <View style={styles.card}>
      <Bone style={styles.image} />
      <View style={styles.info}>
        <Bone style={styles.titleBone} />
        <View style={styles.metaRow}>
          <Bone style={styles.metaBone} />
          <Bone style={styles.metaBone} />
        </View>
        <Bone style={styles.descBone} />
        <Bone style={styles.btnBone} />
      </View>
    </View>
  );
}

export function BookingCardSkeleton() {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingTop}>
        <Bone style={styles.refBone} />
        <Bone style={styles.badgeBone} />
      </View>
      <Bone style={styles.divBone} />
      <Bone style={styles.dateBone} />
    </View>
  );
}

const styles = StyleSheet.create({
  bone: { borderRadius: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 220 },
  info: { padding: 16 },
  titleBone: { height: 22, width: '65%', marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metaBone: { height: 14, width: 80 },
  descBone: { height: 14, width: '90%', marginBottom: 20 },
  btnBone: { height: 46, borderRadius: 12 },
  bookingCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  refBone: { height: 18, width: 120 },
  badgeBone: { height: 26, width: 80, borderRadius: 999 },
  divBone: { height: 1, marginBottom: 12 },
  dateBone: { height: 14, width: '75%' },
});
