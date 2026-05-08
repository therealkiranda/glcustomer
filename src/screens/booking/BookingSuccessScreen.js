// src/screens/booking/BookingSuccessScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

export default function BookingSuccessScreen({ route, navigation }) {
  const { theme }           = useTheme();
  const bookingData         = route.params?.booking || {};
  const ref                 = bookingData.booking_reference || bookingData.reference || '—';
  const total               = bookingData.total_amount;

  const checkScale   = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const contentY     = useSharedValue(40);
  const contentOp    = useSharedValue(0);

  useEffect(() => {
    checkScale.value   = withSpring(1, { damping: 12, stiffness: 150 });
    checkOpacity.value = withTiming(1, { duration: 400 });
    contentY.value     = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
    contentOp.value    = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const checkStyle   = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }], opacity: checkOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: contentY.value }], opacity: contentOp.value }));

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <Animated.View style={[styles.checkCircle, { borderColor: theme.secondary }, checkStyle]}>
        <Text style={styles.checkEmoji}>✅</Text>
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={[styles.title, { color: '#fff' }]}>Booking Confirmed!</Text>
        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
          Your reservation has been received and is pending confirmation.
        </Text>

        <View style={[styles.refCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: theme.secondary + '40' }]}>
          <Text style={[styles.refLabel, { color: 'rgba(255,255,255,0.6)' }]}>BOOKING REFERENCE</Text>
          <Text style={[styles.refCode, { color: theme.secondary }]}>{ref}</Text>
          {total && <Text style={[styles.refTotal, { color: 'rgba(255,255,255,0.8)' }]}>Total: {total}</Text>}
        </View>

        <Text style={[styles.note, { color: 'rgba(255,255,255,0.6)' }]}>
          You'll receive a confirmation email shortly. You can track your booking in the My Bookings tab.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.secondary }]}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Bookings' } }] })}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: theme.primary }]}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Text style={[styles.secondaryBtnText, { color: 'rgba(255,255,255,0.7)' }]}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  checkCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  checkEmoji: { fontSize: 50 },
  content: { alignItems: 'center', width: '100%' },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  refCard: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 24 },
  refLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  refCode: { fontSize: 28, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  refTotal: { fontSize: 15 },
  note: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  primaryBtn: { width: '100%', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { fontSize: 15, fontWeight: '800' },
  secondaryBtn: { paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
});
