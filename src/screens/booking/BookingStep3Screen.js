// src/screens/booking/BookingStep3Screen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const API_BASE = 'https://hotel.primelogic.com.np';

const PAY_METHODS = [
  { key: 'qr_transfer',   icon: '📱', label: 'QR / Bank Transfer',   sub: 'Scan QR and upload proof' },
  { key: 'cash',          icon: '💵', label: 'Cash on Arrival',      sub: 'Pay at the front desk' },
  { key: 'bank_transfer', icon: '🏦', label: 'Direct Bank Transfer', sub: 'Transfer to hotel account' },
];

function SummaryRow({ label, value, bold, accent, theme }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={[srStyles.row, bold && srStyles.boldRow, { borderBottomColor: '#f1f5f9' }]}>
      <Text style={[srStyles.label, bold && srStyles.boldLabel]}>{label}</Text>
      <Text style={[srStyles.value, bold && srStyles.boldValue, accent && { color: '#c9a96e' }]}>{value}</Text>
    </View>
  );
}
const srStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  boldRow: { borderBottomWidth: 0, paddingTop: 14 },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, color: '#1e293b', fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  boldLabel: { fontSize: 15, fontWeight: '700', color: '#1a3c2e' },
  boldValue: { fontSize: 20, fontWeight: '800', color: '#1a3c2e' },
});

