// src/hooks/useReadingProgress.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LastPosition } from '../types';

export function useReadingProgress() {
  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  useEffect(() => {
    loadLastPosition();
    loadHistory();
  }, []);

  const loadLastPosition = async () => {
    try {
      const data = await AsyncStorage.getItem('@bible:last_position');
      setLastPosition(data ? JSON.parse(data) : null);
    } catch (error) {
      console.error('Failed to load last position:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('@bible:reading_history');
      setReadingHistory(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveLastPosition = async (position: LastPosition) => {
    setLastPosition(position);
    await AsyncStorage.setItem('@bible:last_position', JSON.stringify(position));
  };

  const addToHistory = async (chapterRef: string) => {
    const updated = [chapterRef, ...readingHistory.filter(h => h !== chapterRef)].slice(0, 50);
    setReadingHistory(updated);
    await AsyncStorage.setItem('@bible:reading_history', JSON.stringify(updated));
  };

  const getReadingStreak = () => {
    // Returns number of consecutive days with reading
    return readingHistory.length;
  };

  return {
    lastPosition,
    readingHistory,
    saveLastPosition,
    addToHistory,
    getReadingStreak,
  };
}