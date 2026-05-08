// src/components/ui/StatusBadge.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS = {
  pending:     { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  confirmed:   { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' },
  checked_in:  { bg: '#dbeafe', color: '#0284c7', label: 'Checked In' },
  checked_out: { bg: '#f1f5f9', color: '#64748b', label: 'Checked Out' },
  cancelled:   { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
  no_show:     { bg: '#fef3c7', color: '#d97706', label: 'No Show' },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
