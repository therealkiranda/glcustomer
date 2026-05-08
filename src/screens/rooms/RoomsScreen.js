// src/screens/rooms/RoomsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Image, StatusBar, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { RoomCardSkeleton } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';

export default function RoomsScreen({ navigation }) {
  const { theme }           = useTheme();
  const { currency }        = useBooking();
  const [rooms, setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      const d = res.data;
      setRooms(Array.isArray(d) ? d : (d?.data || d?.rooms || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || (r.name || r.category_name || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const renderRoom = ({ item: room }) => {
    const price  = room.base_price || room.price_per_night || 0;
    const imgUrl = room.images?.[0]?.image_path
      ? `https://hotel.primelogic.com.np/${room.images[0].image_path}` : null;

    return (
      <AnimatedCard
        onPress={() => navigation.navigate('RoomDetail', { room })}
        style={styles.card}
      >
        <View style={styles.imageBox}>
          {imgUrl
            ? <Image source={{ uri: imgUrl }} style={styles.image} />
            : <View style={[styles.imagePlaceholder, { backgroundColor: theme.primary + '18' }]}>
                <Text style={{ fontSize: 48 }}>🛏</Text>
              </View>
          }
          <View style={[styles.priceBadge, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(price, currency)}</Text>
            <Text style={[styles.perNight, { color: theme.primary }]}>/night</Text>
          </View>
          {room.status === 'available' && (
            <View style={styles.availBadge}>
              <Text style={styles.availText}>AVAILABLE</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.primary }]}>{room.name || room.category_name}</Text>
          <View style={styles.metaRow}>
            {room.max_adults && <Text style={[styles.meta, { color: theme.textLight }]}>👥 {room.max_adults} guests</Text>}
            {room.bed_type   && <Text style={[styles.meta, { color: theme.textLight }]}>🛏 {room.bed_type}</Text>}
            {room.floor      && <Text style={[styles.meta, { color: theme.textLight }]}>🏢 Floor {room.floor}</Text>}
          </View>
          {room.description && (
            <Text style={[styles.desc, { color: theme.textLight }]} numberOfLines={2}>{room.description}</Text>
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.detailBtn, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('RoomDetail', { room })}
            >
              <Text style={[styles.detailBtnText, { color: theme.primary }]}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('BookingFlow', { screen: 'Step1', params: { room } })}
            >
              <Text style={[styles.bookBtnText, { color: theme.secondary }]}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Our Rooms</Text>
        <Text style={styles.headerSub}>{rooms.length} room types available</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.white, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search rooms..."
          placeholderTextColor={theme.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

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
                <Text style={[styles.emptyText, { color: theme.textLight }]}>No rooms found</Text>
              </View>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={theme.primary} />}
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1.5, height: 50,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  list: { padding: 16, paddingTop: 0 },
  card: { marginBottom: 20, overflow: 'hidden' },
  imageBox: { position: 'relative' },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
  priceBadge: {
    position: 'absolute', bottom: 12, right: 12,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'baseline',
  },
  price: { fontSize: 20, fontWeight: '800' },
  perNight: { fontSize: 11, marginLeft: 2 },
  availBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#065f46', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  availText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  info: { padding: 16 },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 8, flexWrap: 'wrap' },
  meta: { fontSize: 12 },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 10 },
  detailBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5 },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
  bookBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  bookBtnText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
