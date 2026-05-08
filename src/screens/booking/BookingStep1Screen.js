// src/screens/booking/BookingStep1Screen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, FlatList, ActivityIndicator, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import api from '../../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function Calendar({ label, value, onChange, minDate }) {
  const [show, setShow]   = useState(false);
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const first   = new Date(year, month, 1).getDay();
  const daysInM = new Date(year, month + 1, 0).getDate();
  const cells   = Array(first).fill(null).concat(Array.from({ length: daysInM }, (_, i) => i + 1));
  const toStr   = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const isDisabled = d => !d || (minDate && toStr(year, month, d) < minDate);
  const isSelected = d => d && value === toStr(year, month, d);

  const prevM = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextM = () => month === 11 ? (setMonth(0),  setYear(y => y+1)) : setMonth(m => m+1);

  return (
    <View style={styles.calField}>
      <Text style={styles.calLabel}>{label}</Text>
      <TouchableOpacity style={styles.calBtn} onPress={() => setShow(true)}>
        <Text style={styles.calBtnText}>{value || 'Select date'}</Text>
        <Text style={styles.calBtnIcon}>📅</Text>
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="slide">
        <View style={styles.calOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShow(false)} />
          <View style={styles.calCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevM} style={styles.calNav}><Text style={styles.calNavText}>‹</Text></TouchableOpacity>
              <Text style={styles.calTitle}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextM} style={styles.calNav}><Text style={styles.calNavText}>›</Text></TouchableOpacity>
            </View>
            <View style={styles.calDaysRow}>
              {DAYS.map(d => <Text key={d} style={styles.calDayLabel}>{d}</Text>)}
            </View>
            <View style={styles.calGrid}>
              {cells.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  disabled={isDisabled(d)}
                  onPress={() => { onChange(toStr(year, month, d)); setShow(false); }}
                  style={[styles.calCell, isSelected(d) && styles.calCellSelected, isDisabled(d) && styles.calCellDisabled]}
                >
                  <Text style={[styles.calCellText, isSelected(d) && styles.calCellTextSelected, isDisabled(d) && styles.calCellTextDisabled]}>
                    {d || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.calClose} onPress={() => setShow(false)}>
              <Text style={styles.calCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Counter({ label, value, onChange, min = 0, max = 10 }) {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterVal}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.min(max, value + 1))}>
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RoomChip({ room, selected, onPress, currency }) {
  const price = room.base_price || 0;
  return (
    <TouchableOpacity
      style={[styles.roomChip, selected && styles.roomChipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.roomChipNum, selected && styles.roomChipTextSelected]}>{room.room_number}</Text>
      <Text style={[styles.roomChipType, selected && styles.roomChipTextSelected]} numberOfLines={1}>{room.category_name}</Text>
      <Text style={[styles.roomChipPrice, selected && styles.roomChipTextSelected]}>{formatPrice(price, currency)}/night</Text>
    </TouchableOpacity>
  );
}

