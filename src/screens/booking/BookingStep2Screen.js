// src/screens/booking/BookingStep2Screen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Modal, FlatList, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

const ID_TYPES = ['Passport','Citizenship','Driving Licence','Voter ID','Other'];

// Nationality → dial code map
const NATIONALITY_DIAL = {
  'Nepali': '+977', 'Indian': '+91', 'Chinese': '+86',
  'American': '+1', 'British': '+44', 'Australian': '+61',
  'German': '+49', 'French': '+33', 'Japanese': '+81',
  'Korean': '+82', 'Canadian': '+1', 'Singaporean': '+65',
  'Other': '+',
};

const NATIONALITIES = Object.keys(NATIONALITY_DIAL);

function Field({ label, value, onChange, placeholder, keyboard = 'default', secure = false, theme }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textLight }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
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

function PhoneField({ value, onChange, theme }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textLight }]}>PHONE *</Text>
      <View style={[styles.phoneWrap, { borderColor: theme.border, backgroundColor: theme.white }]}>
        <TextInput
          style={[styles.phoneInput, { color: theme.text }]}
          value={value}
          onChangeText={onChange}
          placeholder="+977 98XXXXXXXX"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

function DropdownField({ label, value, options, onChange, theme }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textLight }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor: theme.border, backgroundColor: theme.white }]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.dropdownText, { color: value ? theme.text : '#9ca3af' }]}>{value || 'Select…'}</Text>
        <Text style={{ color: theme.textLight, fontSize: 14 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="slide">
        <TouchableOpacity style={styles.dropOverlay} activeOpacity={1} onPress={() => setShow(false)}>
          <View style={[styles.dropCard, { backgroundColor: theme.white }]}>
            <View style={[styles.dropHandle, { backgroundColor: theme.border }]} />
            <Text style={[styles.dropTitle, { color: theme.primary }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropItem, { borderBottomColor: theme.border }, item === value && { backgroundColor: theme.primary + '10' }]}
                  onPress={() => { onChange(item); setShow(false); }}
                >
                  <Text style={[styles.dropItemText, { color: theme.text }, item === value && { color: theme.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {item === value && <Text style={[styles.dropCheck, { color: theme.primary }]}>✓</Text>}
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
  const { theme }  = useTheme();
  const { booking, updateBooking } = useBooking();
  const { user }   = useAuth();

  const [form, setForm] = useState({
    first_name:       user?.first_name  || '',
    last_name:        user?.last_name   || '',
    email:            user?.email       || '',
    phone:            user?.phone       || '',
    nationality:      user?.nationality || 'Nepali',
    id_type:          'Citizenship',
    id_number:        '',
    special_requests: '',
  });

  // FIX: auto-set dial code when nationality changes
  useEffect(() => {
    const dial = NATIONALITY_DIAL[form.nationality] || '+';
    // Only update if phone is empty or currently just a dial code
    if (!form.phone || NATIONALITY_DIAL[Object.keys(NATIONALITY_DIAL).find(k => form.phone === NATIONALITY_DIAL[k]) || '']) {
      setForm(p => ({ ...p, phone: dial + ' ' }));
    }
  }, [form.nationality]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canProceed = form.first_name && form.last_name && form.email && form.phone.length > 5;

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
        <View style={{ flex: 1 }}>
          <Text style={styles.headerStep}>STEP 2 OF 3</Text>
          <Text style={styles.headerTitle}>Guest Details</Text>
        </View>
        <View style={styles.stepDots}>
          {[1,2,3].map(i => (
            <View key={i} style={[
              styles.stepDot,
              { backgroundColor: i <= 2 ? theme.secondary : 'rgba(255,255,255,0.3)' },
              i === 2 && { width: 20 },
            ]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>👤 Personal Information</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="FIRST NAME *" value={form.first_name} onChange={v => set('first_name', v)} placeholder="John" theme={theme} />
            </View>
            <View style={styles.half}>
              <Field label="LAST NAME *"  value={form.last_name}  onChange={v => set('last_name', v)}  placeholder="Doe" theme={theme} />
            </View>
          </View>
          <Field label="EMAIL *" value={form.email} onChange={v => set('email', v)} placeholder="john@email.com" keyboard="email-address" theme={theme} />

          {/* Nationality first so dial code auto-sets */}
          <DropdownField label="NATIONALITY" value={form.nationality} options={NATIONALITIES} onChange={v => set('nationality', v)} theme={theme} />

          {/* FIX: phone pre-filled with dial code from nationality */}
          <PhoneField value={form.phone} onChange={v => set('phone', v)} theme={theme} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>🪪 ID Verification</Text>
          <DropdownField label="ID TYPE" value={form.id_type} options={ID_TYPES} onChange={v => set('id_type', v)} theme={theme} />
          <Field label="ID NUMBER" value={form.id_number} onChange={v => set('id_number', v)} placeholder="Enter your ID number" theme={theme} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>📝 Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textarea, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
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
          style={[styles.nextBtn, { backgroundColor: canProceed ? theme.primary : theme.border }, canProceed && styles.nextBtnShadow]}
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
  stepDots: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7, textTransform: 'uppercase' },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  textarea: { minHeight: 100, paddingTop: 12 },
  phoneWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  dropdownText: { fontSize: 14 },
  dropOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  dropCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '65%', paddingBottom: 36 },
  dropHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  dropTitle: { fontSize: 15, fontWeight: '800', paddingHorizontal: 20, paddingVertical: 14 },
  dropItem: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropItemText: { fontSize: 15 },
  dropCheck: { fontSize: 16, fontWeight: '700' },
  nextBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  nextBtnShadow: { shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  nextBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
