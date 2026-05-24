// src/screens/rooms/RoomDetailScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';

const { width } = Dimensions.get('window');
const HERO = 340;
const API_BASE = 'https://hotel.primelogic.com.np';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
}

function PriceRow({ label, value, last, theme }) {
  return (
    <View style={[styles.priceRow, !last && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }]}>
      <Text style={[styles.priceLabel, { color: theme.textLight }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: theme.primary }, last && styles.priceTotalVal]}>{value}</Text>
    </View>
  );
}

export default function RoomDetailScreen({ route, navigation }) {
  const { room }     = route.params;
  const { theme }    = useTheme();
  const { currency } = useBooking();
  const [imgIdx, setImgIdx] = useState(0);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollY.value, [-HERO, 0, HERO], [1.4, 1, 1], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, HERO * 0.6], [1, 0.6], Extrapolation.CLAMP),
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 120], [1, 0.3], Extrapolation.CLAMP),
  }));

  const price     = room.base_price || room.price_per_night || 0;
  const images    = room.images || [];
  const amenities = room.amenities || room.facilities || [];
  const total     = price * 1.23;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.gallery}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            {images.length > 0
              ? <Image
                  source={{ uri: imgUrl(images[imgIdx]?.image_path) }}
                  style={styles.mainImage}
                />
              : <View style={[styles.mainImage, { backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 80 }}>🛏</Text>
                </View>
            }
            <View style={styles.heroGradient} />
          </Animated.View>

          <Animated.View style={[styles.backBtn, backStyle]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTouchable}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={[styles.priceBadge, { backgroundColor: 'rgba(255,255,255,0.96)', bottom: images.length > 1 ? 76 : 16 }]}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(price, currency)}</Text>
            <Text style={[styles.perNight, { color: theme.textLight }]}>/night</Text>
          </View>

          {images.length > 1 && (
            <ScrollView
              horizontal
              style={styles.thumbsRow}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbsContent}
            >
              {images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)}>
                  <Image
                    source={{ uri: imgUrl(img.image_path) }}
                    style={[
                      styles.thumb,
                      i === imgIdx && { borderColor: theme.secondary, borderWidth: 2.5, opacity: 1 },
                      i !== imgIdx && { opacity: 0.65 },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.body}>
          {/* Title & Status */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roomName, { color: theme.primary }]}>
                {room.name || room.category_name}
              </Text>
              {room.room_number && (
                <Text style={[styles.roomNum, { color: theme.textLight }]}>Room #{room.room_number}</Text>
              )}
            </View>
            {room.status === 'available' && (
              <View style={[styles.statusBadge, { backgroundColor: '#d1fae5' }]}>
                <Text style={[styles.statusText, { color: '#065f46' }]}>● Available</Text>
              </View>
            )}
          </View>

          {/* Meta pills */}
          <View style={styles.metaRow}>
            {[
              room.max_adults   && `👥 ${room.max_adults} guests`,
              room.bed_type     && `🛏 ${room.bed_type}`,
              room.floor        && `🏢 Floor ${room.floor}`,
              room.area_sqft    && `📐 ${room.area_sqft} sqft`,
              room.view_type    && `🪟 ${room.view_type}`,
            ].filter(Boolean).map((t, i) => (
              <View key={i} style={[styles.metaPill, { backgroundColor: theme.primary + '12' }]}>
                <Text style={[styles.metaText, { color: theme.primary }]}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {room.description && (
            <View style={[styles.section, { backgroundColor: theme.white }]}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>About This Room</Text>
              <Text style={[styles.desc, { color: theme.text }]}>{room.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <View style={[styles.section, { backgroundColor: theme.white }]}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((a, i) => (
                  <View key={i} style={[styles.amenityChip, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Text style={styles.amenityIcon}>{a.icon || '✓'}</Text>
                    <Text style={[styles.amenityName, { color: theme.text }]}>{a.name || a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Price Breakdown */}
          <View style={[styles.section, { backgroundColor: theme.white }]}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>Price Breakdown</Text>
            <PriceRow label="Base rate"          value={`${formatPrice(price, currency)}/night`}          theme={theme} />
            <PriceRow label="VAT (13%)"          value={`${formatPrice(price * 0.13, currency)}/night`}  theme={theme} />
            <PriceRow label="Service (10%)"      value={`${formatPrice(price * 0.10, currency)}/night`}  theme={theme} />
            <PriceRow label="Total per night"    value={formatPrice(total, currency)}                     theme={theme} last />
          </View>

          {/* Policies */}
          <View style={[styles.section, { backgroundColor: theme.white }]}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>Policies</Text>
            {[
              ['🕐', 'Check-in', 'From 14:00'],
              ['🕙', 'Check-out', 'Until 12:00'],
              ['🚭', 'Smoking', 'Not permitted'],
              ['🐾', 'Pets', 'Not allowed'],
              ['❌', 'Cancellation', 'Free up to 24h before arrival'],
            ].map(([icon, label, val]) => (
              <View key={label} style={[styles.policyRow, { borderBottomColor: theme.border }]}>
                <Text style={styles.policyIcon}>{icon}</Text>
                <Text style={[styles.policyLabel, { color: theme.textLight }]}>{label}</Text>
                <Text style={[styles.policyVal, { color: theme.text }]}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { backgroundColor: theme.white, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerPrice, { color: theme.primary }]}>{formatPrice(total, currency)}</Text>
          <Text style={[styles.footerSub, { color: theme.textLight }]}>per night · incl. all taxes</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('BookingFlow', { screen: 'Step1', params: { room } })}
          activeOpacity={0.85}
        >
          <Text style={[styles.bookBtnText, { color: theme.secondary }]}>Book This Room →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gallery: { height: HERO },
  mainImage: { width, height: HERO, resizeMode: 'cover' },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  backBtn: { position: 'absolute', top: 52, left: 16 },
  backTouchable: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  priceBadge: {
    position: 'absolute', bottom: 16, right: 16,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'baseline',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  price: { fontSize: 24, fontWeight: '800' },
  perNight: { fontSize: 12, marginLeft: 3 },
  thumbsRow: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  thumbsContent: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6, gap: 8 },
  thumb: { width: 64, height: 64, borderRadius: 10 },
  body: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  roomName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 34 },
  roomNum: { fontSize: 13, marginTop: 4 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  metaText: { fontSize: 13, fontWeight: '600' },
  section: { borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14, letterSpacing: -0.2 },
  desc: { fontSize: 15, lineHeight: 25, color: '#374151' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  amenityIcon: { fontSize: 14 },
  amenityName: { fontSize: 13, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '600' },
  priceTotalVal: { fontSize: 18, fontWeight: '800' },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  policyIcon: { fontSize: 16, width: 24 },
  policyLabel: { fontSize: 13, width: 90 },
  policyVal: { flex: 1, fontSize: 13, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28,
    borderTopWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 12,
  },
  footerPrice: { fontSize: 24, fontWeight: '800' },
  footerSub: { fontSize: 11, marginTop: 2 },
  bookBtn: {
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16,
    shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  bookBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
