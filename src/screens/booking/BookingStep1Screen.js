// src/screens/booking/BookingStep1Screen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import api from '../../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const API_BASE = 'https://hotel.primelogic.com.np';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
}

function StepDots({ current, theme }) {
  return (
    <View style={sdStyles.row}>
      {[1,2,3].map(i => (
        <View
          key={i}
          style={[
            sdStyles.dot,
            { backgroundColor: i <= current ? theme.secondary : 'rgba(255,255,255,0.3)' },
            i === current && sdStyles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}
const sdStyles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 20 },
});

function Calendar({ label, value, onChange, minDate, theme }) {
  const [show, setShow] = useState(false);
  const today           = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const first   = new Date(year, month, 1).getDay();
  const daysInM = new Date(year, month + 1, 0).getDate();
  const cells   = Array(first).fill(null).concat(Array.from({ length: daysInM }, (_, i) => i + 1));
  const toStr   = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const today0  = toStr(today.getFullYear(), today.getMonth(), today.getDate());
  const isDisabled = d => !d || toStr(year, month, d) < (minDate || today0);
  const isSelected = d => d && value === toStr(year, month, d);
  const isToday    = d => d && toStr(year, month, d) === today0;

  const prevM = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextM = () => month === 11 ? (setMonth(0),  setYear(y => y+1)) : setMonth(m => m+1);

  return (
    <View style={calStyles.field}>
      <Text style={[calStyles.label, { color: theme.textLight }]}>{label}</Text>
      <TouchableOpacity
        style={[calStyles.btn, { borderColor: value ? theme.primary : theme.border, backgroundColor: theme.white }]}
        onPress={() => setShow(true)}
      >
        <Text style={[calStyles.btnText, { color: value ? theme.primary : theme.textLight }]}>
          {value || 'Select date'}
        </Text>
        <Text style={calStyles.icon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="slide">
        <View style={calStyles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShow(false)} />
          <View style={[calStyles.card, { backgroundColor: theme.white }]}>
            <View style={calStyles.header}>
              <TouchableOpacity onPress={prevM} style={calStyles.nav}><Text style={calStyles.navText}>‹</Text></TouchableOpacity>
              <Text style={[calStyles.title, { color: theme.primary }]}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextM} style={calStyles.nav}><Text style={calStyles.navText}>›</Text></TouchableOpacity>
            </View>
            <View style={calStyles.daysRow}>
              {DAYS.map(d => <Text key={d} style={[calStyles.dayLabel, { color: theme.textLight }]}>{d}</Text>)}
            </View>
            <View style={calStyles.grid}>
              {cells.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  disabled={isDisabled(d)}
                  onPress={() => { onChange(toStr(year, month, d)); setShow(false); }}
                  style={[
                    calStyles.cell,
                    isSelected(d) && { backgroundColor: theme.primary },
                    isToday(d) && !isSelected(d) && { borderWidth: 1.5, borderColor: theme.primary },
                    isDisabled(d) && calStyles.disabled,
                  ]}
                >
                  <Text style={[
                    calStyles.cellText,
                    { color: theme.text },
                    isSelected(d) && { color: '#fff', fontWeight: '700' },
                    isDisabled(d) && { color: theme.textLight },
                  ]}>
                    {d || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[calStyles.close, { backgroundColor: theme.primary }]}
              onPress={() => setShow(false)}
            >
              <Text style={[calStyles.closeText, { color: theme.secondary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const calStyles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  btn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  btnText: { fontSize: 14, fontWeight: '600' },
  icon: { fontSize: 18 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  card: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  nav: { padding: 10 },
  navText: { fontSize: 26, color: '#374151' },
  title: { fontSize: 17, fontWeight: '800' },
  daysRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  disabled: { opacity: 0.3 },
  cellText: { fontSize: 14 },
  close: { marginTop: 18, padding: 16, alignItems: 'center', borderRadius: 14 },
  closeText: { fontSize: 15, fontWeight: '800' },
});

function Counter({ label, sub, value, onChange, min = 0, max = 10, theme }) {
  return (
    <View style={ctrStyles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={[ctrStyles.label, { color: theme.text }]}>{label}</Text>
        {sub && <Text style={[ctrStyles.sub, { color: theme.textLight }]}>{sub}</Text>}
      </View>
      <View style={ctrStyles.row}>
        <TouchableOpacity
          style={[ctrStyles.btn, { backgroundColor: theme.background, borderColor: theme.border }, value <= min && { opacity: 0.4 }]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Text style={[ctrStyles.btnTxt, { color: theme.primary }]}>−</Text>
        </TouchableOpacity>
        <Text style={[ctrStyles.val, { color: theme.primary }]}>{value}</Text>
        <TouchableOpacity
          style={[ctrStyles.btn, { backgroundColor: theme.primary }]}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={[ctrStyles.btnTxt, { color: '#fff' }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const ctrStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  label: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnTxt: { fontSize: 20, fontWeight: '600', lineHeight: 22 },
  val: { fontSize: 22, fontWeight: '800', minWidth: 30, textAlign: 'center' },
});

function RoomChip({ room, selected, onPress, currency, theme }) {
  const price = room.base_price || 0;
  const url   = imgUrl(room.images?.[0]?.image_path);
  return (
    <TouchableOpacity
      style={[
        chipStyles.chip,
        { backgroundColor: theme.white, borderColor: theme.border },
        selected && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {url
        ? <Image source={{ uri: url }} style={chipStyles.img} />
        : <View style={[chipStyles.img, { backgroundColor: selected ? 'rgba(255,255,255,0.1)' : theme.background, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 24 }}>🛏</Text>
          </View>
      }
      <View style={chipStyles.info}>
        <Text style={[chipStyles.num, { color: selected ? '#fff' : theme.primary }]}>Room {room.room_number}</Text>
        <Text style={[chipStyles.type, { color: selected ? 'rgba(255,255,255,0.8)' : theme.textLight }]} numberOfLines={1}>{room.category_name}</Text>
        <Text style={[chipStyles.price, { color: selected ? theme.secondary : theme.primary }]}>{formatPrice(price, currency)}/night</Text>
      </View>
      {selected && <Text style={chipStyles.check}>✓</Text>}
    </TouchableOpacity>
  );
}
const chipStyles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, marginRight: 10, overflow: 'hidden', width: 200 },
  img: { width: 70, height: 70 },
  info: { flex: 1, padding: 10 },
  num: { fontSize: 14, fontWeight: '800' },
  type: { fontSize: 11, marginTop: 2 },
  price: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  check: { fontSize: 18, color: '#fff', marginRight: 12, fontWeight: '700' },
});

export default function BookingStep1Screen({ navigation, route }) {
  const { theme }    = useTheme();
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
      // Keep preselected if dates change; user can manually pick another
      // Try dedicated availability endpoint, fall back to all rooms
      const doFetch = async () => {
        try {
          const r = await api.get("/rooms/available", {
            params: { check_in: booking.checkIn, check_out: booking.checkOut },
          });
          return Array.isArray(r.data) ? r.data : (r.data?.data || r.data?.rooms || []);
        } catch {
          try {
            const r = await api.get("/rooms");
            const all = Array.isArray(r.data) ? r.data : (r.data?.data || r.data?.rooms || []);
            return all.filter(rm => rm.status !== "maintenance");
          } catch { return []; }
        }
      };
      doFetch().then(data => {
        setAvailableRooms(data);
        if (preselected) {
          const match = data.find(x => x.id === preselected.id);
          if (match) updateBooking({ room: match });
        }
      }).finally(() => setLoadingRooms(false));
    }
  }, [booking.checkIn, booking.checkOut]);

  const canProceed = booking.checkIn && booking.checkOut
    && booking.checkIn < booking.checkOut && booking.room;

  const totalGuests = (booking.adults || 1) + (booking.children || 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerStep}>STEP 1 OF 3</Text>
          <Text style={styles.headerTitle}>Dates & Room</Text>
        </View>
        <StepDots current={1} theme={theme} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Dates */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📅 Stay Dates</Text>
          <View style={styles.datesRow}>
            <View style={styles.half}>
              <Calendar label="Check-In"  value={booking.checkIn}  onChange={v => updateBooking({ checkIn: v })}  theme={theme} />
            </View>
            <View style={styles.arrowBox}>
              <Text style={[styles.arrow, { color: theme.textLight }]}>→</Text>
            </View>
            <View style={styles.half}>
              <Calendar label="Check-Out" value={booking.checkOut} onChange={v => updateBooking({ checkOut: v })} minDate={booking.checkIn} theme={theme} />
            </View>
          </View>
          {nights > 0 && (
            <View style={[styles.nightsBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.nightsText, { color: theme.secondary }]}>🌙 {nights} night{nights !== 1 ? 's' : ''} stay</Text>
            </View>
          )}
        </View>

        {/* Guests */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👥 Guests · {totalGuests} total</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Counter label="Adults"   sub="Age 13+" value={booking.adults}   onChange={v => updateBooking({ adults: v })}   min={1} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Counter label="Children" sub="Under 13" value={booking.children} onChange={v => updateBooking({ children: v })} min={0} theme={theme} />
        </View>

        {/* Room Selection */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>🛏 Select Room</Text>

          {!booking.checkIn || !booking.checkOut
            ? <View style={[styles.hintBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.hint, { color: theme.textLight }]}>
                  📅 Select check-in and check-out dates above to see available rooms
                </Text>
              </View>
            : loadingRooms
              ? <View style={styles.loadingBox}>
                  <ActivityIndicator color={theme.primary} size="small" />
                  <Text style={[styles.loadingText, { color: theme.textLight }]}>Checking availability…</Text>
                </View>
              : availableRooms.length === 0
                ? <View style={[styles.noRooms, { backgroundColor: '#fef3c7' }]}>
                    <Text style={styles.noRoomsText}>⚠️ No rooms available for these dates</Text>
                    <Text style={[styles.noRoomsSub, { color: '#92400e' }]}>Try different dates</Text>
                  </View>
                : <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                    {availableRooms.map(r => (
                      <RoomChip
                        key={r.id}
                        room={r}
                        selected={booking.room?.id === r.id}
                        onPress={() => updateBooking({ room: r })}
                        currency={currency}
                        theme={theme}
                      />
                    ))}
                  </ScrollView>
          }

          {booking.room && (
            <View style={[styles.selectedBox, { borderColor: theme.primary, backgroundColor: theme.primary + '08' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.selectedTitle, { color: theme.primary }]}>
                  ✅ Room {booking.room.room_number} — {booking.room.category_name}
                </Text>
                <Text style={[styles.selectedSub, { color: theme.textLight }]}>
                  {formatPrice(booking.room.base_price || 0, currency)}/night
                  {booking.room.floor ? ` · Floor ${booking.room.floor}` : ''}
                </Text>
              </View>
              {nights > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.selectedTotal, { color: theme.primary }]}>{formatPrice(total, currency)}</Text>
                  <Text style={[styles.selectedTotalSub, { color: theme.textLight }]}>est. total</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: canProceed ? theme.primary : theme.border },
            canProceed && styles.nextBtnActive,
          ]}
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
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  card: { borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16, letterSpacing: 0.2 },
  datesRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  half: { flex: 1 },
  arrowBox: { paddingBottom: 14, paddingHorizontal: 4 },
  arrow: { fontSize: 18 },
  nightsBadge: { borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 14 },
  nightsText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  divider: { height: 1 },
  hintBox: { borderRadius: 12, padding: 16 },
  hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  loadingText: { fontSize: 13 },
  noRooms: { borderRadius: 12, padding: 14, alignItems: 'center' },
  noRoomsText: { color: '#92400e', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  noRoomsSub: { fontSize: 12 },
  selectedBox: { flexDirection: 'row', alignItems: 'center', marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  selectedTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  selectedSub: { fontSize: 12 },
  selectedTotal: { fontSize: 20, fontWeight: '800' },
  selectedTotalSub: { fontSize: 11, marginTop: 2 },
  nextBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  nextBtnActive: { shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  nextBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
