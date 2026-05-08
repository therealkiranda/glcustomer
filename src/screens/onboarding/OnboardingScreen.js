// src/screens/onboarding/OnboardingScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  StatusBar, FlatList,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🏨',
    headline: 'Welcome to\nLuxury',
    sub: "Experience world-class hospitality nestled in the heart of Nepal's most scenic landscapes.",
    bg: '#0f2419',
    accent: '#c9a96e',
    detail: 'Surrounded by tea gardens and misty mountains',
  },
  {
    id: '2',
    emoji: '🛏',
    headline: 'Book Your\nPerfect Room',
    sub: 'Browse our handcrafted rooms, check real-time availability, and reserve in under a minute.',
    bg: '#1a1a2e',
    accent: '#c9a96e',
    detail: 'Instant confirmation · No hidden fees',
  },
  {
    id: '3',
    emoji: '✨',
    headline: 'Your Stay,\nYour Way',
    sub: "Track bookings, upload payment, request anything. We're here before, during, and after your stay.",
    bg: '#2d1b0e',
    accent: '#c9a96e',
    detail: '24/7 support · Loyalty rewards · Easy checkout',
  },
];

function Slide({ item, index, scrollX }) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale   = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4],  Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, 40], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }, { translateY }] };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.slideContent, { backgroundColor: item.bg }]}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>

        <Animated.View style={animStyle}>
          <Text style={[styles.headline, { color: '#fff' }]}>{item.headline}</Text>
          <View style={[styles.accentLine, { backgroundColor: item.accent }]} />
          <Text style={[styles.sub, { color: 'rgba(255,255,255,0.7)' }]}>{item.sub}</Text>
          <View style={[styles.detailPill, { borderColor: item.accent + '40' }]}>
            <Text style={[styles.detailText, { color: item.accent }]}>{item.detail}</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef  = useRef(null);
  const scrollX  = useSharedValue(0);

  const finish = async () => {
    await AsyncStorage.setItem('gl_onboarded', '1');
    navigation.replace('Main');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const currentBg = SLIDES[activeIndex].bg;
  const currentAccent = SLIDES[activeIndex].accent;

  return (
    <View style={[styles.container, { backgroundColor: currentBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentBg} />

      <TouchableOpacity style={styles.skipBtn} onPress={finish}>
        <Text style={[styles.skipText, { color: currentAccent }]}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => {
          scrollX.value = e.nativeEvent.contentOffset.x;
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const dotStyle = useAnimatedStyle(() => {
              const w = interpolate(
                scrollX.value,
                [(i - 1) * width, i * width, (i + 1) * width],
                [8, 24, 8],
                Extrapolation.CLAMP
              );
              return { width: w };
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, dotStyle, { backgroundColor: i === activeIndex ? currentAccent : 'rgba(255,255,255,0.3)' }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentAccent }]}
          onPress={next}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextText, { color: currentBg }]}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity style={styles.loginLink} onPress={() => { finish(); }}>
            <Text style={[styles.loginLinkText, { color: 'rgba(255,255,255,0.5)' }]}>
              Already have an account? <Text style={{ color: currentAccent }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },
  slide: { alignItems: 'center', justifyContent: 'center' },
  slideContent: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emojiCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  emoji: { fontSize: 56 },
  headline: { fontSize: 42, fontWeight: '800', lineHeight: 50, textAlign: 'center', marginBottom: 16, letterSpacing: -1 },
  accentLine: { width: 40, height: 2, marginBottom: 20, alignSelf: 'center' },
  sub: { fontSize: 16, lineHeight: 26, textAlign: 'center', marginBottom: 24 },
  detailPill: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 8,
    alignSelf: 'center',
  },
  detailText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  footer: { paddingBottom: 52, paddingHorizontal: 32, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 32, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    width: '100%', paddingVertical: 18,
    borderRadius: 16, alignItems: 'center',
    shadowColor: '#c9a96e', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  nextText: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  loginLink: { marginTop: 20 },
  loginLinkText: { fontSize: 13 },
});
