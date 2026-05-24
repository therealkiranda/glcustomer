// src/screens/mybookings/MyBookingsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import StatusBadge from '../../components/ui/StatusBadge';
import AnimatedCard from '../../components/ui/AnimatedCard';
import api from '../../services/api';

const FILTERS = [
  { key: 'all',         label: 'All',        icon: '📋' },
  { key: 'pending',     label: 'Pending',    icon: '🕐' },
  { key: 'confirmed',   label: 'Confirmed',  icon: '✅' },
  { key: 'checked_in',  label: 'In Stay',    icon: '🏨' },
  { key: 'checked_out', label: 'Completed',  icon: '⭐' },
  { key: 'cancelled',   label: 'Cancelled',  icon: '✕' },
];

export default function MyBookingsScreen({ navigation }) {
  const { theme }   = useTheme();
  const { user }    = useAuth();
  const { currency } = useBooking();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/my');
      const d   = res.data;
      setBookings(Array.isArray(d) ? d : (d?.data || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (user) fetchBookings(); else setLoading(false); }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.authRequired}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={[styles.authTitle, { color: theme.primary }]}>Sign In to View Bookings</Text>
          <Text style={[styles.authSub, { color: theme.textLight }]}>
            Create an account or sign in to manage your reservations
          </Text>
          <TouchableOpacity style={[styles.authBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.authBtnText, { color: theme.secondary }]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={[styles.registerText, { color: theme.textLight }]}>
              New guest?{' '}
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderBooking = ({ item: b, index }) => {
    const amount = b.total_amount ? Number(b.total_amount) : null;
    return (
      <AnimatedCard
        onPress={() => navigation.navigate('BookingDetail', { booking: b })}
        style={styles.card}
        delay={index * 50}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardRef, { color: theme.secondary }]}>#{b.booking_reference}</Text>
            <Text style={[styles.cardRoom, { color: theme.primary }]} numberOfLines={1}>
              {b.room_name || `Room ${b.room_number}`}
            </Text>
          </View>
          <StatusBadge status={b.status} />
        </View>

        <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <Text style={[styles.cardMetaText, { color: theme.textLight }]}>
              📅 {b.check_in_date?.slice(0,10)}
            </Text>
            <Text style={[styles.metaSep, { color: theme.border }]}>→</Text>
            <Text style={[styles.cardMetaText, { color: theme.textLight }]}>
              {b.check_out_date?.slice(0,10)}
            </Text>
          </View>
          <View style={styles.metaBottom}>
            <Text style={[styles.cardMetaText, { color: theme.textLight }]}>
              🌙 {b.nights || '—'} night{b.nights !== 1 ? 's' : ''}
              {'  '}👥 {b.adults} adult{b.adults !== 1 ? 's' : ''}
              {b.children > 0 ? `, ${b.children} child${b.children !== 1 ? 'ren' : ''}` : ''}
            </Text>
            {amount && (
              <Text style={[styles.cardPrice, { color: theme.primary }]}>
                {formatPrice(amount, currency)}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.tapHint, { color: theme.textLight }]}>View details →</Text>
      </AnimatedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>
          {loading ? 'Loading…' : `${bookings.length} reservation${bookings.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Fix: filters in horizontal ScrollView, not flexWrap */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map(f => {
          const count  = f.key === 'all' ? bookings.length : bookings.filter(b => b.status === f.key).length;
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                { borderColor: theme.border, backgroundColor: theme.white },
                active && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={styles.filterIcon}>{f.icon}</Text>
              <Text style={[styles.filterText, { color: active ? '#fff' : theme.textLight }]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterCount, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : theme.background }]}>
                  <Text style={[styles.filterCountText, { color: active ? '#fff' : theme.textLight }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: theme.primary }]}>
                {filter === 'all' ? 'No bookings yet' : `No ${filter.replace(/_/g,' ')} bookings`}
              </Text>
              <Text style={[styles.emptySub, { color: theme.textLight }]}>
                {filter === 'all' ? 'Your reservations will appear here' : 'Try a different filter'}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  style={[styles.bookNowBtn, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('Rooms')}
                >
                  <Text style={[styles.bookNowText, { color: theme.secondary }]}>Browse Rooms</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchBookings(); }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  filterIcon: { fontSize: 13 },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterCount: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  filterCountText: { fontSize: 11, fontWeight: '700' },
  list: { padding: 16, paddingTop: 4, paddingBottom: 100 },
  card: { marginBottom: 14, padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardLeft: { flex: 1, marginRight: 12 },
  cardRef: { fontSize: 12, fontWeight: '800', marginBottom: 5, letterSpacing: 0.5 },
  cardRoom: { fontSize: 18, fontWeight: '800' },
  cardDivider: { height: 1, marginBottom: 12 },
  cardMeta: { gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaSep: { fontSize: 12 },
  metaBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMetaText: { fontSize: 13 },
  cardPrice: { fontSize: 18, fontWeight: '800' },
  tapHint: { fontSize: 11, textAlign: 'right', marginTop: 10 },
  authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  authIcon: { fontSize: 64, marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  authSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  authBtn: { width: '100%', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 14 },
  authBtnText: { fontSize: 15, fontWeight: '800' },
  registerLink: { padding: 8 },
  registerText: { fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 18 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptySub: { fontSize: 14, marginBottom: 28, textAlign: 'center' },
  bookNowBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  bookNowText: { fontSize: 14, fontWeight: '700' },
});
