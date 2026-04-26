// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, LastPosition, UserSettings } from '../types';

const KEYS = {
  BOOKMARKS: '@bible:bookmarks',
  LAST_POSITION: '@bible:last_position',
  SETTINGS: '@bible:settings',
  READING_HISTORY: '@bible:reading_history',
};

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export async function loadBookmarks(): Promise<Bookmark[]> {
  const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
  return data ? JSON.parse(data) : [];
}

export async function saveLastPosition(position: LastPosition): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_POSITION, JSON.stringify(position));
}

export async function loadLastPosition(): Promise<LastPosition | null> {
  const data = await AsyncStorage.getItem(KEYS.LAST_POSITION);
  return data ? JSON.parse(data) : null;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadSettings(): Promise<UserSettings | null> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : null;
}

export async function addToHistory(chapterRef: string): Promise<void> {
  const history = await loadHistory();
  const updated = [chapterRef, ...history.filter(h => h !== chapterRef)].slice(0, 50);
  await AsyncStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(updated));
}

export async function loadHistory(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.READING_HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function exportData(): Promise<string> {
  const [bookmarks, lastPosition, settings, history] = await Promise.all([
    loadBookmarks(),
    loadLastPosition(),
    loadSettings(),
    loadHistory(),
  ]);
  return JSON.stringify({ bookmarks, lastPosition, settings, history, exportDate: new Date().toISOString() });
}

export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (data.bookmarks) await saveBookmarks(data.bookmarks);
  if (data.lastPosition) await saveLastPosition(data.lastPosition);
  if (data.settings) await saveSettings(data.settings);
}