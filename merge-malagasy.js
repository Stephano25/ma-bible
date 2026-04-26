// merge-malgasy.js
const fs = require('fs');
const path = require('path');

// Dossiers contenant les livres
const ancienDir = './assets/data/baiboly-json-master/Testameta taloha';
const nouveauDir = './assets/data/baiboly-json-master/Testameta vaovao';

// Résultat final
const allVerses = [];

// Fonction pour lire tous les fichiers JSON d'un dossier
function readBooksFromDir(dirPath, startBookId) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Dossier non trouvé: ${dirPath}`);
    return [];
  }
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  const books = [];
  
  files.forEach((file, index) => {
    try {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Extraire le nom du livre depuis le nom du fichier ou depuis les données
      let bookName = file.replace('.json', '');
      // Nettoyer le nom (enlever les tirets, etc.)
      bookName = bookName.replace(/-/g, ' ');
      
      books.push({
        name: bookName,
        data: data,
        bookId: startBookId + index
      });
    } catch (e) {
      console.error(`Erreur lecture ${file}:`, e.message);
    }
  });
  
  return books;
}

// Lire les livres de l'Ancien Testament (bookId 1-39)
const ancienBooks = readBooksFromDir(ancienDir, 1);
// Lire les livres du Nouveau Testament (bookId 40-66)
const nouveauBooks = readBooksFromDir(nouveauDir, 40);

// Fusionner tous les livres
const allBooks = [...ancienBooks, ...nouveauBooks];

// Parcourir chaque livre
allBooks.forEach(book => {
  const bookData = book.data;
  const bookName = book.name;
  const bookId = book.bookId;
  
  // Si le fichier a une structure chapitres/versets
  if (bookData.chapters || bookData.chapitres) {
    const chapters = bookData.chapters || bookData.chapitres;
    
    chapters.forEach((chapter, chapterIdx) => {
      const chapterNum = chapter.chapter || chapter.numero || chapterIdx + 1;
      const verses = chapter.verses || chapter.versets;
      
      if (verses) {
        verses.forEach(verse => {
          const verseNum = verse.verse || verse.numero;
          const text = verse.text || verse.texte;
          
          if (text) {
            allVerses.push({
              book_name: bookName,
              book: bookId,
              chapter: chapterNum,
              verse: verseNum,
              text: text
            });
          }
        });
      }
    });
  }
  // Si le fichier est déjà au format plat (liste de versets)
  else if (Array.isArray(bookData)) {
    bookData.forEach(verse => {
      allVerses.push({
        book_name: bookName,
        book: bookId,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text
      });
    });
  }
});

// Trier par livre, chapitre, verset
allVerses.sort((a, b) => {
  if (a.book !== b.book) return a.book - b.book;
  if (a.chapter !== b.chapter) return a.chapter - b.chapter;
  return a.verse - b.verse;
});

// Créer le fichier final
const output = {
  metadata: {
    version: 'Malagasy Bible',
    language: 'mg',
    bookCount: allBooks.length,
    verseCount: allVerses.length
  },
  verses: allVerses
};

fs.writeFileSync('./assets/data/malgasy.json', JSON.stringify(output, null, 2));

console.log(`✅ Conversion terminée !`);
console.log(`📚 Livres: ${allBooks.length}`);
console.log(`📖 Versets: ${allVerses.length}`);
console.log(`💾 Fichier créé: assets/data/malgasy.json`);