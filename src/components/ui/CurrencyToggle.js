// src/components/ui/CurrencyToggle.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useBooking, CURRENCIES } from '../../context/BookingContext';

export default function CurrencyToggle({ style }) {
  const { currency, setCurrency } = useBooking();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.container, style]}>
      {CURRENCIES.map(c => {
        const active = currency === c.code;
        return (
          <TouchableOpacity
            key={c.code}
            onPress={() => setCurrency(c.code)}
            style={[styles.pill, active && styles.pillActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.flag}>{c.flag}</Text>
            <Text style={[styles.code, active && styles.codeActive]}>{c.code}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  pillActive: { backgroundColor: '#c9a96e', borderColor: '#c9a96e' },
  flag: { fontSize: 16 },
  code: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  codeActive: { color: '#1a3c2e' },
});
