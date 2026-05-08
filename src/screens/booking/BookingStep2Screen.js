// src/screens/booking/BookingStep2Screen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Modal, FlatList, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

const ID_TYPES     = ['Passport','Citizenship','Driving Licence','Voter ID','Other'];
const NATIONALITIES= ['Nepali','Indian','Chinese','American','British','Australian','German','French','Japanese','Korean','Other'];

function Field({ label, value, onChange, placeholder, keyboard = 'default', secure = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboard}
        secureTextEntry={secure}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );
}

function DropdownField({ label, value, options, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShow(true)}>
        <Text style={[styles.dropdownText, !value && { color: '#9ca3af' }]}>{value || 'Select…'}</Text>
        <Text style={styles.dropdownArrow}>▾</Text>
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="fade">
        <TouchableOpacity style={styles.dropOverlay} activeOpacity={1} onPress={() => setShow(false)}>
          <View style={styles.dropCard}>
            <Text style={styles.dropTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.dropItem, item === value && styles.dropItemActive]} onPress={() => { onChange(item); setShow(false); }}>
                  <Text style={[styles.dropItemText, item === value && styles.dropItemTextActive]}>{item}</Text>
                  {item === value && <Text style={styles.dropCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function BookingStep2Screen({ navigation }) {
  const { theme }           = useTheme();
  const { booking, updateBooking } = useBooking();
  const { user }            = useAuth();

  const [form, setForm] = useState({
    first_name:   user?.first_name  || '',
    last_name:    user?.last_name   || '',
    email:        user?.email       || '',
    phone:        user?.phone       || '',
    nationality:  user?.nationality || 'Nepali',
    id_type:      'Citizenship',
    id_number:    '',
    special_requests: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canProceed = form.first_name && form.last_name && form.email && form.phone;

  const handleNext = () => {
    updateBooking({ guestDetails: form, specialRequests: form.special_requests });
    navigation.navigate('Step3');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerStep}>STEP 2 OF 3</Text>
          <Text style={styles.headerTitle}>Guest Details</Text>
        </View>
        <View style={styles.stepDots}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, { backgroundColor: i <= 2 ? theme.secondary : 'rgba(255,255,255,0.3)' }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👤 Personal Information</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="First Name *" value={form.first_name} onChange={v => set('first_name', v)} placeholder="John" />
            </View>
            <View style={styles.half}>
              <Field label="Last Name *"  value={form.last_name}  onChange={v => set('last_name', v)}  placeholder="Doe" />
            </View>
          </View>
          <Field label="Email *"  value={form.email} onChange={v => set('email', v)} placeholder="john@email.com" keyboard="email-address" />
          <Field label="Phone *"  value={form.phone} onChange={v => set('phone', v)} placeholder="+977 98XXXXXXXX" keyboard="phone-pad" />
          <DropdownField label="Nationality" value={form.nationality} options={NATIONALITIES} onChange={v => set('nationality', v)} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>🪪 ID Verification</Text>
          <DropdownField label="ID Type" value={form.id_type} options={ID_TYPES} onChange={v => set('id_type', v)} />
          <Field label="ID Number" value={form.id_number} onChange={v => set('id_number', v)} placeholder="Enter your ID number" />
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📝 Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.special_requests}
            onChangeText={v => set('special_requests', v)}
            placeholder="Any special requests, dietary requirements, room preferences…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: canProceed ? theme.primary : theme.border }]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextBtnText, { color: canProceed ? theme.secondary : theme.textLight }]}>
            Continue to Payment →
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
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#374151', letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e5e0d5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1e293b', backgroundColor: '#fafaf8' },
  textarea: { minHeight: 100, paddingTop: 12 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e0d5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fafaf8' },
  dropdownText: { fontSize: 14, color: '#1e293b' },
  dropdownArrow: { fontSize: 14, color: '#6b7280' },
  dropOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dropCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingTop: 20 },
  dropTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, marginBottom: 8 },
  dropItem: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropItemActive: { backgroundColor: '#f0fdf4' },
  dropItemText: { fontSize: 15, color: '#374151' },
  dropItemTextActive: { color: '#1a3c2e', fontWeight: '700' },
  dropCheck: { fontSize: 16, color: '#1a3c2e', fontWeight: '700' },
  nextBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
});
