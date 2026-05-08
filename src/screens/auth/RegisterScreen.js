// src/screens/auth/RegisterScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NATIONALITIES = ['Nepali','Indian','Chinese','American','British','Australian','German','French','Japanese','Korean','Other'];

export default function RegisterScreen({ navigation }) {
  const { register }     = useAuth();
  const { theme, hotel } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', nationality: 'Nepali' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); return;
    }
    if (form.password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (!res.success) Alert.alert('Registration Failed', res.error);
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.primary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>Join {hotel.name || 'us'} and enjoy exclusive benefits</Text>

        {[
          { key: 'first_name', label: 'FIRST NAME', placeholder: 'John' },
          { key: 'last_name',  label: 'LAST NAME',  placeholder: 'Doe' },
          { key: 'email',      label: 'EMAIL',       placeholder: 'john@email.com', kb: 'email-address' },
          { key: 'phone',      label: 'PHONE',       placeholder: '+977 98XXXXXXXX', kb: 'phone-pad' },
          { key: 'password',   label: 'PASSWORD',    placeholder: '••••••••', secure: true },
        ].map(f => (
          <View key={f.key}>
            <Text style={[styles.label, { color: theme.primary }]}>{f.label}</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.white }]}
              placeholder={f.placeholder}
              placeholderTextColor={theme.textLight}
              value={form[f.key]}
              onChangeText={v => set(f.key, v)}
              keyboardType={f.kb || 'default'}
              secureTextEntry={!!f.secure}
              autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.btnText, { color: theme.secondary }]}>CREATE ACCOUNT</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: theme.textLight }]}>
            Already have an account? <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 32 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  loginLink: { alignItems: 'center', marginTop: 24, paddingBottom: 40 },
  loginText: { fontSize: 14 },
});
