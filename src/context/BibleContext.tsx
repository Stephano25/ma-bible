// src/context/BibleContext.tsx
// ============================================================
//  BIBLE CONTEXT — Gestion des données bibliques, favoris, position de lecture
// ============================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, LastPosition, UserSettings } from '../types';

// Import des bibles locales
const biblesFRRaw = require('../../assets/data/segond_1910.json');
const biblesENRaw = require('../../assets/data/kjv.json');
const biblesMGRaw = require('../../assets/data/malgasy.json');

// Fonction pour convertir le format plat en structure hiérarchique
function convertToHierarchy(data: any): any {
  // Si data est déjà au bon format
  if (data && data.livres && Array.isArray(data.livres)) {
    return data;
  }
  
  // Si data a une propriété 'verses' (nouveau format)
  const versesArray = (data && data.verses) ? data.verses : (Array.isArray(data) ? data : null);
  
  if (!versesArray) {
    console.error('Format de données non reconnu:', Object.keys(data || {}));
    return { livres: [] };
  }

  const booksMap = new Map<string, any>();

  versesArray.forEach((verse: any) => {
    const bookName = verse.book_name;
    const bookId = verse.book;
    const chapterNum = verse.chapter;
    const verseNum = verse.verse;
    const text = verse.text;

    if (!booksMap.has(bookName)) {
      booksMap.set(bookName, {
        nom: bookName,
        abrev: bookName.substring(0, 2).toUpperCase(),
        testament: bookId <= 39 ? 'ancien' : 'nouveau',
        categorie: bookId <= 39 ? 'Ancien Testament' : 'Nouveau Testament',
        chapitres: new Map<number, any>()
      });
    }

    const book = booksMap.get(bookName);
    if (!book.chapitres.has(chapterNum)) {
      book.chapitres.set(chapterNum, {
        numero: chapterNum,
        versets: []
      });
    }

    const chapter = book.chapitres.get(chapterNum);
    chapter.versets.push({
      numero: verseNum,
      texte: text
    });
  });

  const livres = Array.from(booksMap.values()).map((book: any) => ({
    ...book,
    chapitres: Array.from(book.chapitres.values())
      .map((chapter: any) => ({
        ...chapter,
        versets: chapter.versets.sort((a: any, b: any) => a.numero - b.numero)
      }))
      .sort((a: any, b: any) => a.numero - b.numero)
  }));

  // Trier les livres par ID
  livres.sort((a: any, b: any) => {
    const aId = versesArray.find((v: any) => v.book_name === a.nom)?.book || 0;
    const bId = versesArray.find((v: any) => v.book_name === b.nom)?.book || 0;
    return aId - bId;
  });

  return { livres };
}

// Convertir les données
const biblesFR = convertToHierarchy(biblesFRRaw);
const biblesEN = convertToHierarchy(biblesENRaw);
const biblesMG = convertToHierarchy(biblesMGRaw);

console.log('📚 Bibles chargées:', {
  fr: biblesFR.livres?.length,
  en: biblesEN.livres?.length,
  mg: biblesMG.livres?.length
});

type Lang = 'fr' | 'en' | 'mg';

// Noms des langues pour affichage
export const LANG_NAMES: Record<Lang, { name: string; flag: string; bibleName: string }> = {
  fr: { name: 'Français', flag: '🇫🇷', bibleName: 'Louis Segond 1910' },
  en: { name: 'English', flag: '🇬🇧', bibleName: 'King James Version' },
  mg: { name: 'Malagasy', flag: '🇲🇬', bibleName: 'Baiboly Malagasy' }
};

interface BibleContextType {
  bibleData: any;
  lang: Lang;
  setLang: (l: Lang) => void;
  bookmarks: Bookmark[];
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  lastPosition: LastPosition | null;
  saveLastPosition: (pos: LastPosition) => void;
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export const BibleProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('fr');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [settings, setSettings] = useState<UserSettings>({ 
    fontSize: 18, 
    theme: 'light', 
    lang: 'fr' 
  });
  const [fontSize, setFontSizeState] = useState(18);

  const bibleData = lang === 'fr' ? biblesFR : lang === 'en' ? biblesEN : biblesMG;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bm, lp, st] = await Promise.all([
          AsyncStorage.getItem('@bible:bookmarks'),
          AsyncStorage.getItem('@bible:last_position'),
          AsyncStorage.getItem('@bible:settings'),
        ]);

        if (bm) setBookmarks(JSON.parse(bm));
        if (lp) setLastPosition(JSON.parse(lp));
        if (st) {
          const parsed = JSON.parse(st);
          setSettings(parsed);
          if (parsed.fontSize) setFontSizeState(parsed.fontSize);
          if (parsed.lang) setLangState(parsed.lang as Lang);
        }
      } catch (e) {
        console.error('Load error:', e);
      }
    };
    loadData();
  }, []);

  const setLang = async (l: Lang) => {
    setLangState(l);
    const updatedSettings = { ...settings, lang: l };
    setSettings(updatedSettings);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updatedSettings));
  };

  const addBookmark = async (b: Bookmark) => {
    const updated = [b, ...bookmarks];
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  };

  const removeBookmark = async (id: string) => {
    const updated = bookmarks.filter((bm) => bm.id !== id);
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  };

  const isBookmarked = (id: string) => bookmarks.some((bm) => bm.id === id);

  const saveLastPosition = async (pos: LastPosition) => {
    setLastPosition(pos);
    await AsyncStorage.setItem('@bible:last_position', JSON.stringify(pos));
  };

  const updateSettings = async (s: Partial<UserSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updated));
  };

  const setFontSize = async (n: number) => {
    setFontSizeState(n);
    const updatedSettings = { ...settings, fontSize: n };
    setSettings(updatedSettings);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updatedSettings));
  };

  return (
    <BibleContext.Provider value={{
      bibleData,
      lang,
      setLang,
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      lastPosition,
      saveLastPosition,
      settings,
      updateSettings,
      fontSize,
      setFontSize,
    }}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
};