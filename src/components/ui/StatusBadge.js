// src/components/ui/StatusBadge.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_MAP = {
  pending:     { label: 'Pending',    bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  confirmed:   { label: 'Confirmed',  bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  checked_in:  { label: 'In Stay',    bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  checked_out: { label: 'Completed',  bg: '#f3e8ff', text: '#6b21a8', dot: '#a855f7' },
  cancelled:   { label: 'Cancelled',  bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  no_show:     { label: 'No Show',    bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['pending'];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text style={[styles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  text: { fontSize: 12, fontWeight: '700' },
});
