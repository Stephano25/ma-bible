import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { BibleProvider, useBible } from '../src/context/BibleContext';

function TabLayout() {
  const { colors, theme } = useTheme();

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.headerBg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.tabBar },
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
        <Tabs.Screen name="read" options={{ title: 'Lire', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
        <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
        <Tabs.Screen name="favorites" options={{ title: 'Favoris', tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} /> }} />
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