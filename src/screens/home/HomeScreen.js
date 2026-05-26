// src/screens/home/HomeScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, Image,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking, formatPrice } from '../../context/BookingContext';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { RoomCardSkeleton } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 520;
const API_BASE = 'https://hotel.primelogic.com.np';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path}`;
}

// Amenity icons mapping by name keywords
function getAmenityIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('wifi') || n.includes('internet')) return '📶';
  if (n.includes('pool') || n.includes('swim'))     return '🏊';
  if (n.includes('gym') || n.includes('fitness'))   return '🏋️';
  if (n.includes('spa') || n.includes('massage'))   return '💆';
  if (n.includes('restaurant') || n.includes('dining') || n.includes('food')) return '🍽️';
  if (n.includes('bar') || n.includes('lounge'))    return '🍸';
  if (n.includes('park') || n.includes('garden'))   return '🌿';
  if (n.includes('room service'))                   return '🛎️';
  if (n.includes('laundry') || n.includes('wash'))  return '👕';
  if (n.includes('airport') || n.includes('transfer')) return '✈️';
  if (n.includes('conference') || n.includes('meeting')) return '💼';
  if (n.includes('tv') || n.includes('cable'))      return '📺';
  if (n.includes('air') || n.includes('ac') || n.includes('cool')) return '❄️';
  if (n.includes('heater') || n.includes('heat'))   return '🔥';
  if (n.includes('safe') || n.includes('locker'))   return '🔐';
  if (n.includes('terrace') || n.includes('roof'))  return '🏙️';
  if (n.includes('view') || n.includes('mountain')) return '🏔️';
  if (n.includes('breakfast') || n.includes('brunch')) return '🥐';
  if (n.includes('24') || n.includes('reception'))  return '🔔';
  return '✨';
}

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</Text>
      ))}
    </View>
  );
}

function SectionTitle({ title, sub, theme }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>{title}</Text>
      {sub && <Text style={[styles.sectionSub, { color: theme.textLight }]}>{sub}</Text>}
      <View style={[styles.sectionLine, { backgroundColor: theme.secondary }]} />
    </View>
  );
}

function RoomCard({ room, onPress, theme, currency }) {
  const price = room.base_price || room.price_per_night || 0;
  const url   = imgUrl(room.images?.[0]?.image_path);
  return (
    <AnimatedCard onPress={onPress} style={styles.roomCard}>
      <View style={styles.roomImageBox}>
        {url
          ? <Image source={{ uri: url }} style={styles.roomImage} />
          : <View style={[styles.roomImagePlaceholder, { backgroundColor: theme.primary + '22' }]}>
              <Text style={{ fontSize: 40 }}>🛏</Text>
            </View>
        }
        <View style={[styles.roomPriceBadge, { backgroundColor: 'rgba(255,255,255,0.96)' }]}>
          <Text style={[styles.roomPrice, { color: theme.primary }]}>{formatPrice(price, currency)}</Text>
          <Text style={[styles.roomPriceNight, { color: theme.textLight }]}>/night</Text>
        </View>
        {room.status === 'available' && (
          <View style={[styles.availBadge, { backgroundColor: '#065f46' }]}>
            <Text style={styles.availText}>AVAILABLE</Text>
          </View>
        )}
      </View>
      <View style={styles.roomInfo}>
        <Text style={[styles.roomName, { color: theme.primary }]} numberOfLines={1}>{room.name || room.category_name}</Text>
        <View style={styles.roomMeta}>
          {room.max_adults && <Text style={[styles.roomMetaText, { color: theme.textLight }]}>👥 {room.max_adults} guests</Text>}
          {room.bed_type   && <Text style={[styles.roomMetaText, { color: theme.textLight }]}>🛏 {room.bed_type}</Text>}
          {room.floor      && <Text style={[styles.roomMetaText, { color: theme.textLight }]}>🏢 Floor {room.floor}</Text>}
        </View>
        <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.primary }]} onPress={onPress}>
          <Text style={[styles.bookBtnText, { color: theme.secondary }]}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );
}

function ReviewCard({ review, theme }) {
  const name = review.guest_name || review.reviewer_name || 'Guest';
  return (
    <View style={[styles.reviewCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewAvatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.reviewInitial, { color: theme.secondary }]}>{name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={[styles.reviewName, { color: theme.primary }]}>{name}</Text>
          <StarRating rating={review.rating} />
        </View>
      </View>
      <Text style={[styles.reviewText, { color: theme.text }]} numberOfLines={3}>
        {review.review || review.comment}
      </Text>
    </View>
  );
}

// FIX: Redesigned amenity — horizontal pill style, icon from name keyword
function AmenityItem({ amenity, theme }) {
  const icon = amenity.icon || getAmenityIcon(amenity.name);
  return (
    <View style={[styles.amenityPill, { backgroundColor: theme.white, borderColor: theme.border }]}>
      <Text style={styles.amenityPillIcon}>{icon}</Text>
      <Text style={[styles.amenityPillName, { color: theme.text }]} numberOfLines={1}>{amenity.name}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { theme, hotel } = useTheme();
  const { user }         = useAuth();
  const { currency }     = useBooking();

  const [rooms, setRooms]         = useState([]);
  const [reviews, setReviews]     = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [blog, setBlog]           = useState([]);
  const [stats, setStats]         = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const heroOpacity    = useSharedValue(0);
  const heroScale      = useSharedValue(1.05);
  const contentOpacity = useSharedValue(0);
  const contentY       = useSharedValue(40);

  const heroStyle    = useAnimatedStyle(() => ({ opacity: heroOpacity.value, transform: [{ scale: heroScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value, transform: [{ translateY: contentY.value }] }));

  useEffect(() => {
    heroOpacity.value    = withTiming(1,  { duration: 800 });
    heroScale.value      = withTiming(1,  { duration: 1200 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    contentY.value       = withDelay(400, withTiming(0, { duration: 600 }));

    Promise.all([
      api.get('/rooms').catch(() => ({ data: [] })),
      api.get('/public/reviews').catch(() => ({ data: [] })),
      api.get('/public/amenities').catch(() => ({ data: [] })),
      api.get('/public/blog').catch(() => ({ data: [] })),
      api.get('/public/stats').catch(() => ({ data: null })),
    ]).then(([r, rv, am, bl, st]) => {
      const roomData = Array.isArray(r.data) ? r.data : (r.data?.data || r.data?.rooms || []);
      setRooms(roomData.slice(0, 6));

      const revData = Array.isArray(rv.data) ? rv.data : (rv.data?.data || []);
      setReviews(revData.filter(x => x.is_approved !== false).slice(0, 5));

      const amData = Array.isArray(am.data) ? am.data : (am.data?.data || []);
      setAmenities(amData.slice(0, 12));

      const blData = Array.isArray(bl.data) ? bl.data : (bl.data?.data || bl.data?.posts || []);
      setBlog(blData.slice(0, 3));

      // FIX: real stats from API
      if (st.data) setStats(st.data);
    }).finally(() => setLoadingRooms(false));
  }, []);

  // FIX: build stats from real data — fall back to hotel fields, then rooms count
  const buildStats = () => {
    if (stats) {
      return [
        { value: stats.total_rooms      ? `${stats.total_rooms}+`      : null, label: 'Rooms' },
        { value: stats.years_operating  ? `${stats.years_operating}+`  : null, label: 'Years' },
        { value: stats.average_rating   ? `${Number(stats.average_rating).toFixed(1)}★` : null, label: 'Rating' },
        { value: stats.total_guests     ? `${stats.total_guests}+`     : null, label: 'Guests' },
      ].filter(s => s.value);
    }
    // Fallback: derive from what we have
    const roomCount = rooms.length;
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : hotel.average_rating;
    return [
      roomCount  && { value: `${roomCount}+`, label: 'Rooms' },
      hotel.years_operating && { value: `${hotel.years_operating}+`, label: 'Years' },
      avgRating  && { value: `${avgRating}★`, label: 'Rating' },
      hotel.total_guests && { value: `${hotel.total_guests}+`, label: 'Guests' },
    ].filter(Boolean);
  };

  const displayStats = buildStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {/* HERO */}
        <View style={styles.hero}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            {hotel.hero_video_path
              ? <Video
                  source={{ uri: imgUrl(hotel.hero_video_path) }}
                  style={StyleSheet.absoluteFill}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                />
              : <View style={[styles.heroBg, { backgroundColor: theme.primary }]} />
            }
          </Animated.View>
          <View style={[styles.heroOverlay, hotel.hero_video_path && styles.heroOverlayDark]} />

          <Animated.View style={[styles.heroContent, contentStyle]}>
            {user && <Text style={styles.heroGreeting}>Welcome back, {user.first_name} 👋</Text>}
            <Text style={styles.heroEyebrow}>Welcome to</Text>
            <Text style={styles.heroHotelName}>{hotel.name || 'Hotel'}</Text>
            <View style={[styles.heroLine, { backgroundColor: theme.secondary }]} />
            <Text style={styles.heroTagline}>{hotel.tagline || 'Where Luxury Meets Serenity'}</Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: theme.secondary }]}
              onPress={() => navigation.navigate('Rooms')}
              activeOpacity={0.85}
            >
              <Text style={[styles.heroBtnText, { color: theme.primary }]}>Explore Rooms →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* STATS — real data from API */}
        {displayStats.length > 0 && (
          <View style={[styles.statsBar, { backgroundColor: theme.white }]}>
            {displayStats.map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textLight }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.body}>
          {/* ROOMS */}
          <SectionTitle title="Featured Rooms" sub="Handcrafted for your comfort" theme={theme} />
          {loadingRooms
            ? [1,2,3].map(i => <RoomCardSkeleton key={i} />)
            : rooms.length > 0
              ? rooms.map(r => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    theme={theme}
                    currency={currency}
                    onPress={() => navigation.navigate('RoomDetail', { room: r })}
                  />
                ))
              : <Text style={[styles.empty, { color: theme.textLight }]}>No rooms available</Text>
          }
          <TouchableOpacity
            style={[styles.viewAllBtn, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('Rooms')}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>View All Rooms →</Text>
          </TouchableOpacity>

          {/* AMENITIES — FIX: pill style, icon from keyword map */}
          {amenities.length > 0 && (
            <>
              <SectionTitle title="Amenities" sub="Everything you need" theme={theme} />
              <View style={styles.amenitiesGrid}>
                {amenities.map((a, i) => <AmenityItem key={i} amenity={a} theme={theme} />)}
              </View>
            </>
          )}

          {/* REVIEWS */}
          {reviews.length > 0 && (
            <>
              <SectionTitle title="Guest Reviews" sub="What our guests say" theme={theme} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsRow}>
                {reviews.map((r, i) => <ReviewCard key={i} review={r} theme={theme} />)}
              </ScrollView>
            </>
          )}

          {/* BLOG */}
          {blog.length > 0 && (
            <>
              <SectionTitle title="From Our Blog" theme={theme} />
              {blog.map((post, i) => (
                <AnimatedCard
                  key={i}
                  onPress={() => navigation.navigate('BlogPost', { post })}
                  style={styles.blogCard}
                >
                  <View style={styles.blogContent}>
                    <Text style={[styles.blogTitle, { color: theme.primary }]} numberOfLines={2}>{post.title}</Text>
                    <Text style={[styles.blogExcerpt, { color: theme.textLight }]} numberOfLines={2}>{post.excerpt || post.summary}</Text>
                    <Text style={[styles.blogDate, { color: theme.secondary }]}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                </AnimatedCard>
              ))}
            </>
          )}

          {/* CONTACT */}
          <View style={[styles.contactCard, { backgroundColor: theme.primary }]}>
            <Text style={[styles.contactTitle, { color: theme.secondary }]}>Get In Touch</Text>
            {hotel.address && <Text style={styles.contactText}>📍 {hotel.address}</Text>}
            {hotel.phone   && <Text style={styles.contactText}>📞 {hotel.phone}</Text>}
            {hotel.email   && <Text style={styles.contactText}>✉️ {hotel.email}</Text>}
            {hotel.check_in_time && (
              <Text style={styles.contactText}>
                🕐 Check-in: {hotel.check_in_time?.slice(0,5)} · Check-out: {hotel.check_out_time?.slice(0,5)}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { height: HERO_HEIGHT, justifyContent: 'flex-end' },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  heroOverlayDark: { backgroundColor: 'rgba(0,0,0,0.42)' },
  heroContent: { padding: 28, paddingBottom: 48 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  heroEyebrow: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  heroHotelName: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1, marginBottom: 12, lineHeight: 48 },
  heroLine: { width: 50, height: 2, marginBottom: 12 },
  heroTagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 24, marginBottom: 24 },
  heroBtn: { alignSelf: 'flex-start', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, shadowColor: '#c9a96e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  heroBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  statsBar: { flexDirection: 'row', paddingVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { padding: 20 },
  sectionHeader: { marginBottom: 16, marginTop: 28 },
  sectionTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sectionSub: { fontSize: 14, marginTop: 4, marginBottom: 10 },
  sectionLine: { width: 36, height: 2, marginTop: 6 },
  roomCard: { marginBottom: 16, overflow: 'hidden' },
  roomImageBox: { position: 'relative' },
  roomImage: { width: '100%', height: 200, resizeMode: 'cover' },
  roomImagePlaceholder: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' },
  roomPriceBadge: { position: 'absolute', bottom: 12, right: 12, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'baseline' },
  roomPrice: { fontSize: 18, fontWeight: '800' },
  roomPriceNight: { fontSize: 11, marginLeft: 2 },
  availBadge: { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  availText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  roomInfo: { padding: 16 },
  roomName: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  roomMeta: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  roomMetaText: { fontSize: 12 },
  bookBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  bookBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  viewAllBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginBottom: 8 },
  viewAllText: { fontSize: 14, fontWeight: '700' },
  // FIX: wrap grid instead of tiny vertical squares
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  amenityPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  amenityPillIcon: { fontSize: 16 },
  amenityPillName: { fontSize: 13, fontWeight: '600' },
  reviewsRow: { gap: 12, paddingBottom: 8 },
  reviewCard: { width: 260, padding: 16, borderRadius: 16, borderWidth: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { fontSize: 16, fontWeight: '700' },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewText: { fontSize: 13, lineHeight: 20 },
  blogCard: { marginBottom: 12 },
  blogContent: { padding: 16 },
  blogTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  blogExcerpt: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  blogDate: { fontSize: 11, fontWeight: '600' },
  contactCard: { borderRadius: 20, padding: 24, marginTop: 12, marginBottom: 32 },
  contactTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  contactText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8, lineHeight: 22 },
  empty: { textAlign: 'center', padding: 20 },
});
