// src/screens/splash/SplashScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import CurrencyPickerModal, { CURRENCY_CHOSEN_KEY } from '../../components/ui/CurrencyPickerModal';

export default function SplashScreen({ navigation }) {
  const { theme, hotel, ready } = useTheme();
  const { setCurrency }         = useBooking();
  const [destination, setDestination] = useState(null); // where to go after currency
  const [showCurrency, setShowCurrency] = useState(false);

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

  useEffect(() => {
    logoScale.value   = withTiming(1,  { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1,  { duration: 600 });
    nameOpacity.value = withDelay(500, withTiming(1,  { duration: 600 }));
    nameY.value       = withDelay(500, withTiming(0,  { duration: 600, easing: Easing.out(Easing.quad) }));
    lineWidth.value   = withDelay(900, withTiming(60, { duration: 500 }));
    tagOpacity.value  = withDelay(1100,withTiming(1,  { duration: 500 }));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(async () => {
      const [onboarded, savedCurrency, currencyChosen] = await Promise.all([
        AsyncStorage.getItem('gl_onboarded'),
        AsyncStorage.getItem(CURRENCY_CHOSEN_KEY),
        AsyncStorage.getItem(CURRENCY_CHOSEN_KEY),
      ]);

      // Restore previously chosen currency
      if (savedCurrency) setCurrency(savedCurrency);

      const dest = onboarded ? 'Main' : 'Onboarding';

      if (!currencyChosen) {
        // First time — show currency picker before routing
        setDestination(dest);
        setShowCurrency(true);
      } else {
        navigation.replace(dest);
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [ready]);

  const handleCurrencyDone = () => {
    setShowCurrency(false);
    navigation.replace(destination);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <Animated.View style={[styles.logoBox, logoStyle]}>
        <View style={[styles.logoOuter, { borderColor: theme.secondary }]}>
          <View style={[styles.logoInner, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.logoText, { color: theme.primary }]}>
              {(hotel.name || 'H').slice(0, 1).toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.hotelName, { color: '#fff' }, nameStyle]}>
        {hotel.name || 'Hotel'}
      </Animated.Text>

      <Animated.View style={[styles.line, { backgroundColor: theme.secondary }, lineStyle]} />

      <Animated.Text style={[styles.tagline, { color: 'rgba(255,255,255,0.6)' }, tagStyle]}>
        {hotel.tagline || 'Where Luxury Meets Serenity'}
      </Animated.Text>

      <CurrencyPickerModal visible={showCurrency} onDone={handleCurrencyDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBox: { marginBottom: 28 },
  logoOuter: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    opacity: 0.4,
  },
  logoInner: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 36, fontWeight: '800', letterSpacing: 2 },
  hotelName: { fontSize: 28, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  line: { height: 1, marginVertical: 16, alignSelf: 'center' },
  tagline: { fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' },
});
