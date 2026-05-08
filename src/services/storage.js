// src/services/storage.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get:    async (key)        => { try { return await AsyncStorage.getItem(key); } catch { return null; } },
  set:    async (key, value) => { try { await AsyncStorage.setItem(key, String(value)); } catch {} },
  remove: async (key)        => { try { await AsyncStorage.removeItem(key); } catch {} },
  getJSON:async (key)        => { try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  setJSON:async (key, value) => { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} },
};
