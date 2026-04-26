// src/context/ThemeContext.tsx
// ============================================================
//  THEME CONTEXT — Dark / Light mode
// ============================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryDark: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  bookmarkBg: string;
  headerBg: string;
  headerText: string;
  tabBar: string;
  tabBarBorder: string;
  cardShadow: string;
  inputBg: string;
  highlightBg: string;
  highlightText: string;
}

export const lightColors: ThemeColors = {
  background: '#FBF7F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F5EFE6',
  primary: '#7B3F00',
  primaryDark: '#5C2D00',
  accent: '#C47F17',
  text: '#2C1810',
  textSecondary: '#5D4037',
  textMuted: '#9E7B6A',
  border: '#E8D8C4',
  bookmarkBg: '#FFF9E6',
  headerBg: '#7B3F00',
  headerText: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8D8C4',
  cardShadow: 'rgba(123, 63, 0, 0.12)',
  inputBg: '#F5EFE6',
  highlightBg: '#FFD700',
  highlightText: '#2C1810',
};

export const darkColors: ThemeColors = {
  background: '#1A0F0A',
  surface: '#2A1A0F',
  surfaceAlt: '#3D2515',
  primary: '#C47F17',
  primaryDark: '#A86A0F',
  accent: '#E8A020',
  text: '#F5E6D3',
  textSecondary: '#C9A882',
  textMuted: '#8A6A50',
  border: '#4A2E1A',
  bookmarkBg: '#2D1F05',
  headerBg: '#2A1A0F',
  headerText: '#F5E6D3',
  tabBar: '#1A0F0A',
  tabBarBorder: '#4A2E1A',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  inputBg: '#2A1A0F',
  highlightBg: '#B8860B',
  highlightText: '#FFF9E6',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('@bible:settings').then((val) => {
      if (val) {
        const settings = JSON.parse(val);
        if (settings.theme) setTheme(settings.theme);
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const existing = await AsyncStorage.getItem('@bible:settings');
    const settings = existing ? JSON.parse(existing) : {};
    settings.theme = newTheme;
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(settings));
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};