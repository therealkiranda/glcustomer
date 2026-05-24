// src/context/AuthContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  // Fix: loading starts false — RootNavigator must not gate on this.
  // SplashScreen handles all startup sequencing independently.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('gl_guest_token');
      if (!token) return;
      // Also try cached user immediately for instant UI
      const cached = await AsyncStorage.getItem('gl_guest_user');
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }
      // Then verify with server in background
      const r = await api.get('/auth/me');
      const userData = r.data?.user || r.data;
      setUser(userData);
      await AsyncStorage.setItem('gl_guest_user', JSON.stringify(userData));
    } catch {
      // Token invalid — clear it silently
      await AsyncStorage.multiRemove(['gl_guest_token', 'gl_guest_user']).catch(() => {});
      setUser(null);
    }
  };

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    const token    = r.data.token;
    const userData = r.data.user || r.data;
    await AsyncStorage.setItem('gl_guest_token', token);
    await AsyncStorage.setItem('gl_guest_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    const token    = r.data.token;
    const userData = r.data.user || r.data;
    await AsyncStorage.setItem('gl_guest_token', token);
    await AsyncStorage.setItem('gl_guest_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['gl_guest_token', 'gl_guest_user']);
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
