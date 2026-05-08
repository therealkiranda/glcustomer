// src/navigation/RootNavigator.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import SplashScreen       from '../screens/splash/SplashScreen';
import OnboardingScreen   from '../screens/onboarding/OnboardingScreen';
import TabNavigator       from './TabNavigator';
import BookingNavigator   from './BookingNavigator';
import RoomDetailScreen   from '../screens/rooms/RoomDetailScreen';
import BookingDetailScreen from '../screens/mybookings/BookingDetailScreen';
import BlogPostScreen     from '../screens/blog/BlogPostScreen';
import LoginScreen        from '../screens/auth/LoginScreen';
import RegisterScreen     from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { loading } = useContext(AuthContext);
  const { theme }   = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"      component={SplashScreen} />
      <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
      <Stack.Screen name="Main"        component={TabNavigator} />
      <Stack.Screen name="RoomDetail"  component={RoomDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="BlogPost"    component={BlogPostScreen} />
      <Stack.Screen name="Login"       component={LoginScreen} />
      <Stack.Screen name="Register"    component={RegisterScreen} />
      <Stack.Screen
        name="BookingFlow"
        component={BookingNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
