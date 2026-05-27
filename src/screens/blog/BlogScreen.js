// src/screens/blog/BlogScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, StatusBar, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { SkeletonBox } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';

function BlogSkeleton() {
  return (
    <View style={{ marginBottom: 16 }}>
      <SkeletonBox width="100%" height={180} radius={16} style={{ marginBottom: 12 }} />
      <SkeletonBox width="70%" height={18} radius={4} style={{ marginBottom: 8 }} />
      <SkeletonBox width="50%" height={14} radius={4} />
    </View>
  );
}

export default function BlogScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/public/blog');
      const d   = res.data;
      setPosts(Array.isArray(d) ? d : (d?.data || d?.posts || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const renderPost = ({ item: post, index }) => {
    const imgUrl = post.featured_image
      ? `https://hotel.primelogic.com.np/${post.featured_image}` : null;
    const date = post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    const isFeature = index === 0;

    return (
      <AnimatedCard
        onPress={() => navigation.navigate('BlogPost', { post })}
        style={[styles.card, isFeature && styles.featuredCard]}
      >
        {imgUrl
          ? <Image source={{ uri: imgUrl }} style={[styles.cardImage, isFeature && styles.featuredImage]} />
          : <View style={[styles.cardImage, isFeature && styles.featuredImage, { backgroundColor: theme.primary + '18', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 40 }}>📰</Text>
            </View>
        }
        {isFeature && (
          <View style={[styles.featuredBadge, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.featuredBadgeText, { color: theme.primary }]}>FEATURED</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          {post.category && (
            <Text style={[styles.category, { color: theme.secondary }]}>{post.category.toUpperCase()}</Text>
          )}
          <Text style={[styles.title, { color: theme.primary }]} numberOfLines={isFeature ? 3 : 2}>{post.title}</Text>
          {post.excerpt && (
            <Text style={[styles.excerpt, { color: theme.textLight }]} numberOfLines={isFeature ? 3 : 2}>{post.excerpt}</Text>
          )}
          <View style={styles.meta}>
            {post.author && <Text style={[styles.author, { color: theme.textLight }]}>✍️ {post.author}</Text>}
            {date && <Text style={[styles.date, { color: theme.secondary }]}>{date}</Text>}
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Our Blog</Text>
        <Text style={styles.headerSub}>Stories, tips & {hotel.name ? `${hotel.name} updates` : 'hotel updates'}</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[1,2,3].map(i => <BlogSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📰</Text>
              <Text style={[styles.emptyText, { color: theme.textLight }]}>No posts yet</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(); }} tintColor={theme.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  list: { padding: 16 },
  card: { marginBottom: 16, overflow: 'hidden' },
  featuredCard: { marginBottom: 24 },
  cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
  featuredImage: { height: 240 },
  featuredBadge: { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  featuredBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  cardBody: { padding: 16 },
  category: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 8 },
  excerpt: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 12 },
  date: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
