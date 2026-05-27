// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const ThemeContext = createContext();

const DEFAULTS = {
  primary: '#1a3c2e', secondary: '#c9a96e', background: '#f8f5f0',
  text: '#1a1a1a', textLight: '#6b7280', white: '#ffffff',
  border: '#e8e0d4', error: '#dc2626', success: '#065f46', card: '#ffffff',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme]   = useState(DEFAULTS);
  const [hotel, setHotel]   = useState({
    name: '', tagline: '', currency_symbol: 'Rs', default_currency: 'NPR',
    hero_video_path: null, hero_image_path: null, hero_type: null,
  });
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const hardTimeout = setTimeout(() => setReady(true), 4000);

    api.get('/public/settings')
      .then(r => {
        const d = r.data;

        // ── Theme colours ────────────────────────────────────
        if (d?.theme) {
          setTheme({
            ...DEFAULTS,
            primary:    d.theme.primary_color    || DEFAULTS.primary,
            secondary:  d.theme.secondary_color  || DEFAULTS.secondary,
            background: d.theme.background_color || DEFAULTS.background,
            text:       d.theme.text_color       || DEFAULTS.text,
          });
        }

        // ── Hotel info + hero video from theme_settings ──────
        // Backend returns theme row which has lumiere_hero_video / hero_video_url
        // Map whichever field is set into a single hero_video_path
        const t = d?.theme || {};
        const heroVideo =
          t.lumiere_hero_video ||
          t.azure_hero_video   ||
          t.noir_hero_video    ||
          t.hero_video_url     ||
          null;
        const heroImage =
          t.lumiere_hero_image ||
          t.azure_hero_image   ||
          t.noir_hero_image    ||
          null;

        if (d?.hotel) {
          setHotel({
            ...d.hotel,
            hero_video_path: heroVideo,
            hero_image_path: heroImage,
            hero_type: t.hero_type || (heroVideo ? 'video' : heroImage ? 'image' : null),
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(hardTimeout);
        setReady(true);
      });

    return () => clearTimeout(hardTimeout);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, hotel, ready }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
