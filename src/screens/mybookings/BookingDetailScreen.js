// src/screens/mybookings/BookingDetailScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

function Row({ label, value, highlight }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

function StarInput({ rating, onChange }) {
  return (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} style={styles.starBtn}>
          <Text style={[styles.star, { color: i <= rating ? '#f59e0b' : '#d1d5db' }]}>★</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.ratingLabel}>
        {['','Poor','Fair','Good','Great','Excellent'][rating]}
      </Text>
    </View>
  );
}

export default function BookingDetailScreen({ route, navigation }) {
  const { booking: b }   = route.params;
  const { theme, hotel } = useTheme();
  const { currency }     = useBooking();

  const [proofUri, setProofUri]         = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [rating, setRating]             = useState(5);
  const [reviewText, setReviewText]     = useState('');     // Fix: properly tracked state
  const [reviewDone, setReviewDone]     = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const canCancel  = ['pending', 'confirmed'].includes(b.status);
  const canReview  = b.status === 'checked_out' && !reviewDone;
  const needsProof = b.payment_status === 'pending' && b.payment_method !== 'cash';
  const amount     = b.total_amount ? Number(b.total_amount) : null;

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow photo access.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (r.canceled) return;
    const uri = r.assets[0].uri;
    setProofUri(uri);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('booking_reference', b.booking_reference);
      fd.append('payment_proof', { uri, name: 'proof.jpg', type: 'image/jpeg' });
      await api.post('/payments/upload-proof', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('✅ Uploaded', 'Payment proof uploaded. We will verify it shortly.');
    } catch {
      Alert.alert('Upload Failed', 'Please try again.');
    } finally { setUploading(false); }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      `Cancel booking #${b.booking_reference}?\n\nThis action cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
            setCancelling(true);
            try {
              // Fix: use booking id for the modify endpoint
              await api.put(`/bookings/${b.id}/cancel`);
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert('Error', 'Could not cancel. Please contact the hotel directly.');
            } finally { setCancelling(false); }
          },
        },
      ],
    );
  };

  const handleReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please write a short review before submitting.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/public/reviews', {
        booking_id:        b.id,
        booking_reference: b.booking_reference,
        rating,
        review:            reviewText.trim(),
      });
      setReviewDone(true);
      Alert.alert('Thank You! 🙏', 'Your review has been submitted and will appear after approval.');
    } catch {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } finally { setSubmittingReview(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <StatusBadge status={b.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Reference Hero */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.6)' }]}>BOOKING REFERENCE</Text>
          <Text style={[styles.heroRef, { color: theme.secondary }]}>#{b.booking_reference}</Text>
          <Text style={[styles.heroRoom, { color: '#fff' }]}>{b.room_name || `Room ${b.room_number}`}</Text>
        </View>

        {/* Stay Details */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📅 Stay Details</Text>
          <Row label="Check-in"    value={b.check_in_date?.slice(0,10)} />
          <Row label="Check-out"   value={b.check_out_date?.slice(0,10)} />
          <Row label="Duration"    value={`${b.nights} night${b.nights !== 1 ? 's' : ''}`} />
          <Row label="Guests"      value={`${b.adults} adult${b.adults !== 1 ? 's' : ''}${b.children > 0 ? `, ${b.children} child${b.children !== 1 ? 'ren' : ''}` : ''}`} />
          {b.special_requests && <Row label="Requests" value={b.special_requests} />}
        </View>

        {/* Payment */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>💳 Payment</Text>
          <Row label="Method"    value={(b.payment_method || '—').replace(/_/g, ' ')} />
          <Row label="Status"    value={(b.payment_status || '—').replace(/_/g, ' ')} />
          {amount && <Row label="Total" value={formatPrice(amount, currency)} highlight />}
        </View>

        {/* Upload Proof */}
        {needsProof && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>📎 Payment Proof</Text>
            <Text style={[styles.proofHint, { color: theme.textLight }]}>
              Upload your payment screenshot or transfer receipt to confirm your booking.
            </Text>
            {proofUri && (
              <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
            )}
            <TouchableOpacity
              style={[styles.uploadBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '08' }]}
              onPress={pickAndUpload}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator color={theme.primary} />
                : <Text style={[styles.uploadBtnText, { color: theme.primary }]}>
                    {proofUri ? '📎 Change Photo' : '📎 Upload Payment Proof'}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Review */}
        {canReview && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>⭐ Leave a Review</Text>
            <Text style={[styles.reviewSub, { color: theme.textLight }]}>How was your stay?</Text>
            <StarInput rating={rating} onChange={setRating} />

            {/* Fix: proper TextInput instead of <Text> */}
            <TextInput
              style={[styles.reviewInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share your experience at the hotel…"
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.reviewBtn, { backgroundColor: theme.primary }, submittingReview && { opacity: 0.6 }]}
              onPress={handleReview}
              disabled={submittingReview}
            >
              {submittingReview
                ? <ActivityIndicator color={theme.secondary} />
                : <Text style={[styles.reviewBtnText, { color: theme.secondary }]}>Submit Review</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {reviewDone && (
          <View style={[styles.card, styles.reviewDoneCard]}>
            <Text style={styles.reviewDoneText}>⭐ Review submitted — pending approval. Thank you!</Text>
          </View>
        )}

        {/* Cancel */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <ActivityIndicator color="#dc2626" />
              : <>
                  <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                  <Text style={styles.cancelBtnSub}>This action cannot be undone</Text>
                </>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  backText: { color: '#fff', fontSize: 22 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 12 },
  heroCard: { borderRadius: 18, padding: 22, alignItems: 'center' },
  heroLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  heroRef: { fontSize: 28, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  heroRoom: { fontSize: 18, fontWeight: '700' },
  card: { borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', maxWidth: '55%', textAlign: 'right', textTransform: 'capitalize' },
  rowHighlight: { fontSize: 16, fontWeight: '800', color: '#1a3c2e' },
  proofHint: { fontSize: 13, lineHeight: 20, marginBottom: 14 },
  proofPreview: { width: '100%', height: 170, borderRadius: 12, marginBottom: 12 },
  uploadBtn: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  uploadBtnText: { fontSize: 14, fontWeight: '700' },
  reviewSub: { fontSize: 13, marginBottom: 14 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  starBtn: { padding: 4 },
  star: { fontSize: 34 },
  ratingLabel: { fontSize: 14, fontWeight: '700', color: '#f59e0b', marginLeft: 8 },
  reviewInput: {
    borderWidth: 1.5, borderRadius: 14, padding: 14,
    minHeight: 110, fontSize: 14, lineHeight: 22, marginBottom: 14,
  },
  reviewBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  reviewBtnText: { fontSize: 14, fontWeight: '800' },
  reviewDoneCard: { backgroundColor: '#f0fdf4', alignItems: 'center' },
  reviewDoneText: { color: '#065f46', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  cancelBtn: {
    borderWidth: 1.5, borderColor: '#dc2626', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', backgroundColor: '#fff5f5',
  },
  cancelBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '800' },
  cancelBtnSub: { color: '#ef4444', fontSize: 11, marginTop: 4 },
});
