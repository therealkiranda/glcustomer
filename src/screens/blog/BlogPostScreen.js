// src/screens/blog/BlogPostScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function BlogPostScreen({ route, navigation }) {
  const { post }   = route.params;
  const { theme }  = useTheme();
  const imgUrl     = post.featured_image
    ? `https://hotel.primelogic.com.np/${post.featured_image}` : null;
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          {imgUrl
            ? <Image source={{ uri: imgUrl }} style={styles.heroImage} />
            : <View style={[styles.heroImage, { backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 64 }}>📰</Text>
              </View>
          }
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { backgroundColor: theme.background }]}>
          {post.category && (
            <Text style={[styles.category, { color: theme.secondary }]}>{post.category.toUpperCase()}</Text>
          )}
          <Text style={[styles.title, { color: theme.primary }]}>{post.title}</Text>
          <View style={[styles.metaRow, { borderBottomColor: theme.border }]}>
            {post.author && <Text style={[styles.author, { color: theme.textLight }]}>✍️ {post.author}</Text>}
            {date && <Text style={[styles.date, { color: theme.secondary }]}>{date}</Text>}
          </View>
          <Text style={[styles.content, { color: theme.text }]}>
            {post.content || post.body || post.excerpt || ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBox: { position: 'relative' },
  heroImage: { width: '100%', height: 300, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  body: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  category: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 34, marginBottom: 16, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, marginBottom: 20 },
  author: { fontSize: 13 },
  date: { fontSize: 13, fontWeight: '600' },
  content: { fontSize: 15, lineHeight: 26, paddingBottom: 60 },
});
