// src/screens/mybookings/MyBookingsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import StatusBadge from '../../components/ui/StatusBadge';
import AnimatedCard from '../../components/ui/AnimatedCard';
import api from '../../services/api';

export default function MyBookingsScreen({ navigation }) {
  const { theme, hotel }   = useTheme();
  const { user }           = useAuth();
  const { currency }       = useBooking();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('all');

  const FILTERS = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      const d   = res.data;
      setBookings(Array.isArray(d) ? d : (d?.data || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.authRequired}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={[styles.authTitle, { color: theme.primary }]}>Sign in to view bookings</Text>
          <Text style={[styles.authSub, { color: theme.textLight }]}>Create an account or sign in to manage your reservations</Text>
          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.authBtnText, { color: theme.secondary }]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={[styles.registerText, { color: theme.textLight }]}>
              New guest? <Text style={{ color: theme.primary, fontWeight: '700' }}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderBooking = ({ item: b }) => {
    const price = b.total_amount;
    return (
      <AnimatedCard onPress={() => navigation.navigate('BookingDetail', { booking: b })} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardRef, { color: theme.primary }]}>#{b.booking_reference}</Text>
            <Text style={[styles.cardRoom, { color: theme.text }]}>{b.room_name || `Room ${b.room_number}`}</Text>
          </View>
          <StatusBadge status={b.status} />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />
        <View style={styles.cardMeta}>
          <Text style={[styles.cardMetaText, { color: theme.textLight }]}>📅 {b.check_in_date?.slice(0,10)} → {b.check_out_date?.slice(0,10)}</Text>
          <Text style={[styles.cardMetaText, { color: theme.textLight }]}>🌙 {b.nights} night{b.nights !== 1 ? 's' : ''}</Text>
          {price && <Text style={[styles.cardPrice, { color: theme.primary }]}>{hotel.currency_symbol || 'Rs'}{Number(price).toLocaleString()}</Text>}
        </View>
        <Text style={[styles.tapHint, { color: theme.textLight }]}>Tap for details →</Text>
      </AnimatedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>{bookings.length} reservation{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && { color: '#fff' }]}>
                  {f.replace(/_/g,' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: theme.primary }]}>No bookings yet</Text>
              <Text style={[styles.emptySub, { color: theme.textLight }]}>Your reservations will appear here</Text>
              <TouchableOpacity style={[styles.bookNowBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Rooms')}>
                <Text style={[styles.bookNowText, { color: theme.secondary }]}>Browse Rooms</Text>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={theme.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 4 },
  filterChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: '#e5e0d5', backgroundColor: '#fff' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6b7280', textTransform: 'capitalize' },
  list: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { marginBottom: 14, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: {},
  cardRef: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardRoom: { fontSize: 17, fontWeight: '700' },
  cardDivider: { height: 1, marginBottom: 12 },
  cardMeta: { gap: 4 },
  cardMetaText: { fontSize: 13 },
  cardPrice: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  tapHint: { fontSize: 11, textAlign: 'right', marginTop: 8 },
  authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  authIcon: { fontSize: 56, marginBottom: 16 },
  authTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  authSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  authBtn: { width: '100%', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  authBtnText: { fontSize: 15, fontWeight: '800' },
  registerLink: { padding: 8 },
  registerText: { fontSize: 14 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySub: { fontSize: 14, marginBottom: 24 },
  bookNowBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  bookNowText: { fontSize: 14, fontWeight: '700' },
});
