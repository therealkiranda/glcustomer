// src/navigation/TabNavigator.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

import HomeScreen        from '../screens/home/HomeScreen';
import RoomsScreen       from '../screens/rooms/RoomsScreen';
import MyBookingsScreen  from '../screens/mybookings/MyBookingsScreen';
import BlogScreen        from '../screens/blog/BlogScreen';
import ProfileScreen     from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',     label: 'Home',     icon: '🏠', screen: HomeScreen },
  { name: 'Rooms',    label: 'Rooms',    icon: '🛏',  screen: RoomsScreen },
  { name: 'Bookings', label: 'Bookings', icon: '📋',  screen: MyBookingsScreen },
  { name: 'Blog',     label: 'Blog',     icon: '📰',  screen: BlogScreen },
  { name: 'Profile',  label: 'Profile',  icon: '👤',  screen: ProfileScreen },
];

function TabBarItem({ label, icon, active, onPress, theme }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => {
        scale.value = withSpring(0.85, { damping: 12 }, () => { scale.value = withSpring(1, { damping: 10 }); });
        onPress();
      }}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabInner, active && { backgroundColor: theme.primary + '12' }, animStyle]}>
        <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
        <Text style={[styles.tabLabel, { color: active ? theme.primary : '#9ca3af' }]}>{label}</Text>
        {active && <View style={[styles.tabDot, { backgroundColor: theme.secondary }]} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.tabBar, { backgroundColor: theme.white, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const active = state.index === index;
        return (
          <TabBarItem
            key={route.key}
            label={tab.label}
            icon={tab.icon}
            active={active}
            theme={theme}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!active && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, position: 'relative' },
  tabIcon: { fontSize: 20, marginBottom: 3, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, fontWeight: '700' },
  tabDot: { position: 'absolute', bottom: -2, width: 4, height: 4, borderRadius: 2 },
});
