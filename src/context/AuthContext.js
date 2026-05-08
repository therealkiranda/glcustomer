// src/context/AuthContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    loadUser().finally(() => { clearTimeout(timeout); setLoading(false); });
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('gl_guest_token');
      if (!token) return;
      const r = await api.get('/auth/me');
      setUser(r.data?.user || r.data);
    } catch {}
  };

  const login = async (email, password) => {
    try {
      const r = await api.post('/auth/login', { email, password });
      const token = r.data.token;
      const userData = r.data.user || r.data;
      await AsyncStorage.setItem('gl_guest_token', token);
      await AsyncStorage.setItem('gl_guest_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || e.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const r = await api.post('/auth/register', data);
      const token = r.data.token;
      const userData = r.data.user || r.data;
      await AsyncStorage.setItem('gl_guest_token', token);
      await AsyncStorage.setItem('gl_guest_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.error || e.response?.data?.message || 'Registration failed' };
    }
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
