// src/components/ui/CurrencyPickerModal.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBooking, CURRENCIES } from '../../context/BookingContext';
import { useTheme } from '../../context/ThemeContext';

export const CURRENCY_CHOSEN_KEY = 'gl_currency_chosen';

export default function CurrencyPickerModal({ visible, onDone }) {
  const { currency, setCurrency } = useBooking();
  const { theme, hotel }          = useTheme();

  const scale   = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value   = withSpring(1,   { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1,   { duration: 250 });
    } else {
      scale.value   = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0,   { duration: 200 });
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleSelect = async (code) => {
    setCurrency(code);
    await AsyncStorage.setItem(CURRENCY_CHOSEN_KEY, code);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { backgroundColor: theme.primary }, cardStyle]}>

          <View style={styles.logoRow}>
            <View style={[styles.logoBadge, { backgroundColor: theme.secondary + '25', borderColor: theme.secondary + '40' }]}>
              <Text style={[styles.logoLetter, { color: theme.secondary }]}>
                {(hotel.name || 'H')[0].toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>Welcome to</Text>
          <Text style={[styles.hotelName, { color: theme.secondary }]}>{hotel.name || 'Hotel'}</Text>
          <Text style={styles.subtitle}>Choose your preferred currency</Text>
          <View style={[styles.divider, { backgroundColor: theme.secondary + '30' }]} />

          <View style={styles.grid}>
            {CURRENCIES.map(c => {
              const active = currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyBtn,
                    { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.07)' },
                    active && { backgroundColor: theme.secondary, borderColor: theme.secondary },
                  ]}
                  onPress={() => setCurrency(c.code)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.currencyFlag}>{c.flag}</Text>
                  <Text style={[styles.currencyCode, { color: active ? theme.primary : '#fff' }]}>{c.code}</Text>
                  <Text style={[styles.currencySymbol, { color: active ? theme.primary : 'rgba(255,255,255,0.55)' }]}>{c.symbol}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.secondary }]}
            onPress={() => handleSelect(currency)}
            activeOpacity={0.85}
          >
            <Text style={[styles.doneBtnText, { color: theme.primary }]}>Continue with {currency} →</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>You can change this anytime from your Profile</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: { width: '100%', borderRadius: 28, padding: 28 },
  logoRow: { alignItems: 'center', marginBottom: 20 },
  logoBadge: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { fontSize: 28, fontWeight: '800' },
  title: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 },
  hotelName: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  divider: { height: 1, marginVertical: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  currencyBtn: {
    width: '30%', flexGrow: 1,
    borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center', gap: 4,
  },
  currencyFlag: { fontSize: 24 },
  currencyCode: { fontSize: 14, fontWeight: '800' },
  currencySymbol: { fontSize: 12, fontWeight: '600' },
  doneBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#c9a96e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  doneBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginTop: 16 },
});
