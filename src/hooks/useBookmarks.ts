// src/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark } from '../types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem('@bible:bookmarks');
      setBookmarks(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBookmark = useCallback(async (bookmark: Bookmark) => {
    const updated = [bookmark, ...bookmarks];
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  }, [bookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  }, [bookmarks]);

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const getBookmarksByCategory = useCallback((category: string) => {
    return bookmarks.filter(b => b.category === category);
  }, [bookmarks]);

  const getBookmarksByLang = useCallback((lang: 'fr' | 'en') => {
    return bookmarks.filter(b => b.lang === lang);
  }, [bookmarks]);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksByCategory,
    getBookmarksByLang,
  };
}