// src/screens/rooms/RoomsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Image, StatusBar, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { RoomCardSkeleton } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';

const API_BASE = 'https://hotel.primelogic.com.np';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
}

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'available', label: '✓ Available' },
  { key: 'occupied',  label: 'Occupied' },
];

export default function RoomsScreen({ navigation }) {
  const { theme }     = useTheme();
  const { currency }  = useBooking();
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      const d   = res.data;
      setRooms(Array.isArray(d) ? d : (d?.data || d?.rooms || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, []);

  const filtered = rooms.filter(r => {
    const q           = search.toLowerCase();
    const matchSearch = !q || (r.name || r.category_name || '').toLowerCase().includes(q)
                            || String(r.room_number || '').includes(q);
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const renderRoom = ({ item: room, index }) => {
    const price = room.base_price || room.price_per_night || 0;
    const url   = imgUrl(room.images?.[0]?.image_path);

    return (
      <AnimatedCard
        onPress={() => navigation.navigate('RoomDetail', { room })}
        style={styles.card}
        delay={index * 60}
      >
        <View style={styles.imageBox}>
          {url
            ? <Image source={{ uri: url }} style={styles.image} />
            : <View style={[styles.imagePlaceholder, { backgroundColor: theme.primary + '18' }]}>
                <Text style={{ fontSize: 56 }}>🛏</Text>
              </View>
          }
          <View style={[styles.priceBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(price, currency)}</Text>
            <Text style={[styles.perNight, { color: theme.textLight }]}>/night</Text>
          </View>
          {room.status === 'available' && (
            <View style={[styles.availBadge, { backgroundColor: '#065f46' }]}>
              <Text style={styles.availText}>AVAILABLE</Text>
            </View>
          )}
          {room.floor && (
            <View style={[styles.floorBadge, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
              <Text style={styles.floorText}>Floor {room.floor}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.infoTop}>
            <Text style={[styles.name, { color: theme.primary }]} numberOfLines={1}>
              {room.name || room.category_name}
            </Text>
            {room.room_number && (
              <View style={[styles.roomNumBadge, { backgroundColor: theme.primary + '12' }]}>
                <Text style={[styles.roomNum, { color: theme.primary }]}>#{room.room_number}</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            {room.max_adults && (
              <View style={[styles.metaChip, { backgroundColor: theme.background }]}>
                <Text style={[styles.meta, { color: theme.textLight }]}>👥 {room.max_adults} guests</Text>
              </View>
            )}
            {room.bed_type && (
              <View style={[styles.metaChip, { backgroundColor: theme.background }]}>
                <Text style={[styles.meta, { color: theme.textLight }]}>🛏 {room.bed_type}</Text>
              </View>
            )}
            {room.area_sqft && (
              <View style={[styles.metaChip, { backgroundColor: theme.background }]}>
                <Text style={[styles.meta, { color: theme.textLight }]}>📐 {room.area_sqft} sqft</Text>
              </View>
            )}
          </View>

          {room.description && (
            <Text style={[styles.desc, { color: theme.textLight }]} numberOfLines={2}>
              {room.description}
            </Text>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.detailBtn, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('RoomDetail', { room })}
            >
              <Text style={[styles.detailBtnText, { color: theme.primary }]}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('BookingFlow', { screen: 'Step1', params: { room } })}
            >
              <Text style={[styles.bookBtnText, { color: theme.secondary }]}>Book Now →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Our Rooms</Text>
        <Text style={styles.headerSub}>
          {loading ? 'Loading…' : `${filtered.length} of ${rooms.length} rooms`}
        </Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.white, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name or room number…"
          placeholderTextColor={theme.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={{ color: theme.textLight, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              { borderColor: theme.border, backgroundColor: theme.white },
              filter === f.key && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              styles.filterText,
              { color: theme.textLight },
              filter === f.key && { color: '#fff' },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading
        ? <ScrollView contentContainerStyle={styles.list}>
            {[1,2,3].map(i => <RoomCardSkeleton key={i} />)}
          </ScrollView>
        : <FlatList
            data={filtered}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderRoom}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🛏</Text>
                <Text style={[styles.emptyText, { color: theme.primary }]}>No rooms found</Text>
                <Text style={[styles.emptySub, { color: theme.textLight }]}>Try a different search or filter</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchRooms(); }}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1.5, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { padding: 4 },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5 },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingTop: 4, paddingBottom: 100 },
  card: { marginBottom: 20, overflow: 'hidden' },
  imageBox: { position: 'relative' },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
  priceBadge: {
    position: 'absolute', bottom: 12, right: 12,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'baseline',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  price: { fontSize: 20, fontWeight: '800' },
  perNight: { fontSize: 11, marginLeft: 2 },
  availBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  availText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  floorBadge: {
    position: 'absolute', top: 12, right: 12,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  floorText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  info: { padding: 16 },
  infoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 20, fontWeight: '800', flex: 1, letterSpacing: -0.3 },
  roomNumBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  roomNum: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  metaChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  meta: { fontSize: 12 },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  detailBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5 },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
  bookBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center', shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  bookBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  empty: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { fontSize: 14 },
});
