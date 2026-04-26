// src/hooks/useBibleData.ts
import { useState, useEffect } from 'react';
import { BibleData, Livre } from '../types';

const bibleFR = require('../../assets/data/segond_19.json');
const bibleEN = require('../../assets/data/kjv.json');

export function useBibleData(lang: 'fr' | 'en') {
  const [bibleData, setBibleData] = useState<BibleData>(bibleFR);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const data = lang === 'fr' ? bibleFR : bibleEN;
      setBibleData(data);
    } catch (error) {
      console.error('Error loading bible data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const getBook = (bookIndex: number): Livre | null => {
    return bibleData?.livres?.[bookIndex] || null;
  };

  const getChapter = (bookIndex: number, chapterIndex: number) => {
    const book = getBook(bookIndex);
    return book?.chapitres?.[chapterIndex] || null;
  };

  const getVerse = (bookIndex: number, chapterIndex: number, verseNum: number) => {
    const chapter = getChapter(bookIndex, chapterIndex);
    return chapter?.versets?.find(v => v.numero === verseNum) || null;
  };

  const search = (query: string, testament?: 'all' | 'ancien' | 'nouveau') => {
    const term = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const results = [];
    const livres = bibleData?.livres || [];

    for (let bi = 0; bi < livres.length; bi++) {
      const livre = livres[bi];
      if (testament && testament !== 'all' && livre.testament !== testament) continue;
      
      for (let ci = 0; ci < livre.chapitres.length; ci++) {
        const chapter = livre.chapitres[ci];
        for (const verse of chapter.versets) {
          const normalized = verse.texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (normalized.includes(term)) {
            results.push({
              bookIndex: bi,
              bookName: livre.nom,
              chapterIndex: ci,
              chapterNum: ci + 1,
              verseNum: verse.numero,
              text: verse.texte,
              testament: livre.testament,
            });
            if (results.length >= 200) break;
          }
        }
        if (results.length >= 200) break;
      }
      if (results.length >= 200) break;
    }
    return results;
  };

  return {
    bibleData,
    isLoading,
    getBook,
    getChapter,
    getVerse,
    search,
  };
}