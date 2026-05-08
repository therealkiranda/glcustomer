// src/navigation/BookingNavigator.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BookingStep1Screen  from '../screens/booking/BookingStep1Screen';
import BookingStep2Screen  from '../screens/booking/BookingStep2Screen';
import BookingStep3Screen  from '../screens/booking/BookingStep3Screen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';

const Stack = createStackNavigator();

export default function BookingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'card' }}>
      <Stack.Screen name="Step1"   component={BookingStep1Screen} />
      <Stack.Screen name="Step2"   component={BookingStep2Screen} />
      <Stack.Screen name="Step3"   component={BookingStep3Screen} />
      <Stack.Screen name="Success" component={BookingSuccessScreen} />
    </Stack.Navigator>
  );
}
