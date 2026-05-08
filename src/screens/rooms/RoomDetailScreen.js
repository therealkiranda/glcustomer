// src/screens/rooms/RoomDetailScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';

const { width } = Dimensions.get('window');

export default function RoomDetailScreen({ route, navigation }) {
  const { room } = route.params;
  const { theme } = useTheme();
  const { currency } = useBooking();
  const [imgIdx, setImgIdx] = useState(0);

  const price   = room.base_price || room.price_per_night || 0;
  const images  = room.images || [];
  const amenities = room.amenities || room.facilities || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          {images.length > 0
            ? <Image
                source={{ uri: `https://hotel.primelogic.com.np/${images[imgIdx]?.image_path}` }}
                style={styles.mainImage}
              />
            : <View style={[styles.mainImage, { backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 64 }}>🛏</Text>
              </View>
          }

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <View style={[styles.priceBadge, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(price, currency)}</Text>
            <Text style={[styles.perNight, { color: theme.primary }]}>/night</Text>
          </View>

          {images.length > 1 && (
            <ScrollView horizontal style={styles.thumbsRow} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsContent}>
              {images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)}>
                  <Image
                    source={{ uri: `https://hotel.primelogic.com.np/${img.image_path}` }}
                    style={[styles.thumb, i === imgIdx && { borderColor: theme.secondary, borderWidth: 2 }]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.body}>
          <Text style={[styles.roomName, { color: theme.primary }]}>{room.name || room.category_name}</Text>

          <View style={styles.metaRow}>
            {room.max_adults && <View style={[styles.metaPill, { backgroundColor: theme.primary + '12' }]}>
              <Text style={[styles.metaText, { color: theme.primary }]}>👥 {room.max_adults} guests</Text>
            </View>}
            {room.bed_type && <View style={[styles.metaPill, { backgroundColor: theme.primary + '12' }]}>
              <Text style={[styles.metaText, { color: theme.primary }]}>🛏 {room.bed_type}</Text>
            </View>}
            {room.floor && <View style={[styles.metaPill, { backgroundColor: theme.primary + '12' }]}>
              <Text style={[styles.metaText, { color: theme.primary }]}>🏢 Floor {room.floor}</Text>
            </View>}
            {room.area_sqft && <View style={[styles.metaPill, { backgroundColor: theme.primary + '12' }]}>
              <Text style={[styles.metaText, { color: theme.primary }]}>📐 {room.area_sqft} sqft</Text>
            </View>}
          </View>

          {room.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>About This Room</Text>
              <Text style={[styles.desc, { color: theme.text }]}>{room.description}</Text>
            </View>
          )}

          {amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((a, i) => (
                  <View key={i} style={[styles.amenityChip, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}>
                    <Text style={styles.amenityIcon}>{a.icon || '✓'}</Text>
                    <Text style={[styles.amenityName, { color: theme.primary }]}>{a.name || a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={[styles.priceBreakdown, { backgroundColor: theme.white, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>Price Breakdown</Text>
            {[
              ['Base rate', `${formatPrice(price, currency)}/night`],
              ['VAT (13%)', `${formatPrice(price * 0.13, currency)}/night`],
              ['Service charge (10%)', `${formatPrice(price * 0.10, currency)}/night`],
              ['Total/night', `${formatPrice(price * 1.23, currency)}`],
            ].map(([l, v]) => (
              <View key={l} style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.textLight }]}>{l}</Text>
                <Text style={[styles.priceValue, { color: theme.primary }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.white, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerPrice, { color: theme.primary }]}>{formatPrice(price * 1.23, currency)}</Text>
          <Text style={[styles.footerPriceSub, { color: theme.textLight }]}>per night incl. taxes</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('BookingFlow', { screen: 'Step1', params: { room } })}
          activeOpacity={0.85}
        >
          <Text style={[styles.bookBtnText, { color: theme.secondary }]}>Book This Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gallery: {},
  mainImage: { width, height: 320, resizeMode: 'cover' },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  priceBadge: {
    position: 'absolute', bottom: 16, right: 16,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'baseline',
  },
  price: { fontSize: 22, fontWeight: '800' },
  perNight: { fontSize: 12, marginLeft: 2 },
  thumbsRow: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  thumbsContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  thumb: { width: 60, height: 60, borderRadius: 8, borderWidth: 0, borderColor: 'transparent' },
  body: { padding: 20, paddingBottom: 100 },
  roomName: { fontSize: 26, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  metaText: { fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 24 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  amenityIcon: { fontSize: 14 },
  amenityName: { fontSize: 12, fontWeight: '600' },
  priceBreakdown: { borderRadius: 16, padding: 16, borderWidth: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  priceLabel: { fontSize: 13 },
  priceValue: { fontSize: 13, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderTopWidth: 1,
  },
  footerPrice: { fontSize: 22, fontWeight: '800' },
  footerPriceSub: { fontSize: 11, marginTop: 2 },
  bookBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 16 },
  bookBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