export default function BookingStep3Screen({ navigation }) {
  const { theme, hotel }   = useTheme();
  const { booking, updateBooking, resetBooking, nights, subtotal, taxes, serviceCharge, total, currency } = useBooking();
  const { user }           = useAuth();
  const [loading, setLoading]   = useState(false);
  const [proofUri, setProofUri] = useState(null);

  const { guestDetails, room, checkIn, checkOut, paymentMethod = 'qr_transfer' } = booking;

  // FIX: safe room name — never show "undefined — undefined"
  const roomLabel = room
    ? [room.room_number ? `Room ${room.room_number}` : null, room.category_name].filter(Boolean).join(' — ')
    : 'Not selected';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow photo library access.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85,
    });
    if (!r.canceled) setProofUri(r.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!room?.id) { Alert.alert('No Room Selected', 'Please go back and select a room.'); return; }
    if (paymentMethod === 'qr_transfer' && !proofUri) {
      Alert.alert('Payment Proof Required', 'Please upload your payment proof before confirming.'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      // FIX: ensure all numeric fields are strings of valid numbers — prevent NaN
      fd.append('room_id',           String(room.id));
      fd.append('check_in_date',     checkIn);
      fd.append('check_out_date',    checkOut);
      fd.append('adults',            String(Number(booking.adults) || 1));
      fd.append('children',          String(Number(booking.children) || 0));
      fd.append('guest_first_name',  guestDetails?.first_name || '');
      fd.append('guest_last_name',   guestDetails?.last_name  || '');
      fd.append('guest_email',       guestDetails?.email      || '');
      fd.append('guest_phone',       guestDetails?.phone      || '');
      fd.append('guest_nationality', guestDetails?.nationality || '');
      fd.append('guest_id_type',     guestDetails?.id_type    || '');
      fd.append('guest_id_number',   guestDetails?.id_number  || '');
      fd.append('payment_method',    paymentMethod);
      fd.append('special_requests',  booking.specialRequests  || '');
      if (proofUri) {
        fd.append('payment_proof', { uri: proofUri, name: 'proof.jpg', type: 'image/jpeg' });
      }
      const res = await api.post('/bookings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      resetBooking();
      navigation.replace('Success', { booking: res.data });
    } catch (e) {
      Alert.alert('Booking Failed', e.response?.data?.error || e.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerStep}>STEP 3 OF 3</Text>
          <Text style={styles.headerTitle}>Confirm & Pay</Text>
        </View>
        <View style={styles.stepDots}>
          {[1,2,3].map(i => <View key={i} style={[styles.stepDot, { backgroundColor: theme.secondary }]} />)}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Booking Summary */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📋 Booking Summary</Text>
          <SummaryRow label="Room"      value={roomLabel} theme={theme} />
          <SummaryRow label="Check-in"  value={checkIn}   theme={theme} />
          <SummaryRow label="Check-out" value={checkOut}  theme={theme} />
          <SummaryRow label="Duration"  value={`${nights} night${nights !== 1 ? 's' : ''}`} theme={theme} />
          <SummaryRow label="Guests"
            value={`${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} child` : ''}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: '#f1f5f9' }]} />
          <SummaryRow label={`Room rate × ${nights}`} value={formatPrice(subtotal, currency)} theme={theme} />
          <SummaryRow label="VAT (13%)"               value={formatPrice(taxes, currency)} theme={theme} />
          <SummaryRow label="Service (10%)"           value={formatPrice(serviceCharge, currency)} theme={theme} />
          <View style={[styles.divider, { backgroundColor: '#f1f5f9' }]} />
          <SummaryRow label="Total Payable" value={formatPrice(total, currency)} bold accent theme={theme} />
        </View>

        {/* Guest Summary */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👤 Guest Details</Text>
          <SummaryRow label="Name"    value={`${guestDetails?.first_name || ''} ${guestDetails?.last_name || ''}`.trim()} theme={theme} />
          <SummaryRow label="Email"   value={guestDetails?.email}       theme={theme} />
          <SummaryRow label="Phone"   value={guestDetails?.phone}       theme={theme} />
          <SummaryRow label="Nationality" value={guestDetails?.nationality} theme={theme} />
          <SummaryRow label="ID"      value={guestDetails?.id_type && guestDetails?.id_number ? `${guestDetails.id_type}: ${guestDetails.id_number}` : guestDetails?.id_type} theme={theme} />
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>💳 Payment Method</Text>
          {PAY_METHODS.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.payMethod,
                { borderColor: theme.border },
                paymentMethod === m.key && { borderColor: theme.primary, backgroundColor: theme.primary + '08' },
              ]}
              onPress={() => updateBooking({ paymentMethod: m.key })}
              activeOpacity={0.8}
            >
              <Text style={styles.payIcon}>{m.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payLabel, { color: paymentMethod === m.key ? theme.primary : theme.text }]}>{m.label}</Text>
                <Text style={[styles.paySub, { color: theme.textLight }]}>{m.sub}</Text>
              </View>
              <View style={[styles.radio, { borderColor: paymentMethod === m.key ? theme.primary : theme.border }]}>
                {paymentMethod === m.key && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* QR & Proof */}
        {paymentMethod === 'qr_transfer' && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>📱 Scan & Pay</Text>
            {hotel.qr_code_image_path
              ? <Image source={{ uri: `${API_BASE}/${hotel.qr_code_image_path}` }} style={styles.qrImage} resizeMode="contain" />
              : <View style={[styles.qrPlaceholder, { backgroundColor: theme.background }]}>
                  <Text style={{ fontSize: 52 }}>📱</Text>
                  <Text style={[styles.qrPlaceholderText, { color: theme.textLight }]}>QR not configured</Text>
                </View>
            }
            {(hotel.qr_bank_name || hotel.qr_account_name) && (
              <View style={[styles.bankBox, { backgroundColor: theme.background }]}>
                {hotel.qr_bank_name      && <Text style={[styles.bankName,   { color: theme.primary }]}>{hotel.qr_bank_name}</Text>}
                {hotel.qr_account_name   && <Text style={[styles.bankDetail, { color: theme.textLight }]}>Account: {hotel.qr_account_name}</Text>}
                {hotel.qr_account_number && <Text style={[styles.bankDetail, { color: theme.textLight }]}>Number: {hotel.qr_account_number}</Text>}
              </View>
            )}
            {hotel.qr_payment_instructions && (
              <Text style={[styles.payInstructions, { color: theme.textLight }]}>{hotel.qr_payment_instructions}</Text>
            )}
            <Text style={[styles.proofLabel, { color: theme.primary }]}>Upload Payment Proof *</Text>
            <TouchableOpacity
              style={[styles.uploadBtn, { borderColor: proofUri ? theme.primary : theme.border }]}
              onPress={pickImage}
            >
              {proofUri
                ? <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
                : <>
                    <Text style={styles.uploadIcon}>📎</Text>
                    <Text style={[styles.uploadText, { color: theme.primary }]}>Tap to upload proof</Text>
                    <Text style={[styles.uploadSub, { color: theme.textLight }]}>Screenshot or photo of payment</Text>
                  </>
              }
            </TouchableOpacity>
            {proofUri && (
              <TouchableOpacity onPress={() => setProofUri(null)} style={styles.removeBtn}>
                <Text style={[styles.removeBtnText, { color: '#dc2626' }]}>Remove ✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={theme.secondary} />
            : <Text style={[styles.confirmText, { color: theme.secondary }]}>✅ Confirm Booking</Text>
          }
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
  stepDot: { width: 20, height: 8, borderRadius: 4 },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  card: { borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 14 },
  divider: { height: 1, marginVertical: 8 },
  payMethod: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
  payIcon: { fontSize: 22 },
  payLabel: { fontSize: 14, fontWeight: '700' },
  paySub: { fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  qrImage: { width: '100%', height: 240, borderRadius: 14, marginBottom: 16 },
  qrPlaceholder: { height: 180, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrPlaceholderText: { fontSize: 13, marginTop: 10 },
  bankBox: { borderRadius: 12, padding: 14, marginBottom: 14 },
  bankName: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  bankDetail: { fontSize: 13, marginTop: 3 },
  payInstructions: { fontSize: 13, lineHeight: 20, marginBottom: 16, fontStyle: 'italic' },
  proofLabel: { fontSize: 13, fontWeight: '800', marginBottom: 12 },
  uploadBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, padding: 28, alignItems: 'center', minHeight: 130 },
  uploadIcon: { fontSize: 36, marginBottom: 10 },
  uploadText: { fontSize: 15, fontWeight: '700' },
  uploadSub: { fontSize: 12, marginTop: 6 },
  proofPreview: { width: '100%', height: 200, borderRadius: 12 },
  removeBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  removeBtnText: { fontSize: 13, fontWeight: '700' },
  confirmBtn: { borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  confirmText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
