// src/screens/auth/LoginScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login }    = useAuth();
  const { theme, hotel } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Missing Fields', 'Please enter your email and password.'); return; }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!res.success) Alert.alert('Login Failed', res.error);
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Text style={[styles.logoText, { color: theme.secondary }]}>
              {(hotel.name || 'H').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.primary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.primary }]}>EMAIL</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
            placeholder="your@email.com"
            placeholderTextColor={theme.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.primary }]}>PASSWORD</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
              <Text style={styles.eye}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.btnText, { color: theme.secondary }]}>SIGN IN</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={[styles.registerText, { color: theme.textLight }]}>
              Don't have an account? <Text style={{ color: theme.primary, fontWeight: '700' }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  backText: { fontSize: 15, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 24, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 15 },
  form: {},
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  passRow: { position: 'relative' },
  passInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eye: { fontSize: 18 },
  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 32 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  registerLink: { alignItems: 'center', marginTop: 24 },
  registerText: { fontSize: 14 },
});
