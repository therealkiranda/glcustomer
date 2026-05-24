// src/screens/auth/LoginScreen.js
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

export default function LoginScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const { login }        = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      Alert.alert('Sign In Failed', e.response?.data?.error || e.response?.data?.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <View style={[styles.top, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.hotelName, { color: theme.secondary }]}>{hotel.name || 'Hotel'}</Text>
        <Text style={styles.topTitle}>Welcome Back</Text>
        <Text style={styles.topSub}>Sign in to manage your reservations</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textLight }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={theme.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textLight }]}>PASSWORD</Text>
          <View style={styles.pwWrap}>
            <TextInput
              style={[styles.input, styles.pwInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textLight}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
              <Text style={[styles.eyeText, { color: theme.textLight }]}>{showPw ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.75 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={theme.secondary} />
            : <Text style={[styles.loginBtnText, { color: theme.secondary }]}>Sign In →</Text>
          }
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: theme.textLight }]}>New to {hotel.name || 'us'}?</Text>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.registerBtn, { borderColor: theme.primary }]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={[styles.registerBtnText, { color: theme.primary }]}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.guestLink}>
          <Text style={[styles.guestText, { color: theme.textLight }]}>Continue as guest</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { paddingTop: 60, paddingBottom: 36, paddingHorizontal: 28 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 22 },
  hotelName: { fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  topTitle: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  topSub: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },
  form: { padding: 24, paddingTop: 32, gap: 20, paddingBottom: 60 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 15 },
  pwWrap: { position: 'relative' },
  pwInput: { paddingRight: 54 },
  eyeBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  eyeText: { fontSize: 18 },
  loginBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8,
    shadowColor: '#1a3c2e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  loginBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
  orText: { fontSize: 13 },
  registerBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', borderWidth: 1.5 },
  registerBtnText: { fontSize: 16, fontWeight: '700' },
  guestLink: { alignItems: 'center', paddingVertical: 8 },
  guestText: { fontSize: 14 },
});
