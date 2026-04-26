export interface Verset {
  numero: number;
  texte: string;
}

export interface Chapitre {
  numero: number;
  versets: Verset[];
}

export interface Livre {
  nom: string;
  abrev: string;
  testament: 'ancien' | 'nouveau';
  categorie: string;
  chapitres: Chapitre[];
}

export interface BibleData {
  livres: Livre[];
}

export interface Bookmark {
  id: string;
  book: string;
  bookAbrev: string;
  chapter: number;
  verse: number;
  text: string;
  addedAt: string;
  category: string;
  lang: 'fr' | 'en';
}

export interface LastPosition {
  bookIndex: number;
  chapterIndex: number;
  bookName: string;
  chapterNum: number;
}

export interface UserSettings {
  fontSize: number;
  theme: 'light' | 'dark';
  lang: 'fr' | 'en';
}

export interface ReadingStats {
  bookmarks: number;
  readingDays: number;
  progress: number;
}

// Catégories des livres
export const CATEGORIES_AT: Record<string, string> = {
  'Pentateuque': 'Pentateuque',
  'Livres historiques': 'Livres historiques',
  'Livres poétiques': 'Livres poétiques',
  'Livres prophétiques majeurs': 'Livres prophétiques majeurs',
  'Livres prophétiques mineurs': 'Livres prophétiques mineurs',
};

export const LIVRES_AT_CATEGORIES: Record<string, string> = {
  'Genèse': 'Pentateuque',
  'Exode': 'Pentateuque',
  'Lévitique': 'Pentateuque',
  'Nombres': 'Pentateuque',
  'Deutéronome': 'Pentateuque',
  'Josué': 'Livres historiques',
  'Juges': 'Livres historiques',
  'Ruth': 'Livres historiques',
  '1 Samuel': 'Livres historiques',
  '2 Samuel': 'Livres historiques',
  '1 Rois': 'Livres historiques',
  '2 Rois': 'Livres historiques',
  '1 Chroniques': 'Livres historiques',
  '2 Chroniques': 'Livres historiques',
  'Esdras': 'Livres historiques',
  'Néhémie': 'Livres historiques',
  'Esther': 'Livres historiques',
  'Job': 'Livres poétiques',
  'Psaumes': 'Livres poétiques',
  'Proverbes': 'Livres poétiques',
  'Ecclésiaste': 'Livres poétiques',
  'Cantique des cantiques': 'Livres poétiques',
  'Ésaïe': 'Livres prophétiques majeurs',
  'Jérémie': 'Livres prophétiques majeurs',
  'Lamentations': 'Livres prophétiques majeurs',
  'Ézéchiel': 'Livres prophétiques majeurs',
  'Daniel': 'Livres prophétiques majeurs',
};

export const LIVRES_NT_CATEGORIES: Record<string, string> = {
  'Matthieu': 'Évangiles',
  'Marc': 'Évangiles',
  'Luc': 'Évangiles',
  'Jean': 'Évangiles',
  'Actes': 'Histoire',
  'Romains': 'Épîtres de Paul',
  '1 Corinthiens': 'Épîtres de Paul',
  '2 Corinthiens': 'Épîtres de Paul',
  'Galates': 'Épîtres de Paul',
  'Éphésiens': 'Épîtres de Paul',
  'Philippiens': 'Épîtres de Paul',
  'Colossiens': 'Épîtres de Paul',
  '1 Thessaloniciens': 'Épîtres de Paul',
  '2 Thessaloniciens': 'Épîtres de Paul',
  '1 Timothée': 'Épîtres de Paul',
  '2 Timothée': 'Épîtres de Paul',
  'Tite': 'Épîtres de Paul',
  'Philémon': 'Épîtres de Paul',
  'Hébreux': 'Épîtres générales',
  'Jacques': 'Épîtres générales',
  '1 Pierre': 'Épîtres générales',
  '2 Pierre': 'Épîtres générales',
  '1 Jean': 'Épîtres générales',
  '2 Jean': 'Épîtres générales',
  '3 Jean': 'Épîtres générales',
  'Jude': 'Épîtres générales',
  'Apocalypse': 'Prophétie',
};