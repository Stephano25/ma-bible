// src/context/BibleContext.tsx
// ============================================================
//  BIBLE CONTEXT — Gestion des données bibliques, favoris, position de lecture
// ============================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, LastPosition, UserSettings } from '../types';

// Import des bibles locales (format plat: liste de versets)
const biblesFRRaw = require('../../assets/data/segond_1910.json');
const biblesENRaw = require('../../assets/data/kjv.json');

// Type pour un verset dans le format plat
interface RawVerset {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

// Type pour un verset dans le format hiérarchique
interface Verset {
  numero: number;
  texte: string;
}

interface Chapitre {
  numero: number;
  versets: Verset[];
}

interface Livre {
  nom: string;
  abrev: string;
  testament: 'ancien' | 'nouveau';
  categorie: string;
  chapitres: Chapitre[];
}

interface BibleData {
  livres: Livre[];
}

// Fonction pour convertir le format plat en structure hiérarchique
function convertToHierarchy(data: RawVerset[]): BibleData {
  const booksMap = new Map<string, any>();

  data.forEach((verse: RawVerset) => {
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
        versets: chapter.versets.sort((a: Verset, b: Verset) => a.numero - b.numero)
      }))
      .sort((a: Chapitre, b: Chapitre) => a.numero - b.numero)
  }));

  // Trier les livres par ID
  livres.sort((a: any, b: any) => {
    const aId = data.find((v: RawVerset) => v.book_name === a.nom)?.book || 0;
    const bId = data.find((v: RawVerset) => v.book_name === b.nom)?.book || 0;
    return aId - bId;
  });

  return { livres };
}

// Convertir les données au chargement
const biblesFR = convertToHierarchy(biblesFRRaw);
const biblesEN = convertToHierarchy(biblesENRaw);

type Lang = 'fr' | 'en';

interface BibleContextType {
  bibleData: BibleData;
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

  const bibleData = lang === 'fr' ? biblesFR : biblesEN;

  // Chargement initial des données depuis AsyncStorage
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
          if (parsed.lang) setLangState(parsed.lang);
        }
      } catch (e) {
        console.error('Load error:', e);
      }
    };
    loadData();
  }, []);

  // Changer la langue
  const setLang = async (l: Lang) => {
    setLangState(l);
    const updatedSettings = { ...settings, lang: l };
    setSettings(updatedSettings);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updatedSettings));
  };

  // Ajouter un favori
  const addBookmark = async (b: Bookmark) => {
    const updated = [b, ...bookmarks];
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  };

  // Supprimer un favori
  const removeBookmark = async (id: string) => {
    const updated = bookmarks.filter((bm) => bm.id !== id);
    setBookmarks(updated);
    await AsyncStorage.setItem('@bible:bookmarks', JSON.stringify(updated));
  };

  // Vérifier si un verset est en favori
  const isBookmarked = (id: string) => bookmarks.some((bm) => bm.id === id);

  // Sauvegarder la dernière position de lecture
  const saveLastPosition = async (pos: LastPosition) => {
    setLastPosition(pos);
    await AsyncStorage.setItem('@bible:last_position', JSON.stringify(pos));
  };

  // Mettre à jour les paramètres
  const updateSettings = async (s: Partial<UserSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updated));
  };

  // Changer la taille de la police
  const setFontSize = async (n: number) => {
    setFontSizeState(n);
    const updatedSettings = { ...settings, fontSize: n };
    setSettings(updatedSettings);
    await AsyncStorage.setItem('@bible:settings', JSON.stringify(updatedSettings));
  };

  const value = {
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
  };

  return (
    <BibleContext.Provider value={value}>
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