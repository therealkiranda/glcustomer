// src/screens/profile/ProfileScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: '#dc2626' }]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChange, keyboard, secure }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard || 'default'}
        secureTextEntry={!!secure}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const { user, logout, updateUser } = useAuth();

  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
    nationality:user?.nationality|| '',
  });
  const [pwForm, setPwForm]       = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw]       = useState(false);
  const [savingPw, setSavingPw]   = useState(false);

  const set   = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      updateUser(form);
      setEditing(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not save profile.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.new || !pwForm.confirm) { Alert.alert('Fill all fields'); return; }
    if (pwForm.new !== pwForm.confirm) { Alert.alert('Passwords do not match'); return; }
    if (pwForm.new.length < 6) { Alert.alert('Password too short', 'Minimum 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/password', { current_password: pwForm.current, new_password: pwForm.new });
      setShowPw(false);
      setPwForm({ current: '', new: '', confirm: '' });
      Alert.alert('✅ Password Changed');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not change password.');
    } finally { setSavingPw(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.guestBox}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={[styles.guestTitle, { color: theme.primary }]}>Not signed in</Text>
          <Text style={[styles.guestSub, { color: theme.textLight }]}>Sign in to manage your profile and bookings</Text>
          <TouchableOpacity style={[styles.signInBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.signInBtnText, { color: theme.secondary }]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.regLink}>
            <Text style={[styles.regLinkText, { color: theme.textLight }]}>
              New guest? <Text style={{ color: theme.primary, fontWeight: '700' }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const initials = ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={[styles.avatar, { borderColor: theme.secondary }]}>
            <Text style={[styles.avatarText, { color: theme.secondary }]}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.loyalty_points > 0 && (
            <View style={[styles.loyaltyBadge, { backgroundColor: theme.secondary + '25', borderColor: theme.secondary + '40' }]}>
              <Text style={[styles.loyaltyText, { color: theme.secondary }]}>⭐ {user.loyalty_points} loyalty points</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Profile Info */}
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>Personal Info</Text>
              <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color={theme.primary} />
                  : <Text style={[styles.editBtn, { color: theme.primary }]}>{editing ? 'Save' : 'Edit'}</Text>
                }
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                <View style={styles.row}>
                  <View style={styles.half}><Field label="First Name" value={form.first_name} onChange={v => set('first_name', v)} /></View>
                  <View style={styles.half}><Field label="Last Name"  value={form.last_name}  onChange={v => set('last_name', v)} /></View>
                </View>
                <Field label="Phone"       value={form.phone}       onChange={v => set('phone', v)}       keyboard="phone-pad" />
                <Field label="Nationality" value={form.nationality} onChange={v => set('nationality', v)} />
                <TouchableOpacity style={styles.cancelEdit} onPress={() => setEditing(false)}>
                  <Text style={[styles.cancelEditText, { color: theme.textLight }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {[
                  ['Name',        `${user.first_name} ${user.last_name}`],
                  ['Email',       user.email],
                  ['Phone',       user.phone || '—'],
                  ['Nationality', user.nationality || '—'],
                  ['Member since',user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'],
                ].map(([l, v]) => (
                  <View key={l} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.infoLabel, { color: theme.textLight }]}>{l}</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{v}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Change Password */}
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => setShowPw(v => !v)}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>🔒 Change Password</Text>
              <Text style={[styles.editBtn, { color: theme.primary }]}>{showPw ? 'Cancel' : 'Change'}</Text>
            </TouchableOpacity>
            {showPw && (
              <>
                <Field label="Current Password" value={pwForm.current} onChange={v => setPw('current', v)} secure />
                <Field label="New Password"     value={pwForm.new}     onChange={v => setPw('new', v)}     secure />
                <Field label="Confirm New"      value={pwForm.confirm} onChange={v => setPw('confirm', v)} secure />
                <TouchableOpacity
                  style={[styles.pwBtn, { backgroundColor: theme.primary }, savingPw && { opacity: 0.6 }]}
                  onPress={handleChangePassword}
                  disabled={savingPw}
                >
                  {savingPw
                    ? <ActivityIndicator color={theme.secondary} />
                    : <Text style={[styles.pwBtnText, { color: theme.secondary }]}>Update Password</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Menu */}
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <MenuItem icon="📋" label="My Bookings"   onPress={() => navigation.navigate('Bookings')} />
            <MenuItem icon="⭐" label="My Reviews"    onPress={() => Alert.alert('Coming soon')} />
            <MenuItem icon="🔔" label="Notifications" onPress={() => Alert.alert('Coming soon')} />
            <MenuItem icon="📞" label={`Contact ${hotel.name || 'Hotel'}`} onPress={() => Alert.alert('Contact', hotel.phone || hotel.email || '—')} />
          </View>

          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <MenuItem icon="🚪" label="Sign Out" onPress={handleLogout} danger />
          </View>

          <Text style={[styles.footer, { color: theme.textLight }]}>{hotel.name} · v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center', paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  loyaltyBadge: { marginTop: 12, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1 },
  loyaltyText: { fontSize: 13, fontWeight: '700' },
  body: { padding: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  editBtn: { fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#374151', letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#e5e0d5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1e293b', backgroundColor: '#fafaf8' },
  cancelEdit: { alignItems: 'center', paddingVertical: 8 },
  cancelEditText: { fontSize: 13, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  pwBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  pwBtnText: { fontSize: 14, fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIcon: { fontSize: 18, marginRight: 14, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1e293b' },
  menuArrow: { fontSize: 22, color: '#9ca3af' },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 8, marginBottom: 40 },
  guestBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestIcon: { fontSize: 56, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  guestSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  signInBtn: { width: '100%', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  signInBtnText: { fontSize: 15, fontWeight: '800' },
  regLink: { padding: 8 },
  regLinkText: { fontSize: 14 },
});
