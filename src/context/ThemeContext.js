// src/context/ThemeContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const ThemeContext = createContext();

const DEFAULTS = {
  primary: '#1a3c2e', secondary: '#c9a96e', background: '#f8f5f0',
  text: '#1a1a1a', textLight: '#6b7280', white: '#ffffff',
  border: '#e8e0d4', error: '#dc2626', success: '#065f46', card: '#ffffff',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme]     = useState(DEFAULTS);
  const [hotel, setHotel]     = useState({ name: 'Hotel', tagline: '', currency_symbol: 'Rs', default_currency: 'NPR' });
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    api.get('/public/settings').then(r => {
      const d = r.data;
      if (d.theme) setTheme({
        ...DEFAULTS,
        primary:    d.theme.primary_color    || DEFAULTS.primary,
        secondary:  d.theme.secondary_color  || DEFAULTS.secondary,
        background: d.theme.background_color || DEFAULTS.background,
        text:       d.theme.text_color       || DEFAULTS.text,
      });
      if (d.hotel) setHotel(d.hotel);
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, hotel, ready }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
