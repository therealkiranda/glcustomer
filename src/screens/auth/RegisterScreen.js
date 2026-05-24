// src/screens/auth/RegisterScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function Field({ label, value, onChange, placeholder, keyboard, secure, autoCapitalize, theme }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: theme.textLight }]}>{label}</Text>
      <View style={fStyles.inputWrap}>
        <TextInput
          style={[fStyles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }, secure && fStyles.pwPad]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textLight}
          keyboardType={keyboard || 'default'}
          secureTextEntry={secure && !showPw}
          autoCapitalize={autoCapitalize || (keyboard === 'email-address' ? 'none' : 'words')}
          autoCorrect={false}
        />
        {secure && (
          <TouchableOpacity style={fStyles.eye} onPress={() => setShowPw(v => !v)}>
            <Text style={{ fontSize: 18 }}>{showPw ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
const fStyles = StyleSheet.create({
  wrap: { gap: 7, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  inputWrap: { position: 'relative' },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  pwPad: { paddingRight: 52 },
  eye: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
});

export default function RegisterScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const { register }     = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', password: '', confirm: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email.trim().toLowerCase(),
        phone:      form.phone,
        password:   form.password,
      });
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.error || e.response?.data?.message || 'Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.top, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.hotelName, { color: theme.secondary }]}>{hotel.name || 'Hotel'}</Text>
        <Text style={styles.topTitle}>Create Account</Text>
        <Text style={styles.topSub}>Join us for seamless bookings and exclusive perks</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.nameRow}>
          <View style={styles.half}>
            <Field label="First Name *" value={form.first_name} onChange={v => set('first_name', v)} placeholder="John" theme={theme} />
          </View>
          <View style={styles.half}>
            <Field label="Last Name *"  value={form.last_name}  onChange={v => set('last_name', v)}  placeholder="Doe"  theme={theme} />
          </View>
        </View>

        <Field label="Email Address *" value={form.email}    onChange={v => set('email', v)}    placeholder="you@email.com" keyboard="email-address" autoCapitalize="none" theme={theme} />
        <Field label="Phone Number"    value={form.phone}    onChange={v => set('phone', v)}    placeholder="+977 98XXXXXXXX" keyboard="phone-pad" autoCapitalize="none" theme={theme} />
        <Field label="Password *"      value={form.password} onChange={v => set('password', v)} placeholder="Min. 6 characters" secure autoCapitalize="none" theme={theme} />
        <Field label="Confirm Password *" value={form.confirm} onChange={v => set('confirm', v)} placeholder="Repeat password" secure autoCapitalize="none" theme={theme} />

        <TouchableOpacity
          style={[styles.registerBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.75 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={theme.secondary} />
            : <Text style={[styles.registerBtnText, { color: theme.secondary }]}>Create Account →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={[styles.loginLinkText, { color: theme.textLight }]}>
            Already have an account?{' '}
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 28 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 22 },
  hotelName: { fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  topTitle: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  topSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },
  form: { padding: 24, paddingTop: 28, paddingBottom: 60 },
  nameRow: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  registerBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, marginBottom: 20,
    shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  registerBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { fontSize: 14 },
});