export default function BookingStep1Screen({ navigation, route }) {
  const { theme, hotel }                  = useTheme();
  const { booking, updateBooking, currency, nights, total } = useBooking();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms]     = useState(false);

  const preselected = route.params?.room;

  useEffect(() => {
    if (preselected) updateBooking({ room: preselected });
  }, []);

  useEffect(() => {
    if (booking.checkIn && booking.checkOut && booking.checkIn < booking.checkOut) {
      setLoadingRooms(true);
      setAvailableRooms([]);
      updateBooking({ room: preselected || null });
      api.get('/frontdesk/available-rooms', {
        params: { check_in: booking.checkIn, check_out: booking.checkOut }
      }).then(r => {
        setAvailableRooms(Array.isArray(r.data) ? r.data : []);
      }).catch(() => {}).finally(() => setLoadingRooms(false));
    }
  }, [booking.checkIn, booking.checkOut]);

  const canProceed = booking.checkIn && booking.checkOut && booking.checkIn < booking.checkOut && booking.room;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerStep}>STEP 1 OF 3</Text>
          <Text style={styles.headerTitle}>Select Dates & Room</Text>
        </View>
        <View style={styles.stepDots}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, { backgroundColor: i === 1 ? theme.secondary : 'rgba(255,255,255,0.3)' }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📅 Stay Dates</Text>
          <View style={styles.datesRow}>
            <View style={styles.half}>
              <Calendar
                label="Check-In"
                value={booking.checkIn}
                onChange={v => updateBooking({ checkIn: v })}
              />
            </View>
            <View style={styles.half}>
              <Calendar
                label="Check-Out"
                value={booking.checkOut}
                onChange={v => updateBooking({ checkOut: v })}
                minDate={booking.checkIn}
              />
            </View>
          </View>
          {nights > 0 && (
            <View style={[styles.nightsBadge, { backgroundColor: theme.primary + '12' }]}>
              <Text style={[styles.nightsText, { color: theme.primary }]}>🌙 {nights} night{nights !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👥 Guests</Text>
          <View style={styles.countersRow}>
            <Counter label="Adults"   value={booking.adults}   onChange={v => updateBooking({ adults: v })}   min={1} />
            <Counter label="Children" value={booking.children} onChange={v => updateBooking({ children: v })} min={0} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>🛏 Select Room</Text>

          {!booking.checkIn || !booking.checkOut ? (
            <Text style={[styles.hint, { color: theme.textLight }]}>Select dates above to see available rooms</Text>
          ) : loadingRooms ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textLight }]}>Checking availability…</Text>
            </View>
          ) : availableRooms.length === 0 ? (
            <View style={[styles.noRooms, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.noRoomsText}>⚠️ No rooms available for selected dates</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableRooms.map(r => (
                <RoomChip
                  key={r.id}
                  room={r}
                  selected={booking.room?.id === r.id}
                  onPress={() => updateBooking({ room: r })}
                  currency={currency}
                />
              ))}
            </ScrollView>
          )}

          {booking.room && (
            <View style={[styles.selectedRoom, { borderColor: theme.primary, backgroundColor: theme.primary + '08' }]}>
              <Text style={[styles.selectedRoomTitle, { color: theme.primary }]}>
                ✅ Room {booking.room.room_number} — {booking.room.category_name}
              </Text>
              <Text style={[styles.selectedRoomSub, { color: theme.textLight }]}>
                Floor {booking.room.floor || '—'} · {formatPrice(booking.room.base_price || 0, currency)}/night
              </Text>
              {nights > 0 && (
                <Text style={[styles.selectedRoomTotal, { color: theme.primary }]}>
                  Estimated total: {formatPrice(total, currency)} (incl. taxes)
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: canProceed ? theme.primary : theme.border }]}
          onPress={() => canProceed && navigation.navigate('Step2')}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextBtnText, { color: canProceed ? theme.secondary : theme.textLight }]}>
            Continue to Guest Details →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  backText: { color: '#fff', fontSize: 22 },
  headerStep: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  stepDots: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  datesRow: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  calField: { gap: 6 },
  calLabel: { fontSize: 11, fontWeight: '700', color: '#374151', letterSpacing: 1 },
  calBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e0d5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  calBtnText: { fontSize: 13, color: '#1e293b' },
  calBtnIcon: { fontSize: 16 },
  nightsBadge: { borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 12 },
  nightsText: { fontSize: 13, fontWeight: '700' },
  countersRow: { flexDirection: 'row', justifyContent: 'space-around' },
  counter: { alignItems: 'center', gap: 8 },
  counterLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  counterBtnText: { fontSize: 20, fontWeight: '600', color: '#374151' },
  counterVal: { fontSize: 20, fontWeight: '800', color: '#1e293b', minWidth: 28, textAlign: 'center' },
  hint: { textAlign: 'center', fontSize: 13, paddingVertical: 12 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  loadingText: { fontSize: 13 },
  noRooms: { borderRadius: 10, padding: 12, alignItems: 'center' },
  noRoomsText: { color: '#92400e', fontSize: 13, fontWeight: '600' },
  roomChip: { borderRadius: 12, padding: 12, marginRight: 10, backgroundColor: '#f8f5f0', borderWidth: 1.5, borderColor: '#e5e0d5', minWidth: 100, alignItems: 'center' },
  roomChipSelected: { backgroundColor: '#1a3c2e', borderColor: '#1a3c2e' },
  roomChipNum: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  roomChipType: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  roomChipPrice: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  roomChipTextSelected: { color: '#fff' },
  selectedRoom: { marginTop: 12, borderRadius: 12, padding: 12, borderWidth: 1.5 },
  selectedRoomTitle: { fontSize: 13, fontWeight: '700' },
  selectedRoomSub: { fontSize: 12, marginTop: 2 },
  selectedRoomTotal: { fontSize: 13, fontWeight: '800', marginTop: 6 },
  nextBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
  calOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  calCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calNav: { padding: 8 },
  calNavText: { fontSize: 24, color: '#374151' },
  calTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  calDaysRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#6b7280' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  calCellSelected: { backgroundColor: '#1a3c2e' },
  calCellDisabled: { opacity: 0.3 },
  calCellText: { fontSize: 14, color: '#1e293b' },
  calCellTextSelected: { color: '#fff', fontWeight: '700' },
  calCellTextDisabled: { color: '#9ca3af' },
  calClose: { marginTop: 16, padding: 14, alignItems: 'center', backgroundColor: '#f8f5f0', borderRadius: 12 },
  calCloseText: { fontSize: 14, fontWeight: '700', color: '#374151' },
});
