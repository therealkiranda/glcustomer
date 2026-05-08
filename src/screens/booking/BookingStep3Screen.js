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

const PAY_METHODS = [
  { key: 'qr_transfer',    icon: '📱', label: 'QR / Bank Transfer' },
  { key: 'cash',           icon: '💵', label: 'Cash on Arrival' },
  { key: 'bank_transfer',  icon: '🏦', label: 'Bank Transfer' },
];

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

export default function BookingStep3Screen({ navigation }) {
  const { theme, hotel }                         = useTheme();
  const { booking, updateBooking, resetBooking, nights, subtotal, taxes, serviceCharge, total, currency } = useBooking();
  const { user }                                 = useAuth();
  const [loading, setLoading]                    = useState(false);
  const [proofUri, setProofUri]                  = useState(null);
  const [qrInfo, setQrInfo]                      = useState(hotel);

  const { guestDetails, room, checkIn, checkOut, paymentMethod = 'qr_transfer' } = booking;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo access.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!r.canceled) setProofUri(r.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'qr_transfer' && !proofUri) {
      Alert.alert('Payment Proof Required', 'Please upload your payment proof before confirming.'); return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('room_id',          room.id);
      formData.append('check_in_date',    checkIn);
      formData.append('check_out_date',   checkOut);
      formData.append('adults',           booking.adults);
      formData.append('children',         booking.children);
      formData.append('guest_first_name', guestDetails.first_name);
      formData.append('guest_last_name',  guestDetails.last_name);
      formData.append('guest_email',      guestDetails.email);
      formData.append('guest_phone',      guestDetails.phone);
      formData.append('guest_nationality',guestDetails.nationality);
      formData.append('guest_id_type',    guestDetails.id_type);
      formData.append('guest_id_number',  guestDetails.id_number || '');
      formData.append('payment_method',   paymentMethod);
      formData.append('special_requests', booking.specialRequests || '');

      if (proofUri) {
        formData.append('payment_proof', {
          uri: proofUri, name: 'proof.jpg', type: 'image/jpeg',
        });
      }

      const res = await api.post('/bookings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      resetBooking();
      navigation.replace('Success', { booking: res.data });
    } catch (e) {
      Alert.alert('Booking Failed', e.response?.data?.error || e.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerStep}>STEP 3 OF 3</Text>
          <Text style={styles.headerTitle}>Confirm & Pay</Text>
        </View>
        <View style={styles.stepDots}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, { backgroundColor: theme.secondary }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Booking Summary */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📋 Booking Summary</Text>
          <SummaryRow label="Room"       value={`${room?.room_number} — ${room?.category_name}`} />
          <SummaryRow label="Check-in"   value={checkIn} />
          <SummaryRow label="Check-out"  value={checkOut} />
          <SummaryRow label="Nights"     value={`${nights} night${nights !== 1 ? 's' : ''}`} />
          <SummaryRow label="Guests"     value={`${booking.adults} adults, ${booking.children} children`} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SummaryRow label="Room rate"  value={`${formatPrice(room?.base_price || 0, currency)} × ${nights}`} />
          <SummaryRow label="Subtotal"   value={formatPrice(subtotal, currency)} />
          <SummaryRow label="VAT (13%)"  value={formatPrice(taxes, currency)} />
          <SummaryRow label="Service (10%)" value={formatPrice(serviceCharge, currency)} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SummaryRow label="Total"      value={formatPrice(total, currency)} bold />
        </View>

        {/* Guest Summary */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👤 Guest Details</Text>
          <SummaryRow label="Name"   value={`${guestDetails?.first_name} ${guestDetails?.last_name}`} />
          <SummaryRow label="Email"  value={guestDetails?.email} />
          <SummaryRow label="Phone"  value={guestDetails?.phone} />
          {guestDetails?.nationality && <SummaryRow label="Nationality" value={guestDetails.nationality} />}
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>💳 Payment Method</Text>
          {PAY_METHODS.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.payMethod, paymentMethod === m.key && { borderColor: theme.primary, backgroundColor: theme.primary + '08' }]}
              onPress={() => updateBooking({ paymentMethod: m.key })}
            >
              <Text style={styles.payMethodIcon}>{m.icon}</Text>
              <Text style={[styles.payMethodLabel, { color: paymentMethod === m.key ? theme.primary : theme.text }]}>{m.label}</Text>
              {paymentMethod === m.key && <Text style={[styles.payMethodCheck, { color: theme.primary }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* QR Code Display */}
        {paymentMethod === 'qr_transfer' && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>📱 Scan & Pay</Text>
            {hotel.qr_code_image_path ? (
              <Image
                source={{ uri: `https://hotel.primelogic.com.np/${hotel.qr_code_image_path}` }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.qrPlaceholder, { backgroundColor: theme.primary + '10' }]}>
                <Text style={styles.qrPlaceholderText}>📱</Text>
                <Text style={[styles.qrPlaceholderSub, { color: theme.textLight }]}>QR code not available</Text>
              </View>
            )}
            {hotel.qr_bank_name && (
              <View style={styles.bankInfo}>
                <Text style={[styles.bankName, { color: theme.primary }]}>{hotel.qr_bank_name}</Text>
                {hotel.qr_account_name && <Text style={[styles.bankDetail, { color: theme.textLight }]}>Account: {hotel.qr_account_name}</Text>}
                {hotel.qr_account_number && <Text style={[styles.bankDetail, { color: theme.textLight }]}>Number: {hotel.qr_account_number}</Text>}
              </View>
            )}
            {hotel.qr_payment_instructions && (
              <Text style={[styles.payInstructions, { color: theme.textLight }]}>{hotel.qr_payment_instructions}</Text>
            )}

            {/* Proof Upload */}
            <Text style={[styles.proofLabel, { color: theme.primary }]}>Upload Payment Proof *</Text>
            <TouchableOpacity style={[styles.uploadBtn, { borderColor: theme.primary }]} onPress={pickImage}>
              {proofUri
                ? <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
                : <>
                    <Text style={styles.uploadIcon}>📎</Text>
                    <Text style={[styles.uploadText, { color: theme.primary }]}>Tap to upload proof</Text>
                    <Text style={[styles.uploadSub, { color: theme.textLight }]}>Photo or screenshot</Text>
                  </>
              }
            </TouchableOpacity>
            {proofUri && (
              <TouchableOpacity onPress={() => setProofUri(null)} style={styles.removeProof}>
                <Text style={[styles.removeProofText, { color: theme.error }]}>Remove proof ✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }, loading && styles.confirmDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={theme.secondary} />
            : <Text style={[styles.confirmBtnText, { color: theme.secondary }]}>✅ Confirm Booking</Text>
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
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  summaryLabel: { fontSize: 13, color: '#374151' },
  summaryValue: { fontSize: 13, color: '#1e293b', fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  summaryBold: { fontWeight: '800', fontSize: 15 },
  divider: { height: 1, marginVertical: 8 },
  payMethod: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e0d5', marginBottom: 10 },
  payMethodIcon: { fontSize: 20 },
  payMethodLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  payMethodCheck: { fontSize: 16, fontWeight: '700' },
  qrImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  qrPlaceholder: { height: 200, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrPlaceholderText: { fontSize: 48 },
  qrPlaceholderSub: { fontSize: 13, marginTop: 8 },
  bankInfo: { backgroundColor: '#f8f5f0', borderRadius: 10, padding: 12, marginBottom: 12 },
  bankName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  bankDetail: { fontSize: 13, marginTop: 2 },
  payInstructions: { fontSize: 13, lineHeight: 20, marginBottom: 16, fontStyle: 'italic' },
  proofLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  uploadBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, padding: 24, alignItems: 'center', minHeight: 120 },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 14, fontWeight: '700' },
  uploadSub: { fontSize: 12, marginTop: 4 },
  proofPreview: { width: '100%', height: 200, borderRadius: 10 },
  removeProof: { alignItems: 'center', padding: 8, marginTop: 8 },
  removeProofText: { fontSize: 13, fontWeight: '600' },
  confirmBtn: { borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginTop: 8 },
  confirmDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
