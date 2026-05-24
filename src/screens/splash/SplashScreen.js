// src/screens/splash/SplashScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import CurrencyPickerModal, { CURRENCY_CHOSEN_KEY } from '../../components/ui/CurrencyPickerModal';

// Minimum splash display time so it doesn't flash
const MIN_SPLASH_MS = 2000;
// Max time to wait for API before giving up and proceeding anyway
const API_TIMEOUT_MS = 5000;

export default function SplashScreen({ navigation }) {
  const { theme, hotel, ready } = useTheme();
  const { setCurrency }         = useBooking();

  const [showCurrency, setShowCurrency] = useState(false);
  const destinationRef = useRef('Main');
  const startTime      = useRef(Date.now());
  const navigated      = useRef(false);

  // Animation values
  const logoScale   = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const nameY       = useSharedValue(30);
  const tagOpacity  = useSharedValue(0);
  const lineWidth   = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameY.value }],
  }));
  const tagStyle  = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));
  const lineStyle = useAnimatedStyle(() => ({ width: `${lineWidth.value}%` }));

  // Start animations immediately — don't wait for API
  useEffect(() => {
    logoScale.value   = withTiming(1,  { duration: 700, easing: Easing.out(Easing.back(1.4)) });
    logoOpacity.value = withTiming(1,  { duration: 500 });
    nameOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    nameY.value       = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
    lineWidth.value   = withDelay(700, withTiming(60, { duration: 400 }));
    tagOpacity.value  = withDelay(900, withTiming(1, { duration: 400 }));
  }, []);

  const proceed = async () => {
    if (navigated.current) return;

    // Restore saved currency
    try {
      const [onboarded, savedCurrency, currencyChosen] = await Promise.all([
        AsyncStorage.getItem('gl_onboarded'),
        AsyncStorage.getItem(CURRENCY_CHOSEN_KEY),
        AsyncStorage.getItem(CURRENCY_CHOSEN_KEY),
      ]);

      if (savedCurrency) setCurrency(savedCurrency);
      destinationRef.current = onboarded ? 'Main' : 'Onboarding';

      // Ensure minimum display time
      const elapsed   = Date.now() - startTime.current;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

      setTimeout(() => {
        if (navigated.current) return;
        if (!currencyChosen) {
          // First time — show currency picker
          setShowCurrency(true);
        } else {
          navigated.current = true;
          navigation.replace(destinationRef.current);
        }
      }, remaining);
    } catch {
      // AsyncStorage failed — just navigate
      setTimeout(() => {
        if (navigated.current) return;
        navigated.current = true;
        navigation.replace('Main');
      }, MIN_SPLASH_MS);
    }
  };

  // Trigger proceed when ThemeContext is ready OR after API_TIMEOUT_MS max wait
  useEffect(() => {
    // Hard timeout — never get stuck longer than API_TIMEOUT_MS
    const hardTimer = setTimeout(() => {
      proceed();
    }, API_TIMEOUT_MS);

    return () => clearTimeout(hardTimer);
  }, []);

  useEffect(() => {
    if (ready) proceed();
  }, [ready]);

  const handleCurrencyDone = () => {
    if (navigated.current) return;
    navigated.current = true;
    setShowCurrency(false);
    navigation.replace(destinationRef.current);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <Animated.View style={[styles.logoBox, logoStyle]}>
        <View style={[styles.logoOuter, { borderColor: theme.secondary + '60' }]}>
          <View style={[styles.logoInner, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.logoText, { color: theme.primary }]}>
              {(hotel.name || 'H')[0].toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.hotelName, { color: '#fff' }, nameStyle]}>
        {hotel.name || 'Hotel'}
      </Animated.Text>

      <Animated.View style={[styles.line, { backgroundColor: theme.secondary }, lineStyle]} />

      <Animated.Text style={[styles.tagline, { color: 'rgba(255,255,255,0.55)' }, tagStyle]}>
        {hotel.tagline || 'Where Luxury Meets Serenity'}
      </Animated.Text>

      <CurrencyPickerModal visible={showCurrency} onDone={handleCurrencyDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBox: { marginBottom: 32 },
  logoOuter: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  logoInner: {
    width: 86, height: 86, borderRadius: 43,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 38, fontWeight: '800' },
  hotelName: {
    fontSize: 26, fontWeight: '700',
    letterSpacing: 4, textTransform: 'uppercase', marginBottom: 0,
  },
  line: { height: 1, marginVertical: 18, alignSelf: 'center' },
  tagline: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
});
