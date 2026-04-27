// app/_layout.tsx
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { BibleProvider, useBible } from '../src/context/BibleContext';
import { useEffect } from 'react';
import { requestNotificationPermissions, scheduleDailyVerseNotification } from '../src/utils/notifications';

function TabLayout() {
  const { colors, theme } = useTheme();
  const { bibleData, lang } = useBible();

  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyVerseNotification(bibleData, lang);
      }
    };
    setupNotifications();
  }, [bibleData, lang]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.headerBg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'Accueil', 
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="read" 
          options={{ 
            title: 'Lire', 
            tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="search" 
          options={{ 
            title: 'Rechercher', 
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="favorites" 
          options={{ 
            title: 'Favoris', 
            tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="book" 
          options={{ 
            title: 'Livres', 
            tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} /> 
          }} 
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BibleProvider>
        <TabLayout />
      </BibleProvider>
    </ThemeProvider>
  );
}