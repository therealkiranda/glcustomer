// src/screens/mybookings/BookingDetailScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function StarInput({ rating, onChange }) {
  return (
    <View style={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={[styles.star, { color: i <= rating ? '#f59e0b' : '#d1d5db' }]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function BookingDetailScreen({ route, navigation }) {
  const { booking: b }     = route.params;
  const { theme, hotel }   = useTheme();
  const [proofUri, setProofUri]     = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating]         = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDone, setReviewDone] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const canCancel = ['pending', 'confirmed'].includes(b.status);
  const canReview = b.status === 'checked_out' && !reviewDone;
  const needsProof = b.payment_status === 'pending' && b.payment_method !== 'cash';

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (r.canceled) return;
    const uri = r.assets[0].uri;
    setProofUri(uri);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('booking_reference', b.booking_reference);
      fd.append('payment_proof', { uri, name: 'proof.jpg', type: 'image/jpeg' });
      await api.post('/payments/upload-proof', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('✅ Uploaded', 'Payment proof uploaded successfully. We will verify it shortly.');
    } catch {
      Alert.alert('Upload Failed', 'Please try again.');
    } finally { setUploading(false); }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Booking', `Cancel booking #${b.booking_reference}? This cannot be undone.`, [
      { text: 'Keep Booking', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: async () => {
        setCancelling(true);
        try {
          await api.put(`/bookings/${b.booking_reference}/modify`, { status: 'cancelled' });
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch {
          Alert.alert('Error', 'Could not cancel. Please contact the hotel.');
        } finally { setCancelling(false); }
      }},
    ]);
  };

  const handleReview = async () => {
    if (!reviewText.trim()) { Alert.alert('Please write a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/public/reviews', {
        booking_id: b.id,
        booking_reference: b.booking_reference,
        rating,
        review: reviewText.trim(),
      });
      setReviewDone(true);
      Alert.alert('Thank you! 🙏', 'Your review has been submitted and will appear after approval.');
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

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.refCode, { color: theme.secondary }]}>#{b.booking_reference}</Text>
          <Text style={[styles.roomName, { color: theme.primary }]}>{b.room_name || `Room ${b.room_number}`}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Stay Details</Text>
          <Row label="Check-in"   value={b.check_in_date?.slice(0,10)} />
          <Row label="Check-out"  value={b.check_out_date?.slice(0,10)} />
          <Row label="Nights"     value={`${b.nights} night${b.nights !== 1 ? 's' : ''}`} />
          <Row label="Adults"     value={`${b.adults}`} />
          <Row label="Children"   value={b.children > 0 ? `${b.children}` : null} />
          {b.special_requests && <Row label="Requests" value={b.special_requests} />}
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Payment</Text>
          <Row label="Method"  value={(b.payment_method || '—').replace(/_/g, ' ')} />
          <Row label="Status"  value={(b.payment_status || '—').replace(/_/g, ' ')} />
          <Row label="Total"   value={`${hotel.currency_symbol || 'Rs'}${Number(b.total_amount || 0).toLocaleString()}`} />
        </View>

        {needsProof && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>📎 Upload Payment Proof</Text>
            <Text style={[styles.proofHint, { color: theme.textLight }]}>Please upload your payment proof to confirm your booking.</Text>
            {proofUri && <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />}
            <TouchableOpacity
              style={[styles.uploadBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '08' }, uploading && { opacity: 0.6 }]}
              onPress={pickAndUpload}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator color={theme.primary} />
                : <Text style={[styles.uploadBtnText, { color: theme.primary }]}>{proofUri ? '📎 Change Proof' : '📎 Upload Proof'}</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {canReview && (
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>⭐ Leave a Review</Text>
            <StarInput rating={rating} onChange={setRating} />
            <View style={[styles.reviewInput, { borderColor: theme.border }]}>
              <Text
                style={[styles.reviewInputText, { color: reviewText ? theme.text : theme.textLight }]}
                onPress={() => {}}
              >
                {reviewText || 'Write your experience…'}
              </Text>
            </View>
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
          <View style={[styles.card, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[styles.reviewDone, { color: theme.success }]}>✅ Review submitted — pending approval</Text>
          </View>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <ActivityIndicator color="#dc2626" />
              : <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
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
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  refCode: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  roomName: { fontSize: 22, fontWeight: '800' },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', maxWidth: '55%', textAlign: 'right', textTransform: 'capitalize' },
  proofHint: { fontSize: 13, marginBottom: 12 },
  proofPreview: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10 },
  uploadBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  uploadBtnText: { fontSize: 14, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  star: { fontSize: 32 },
  reviewInput: { borderWidth: 1.5, borderRadius: 12, padding: 14, minHeight: 100, marginBottom: 12 },
  reviewInputText: { fontSize: 14, lineHeight: 22 },
  reviewBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  reviewBtnText: { fontSize: 14, fontWeight: '700' },
  reviewDone: { fontSize: 14, fontWeight: '600', textAlign: 'center', padding: 4 },
  cancelBtn: { borderWidth: 1.5, borderColor: '#dc2626', borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: '#fff5f5' },
  cancelBtnText: { color: '#dc2626', fontSize: 14, fontWeight: '700' },
});
