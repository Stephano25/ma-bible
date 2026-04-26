// convert-malgasy-v3.js
const fs = require('fs');
const path = require('path');

// Structure pour stocker tous les versets
const allVerses = [];

// Dossiers contenant les livres
const booksDir = './assets/data/baiboly-json-master';

// Liste des livres de l'Ancien Testament avec les noms exacts
const ancienBooks = [
  { id: 1, name: 'Genesisy', file: 'genesisy.json' },
  { id: 2, name: 'Eksodosy', file: 'eksodosy.json' },
  { id: 3, name: 'Levitikosy', file: 'levitikosy.json' },
  { id: 4, name: 'Nomery', file: 'nomery.json' },
  { id: 5, name: 'Deoteronomia', file: 'deoteronomia.json' },
  { id: 6, name: 'Josoa', file: 'josoa.json' },
  { id: 7, name: 'Mpitsara', file: 'mpitsara.json' },
  { id: 8, name: 'Rota', file: 'rota.json' },
  { id: 9, name: '1 Samoela', file: 'samoela-voalohany.json' },
  { id: 10, name: '2 Samoela', file: 'samoela-faharoa.json' },
  { id: 11, name: '1 Mpanjaka', file: 'mpanjaka-voalohany.json' },
  { id: 12, name: '2 Mpanjaka', file: 'mpanjaka-faharoa.json' },
  { id: 13, name: '1 Tantara', file: 'tantara-voalohany.json' },
  { id: 14, name: '2 Tantara', file: 'tantara-faharoa.json' },
  { id: 15, name: 'Ezra', file: 'ezra.json' },
  { id: 16, name: 'Nehemia', file: 'nehemia.json' },
  { id: 17, name: 'Estera', file: 'estera.json' },
  { id: 18, name: 'Joba', file: 'joba.json' },
  { id: 19, name: 'Salamo', file: 'salamo.json' },
  { id: 20, name: 'Ohabolana', file: 'ohabolana.json' },
  { id: 21, name: 'Mpitoriteny', file: 'mpitoriteny.json' },
  { id: 22, name: 'Tononkira', file: 'tononkirani-solomona.json' },
  { id: 23, name: 'Isaia', file: 'isaia.json' },
  { id: 24, name: 'Jeremia', file: 'jeremia.json' },
  { id: 25, name: 'Fitomaniana', file: 'fitomaniana.json' },
  { id: 26, name: 'Ezekiela', file: 'ezekiela.json' },
  { id: 27, name: 'Daniela', file: 'daniela.json' },
  { id: 28, name: 'Hosea', file: 'hosea.json' },
  { id: 29, name: 'Joela', file: 'joela.json' },
  { id: 30, name: 'Amosa', file: 'amosa.json' },
  { id: 31, name: 'Obadia', file: 'obadia.json' },
  { id: 32, name: 'Jona', file: 'jona.json' },
  { id: 33, name: 'Mika', file: 'mika.json' },
  { id: 34, name: 'Nahoma', file: 'nahoma.json' },
  { id: 35, name: 'Habakoka', file: 'habakoka.json' },
  { id: 36, name: 'Zefania', file: 'zefania.json' },
  { id: 37, name: 'Hagay', file: 'hagay.json' },
  { id: 38, name: 'Zakaria', file: 'zakaria.json' },
  { id: 39, name: 'Malakia', file: 'malakia.json' }
];

// Liste des livres du Nouveau Testament
const nouveauBooks = [
  { id: 40, name: 'Matio', file: 'matio.json' },
  { id: 41, name: 'Marka', file: 'marka.json' },
  { id: 42, name: 'Lioka', file: 'lioka.json' },
  { id: 43, name: 'Jaona', file: 'jaona.json' },
  { id: 44, name: 'Asan\'ny Apostoly', file: 'asanny-apostoly.json' },
  { id: 45, name: 'Romanina', file: 'romanina.json' },
  { id: 46, name: '1 Korintianina', file: '1-korintianina.json' },
  { id: 47, name: '2 Korintianina', file: '2-korintianina.json' },
  { id: 48, name: 'Galatianina', file: 'galatianina.json' },
  { id: 49, name: 'Efesianina', file: 'efesianina.json' },
  { id: 50, name: 'Filipianina', file: 'filipianina.json' },
  { id: 51, name: 'Kolosianina', file: 'kolosianina.json' },
  { id: 52, name: '1 Tesalonianina', file: '1-tesalonianina.json' },
  { id: 53, name: '2 Tesalonianina', file: '2-tesalonianina.json' },
  { id: 54, name: '1 Timoty', file: '1-timoty.json' },
  { id: 55, name: '2 Timoty', file: '2-timoty.json' },
  { id: 56, name: 'Titosy', file: 'titosy.json' },
  { id: 57, name: 'Filemona', file: 'filemona.json' },
  { id: 58, name: 'Hebreo', file: 'hebreo.json' },
  { id: 59, name: 'Jakoba', file: 'jakoba.json' },
  { id: 60, name: '1 Petera', file: '1-petera.json' },
  { id: 61, name: '2 Petera', file: '2-petera.json' },
  { id: 62, name: '1 Jaona', file: '1-jaona.json' },
  { id: 63, name: '2 Jaona', file: '2-jaona.json' },
  { id: 64, name: '3 Jaona', file: '3-jaona.json' },
  { id: 65, name: 'Joda', file: 'joda.json' },
  { id: 66, name: 'Apokalypsy', file: 'apokalypsy.json' }
];

// Fonction pour extraire les versets du format { "chapitre": { "verset": "texte", ... }, ... }
function processBookFile(filePath, bookId, bookName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let versesFound = 0;
    
    // Parcourir tous les chapitres
    const chapters = Object.keys(data);
    
    chapters.forEach(chapterNum => {
      const chapter = data[chapterNum];
      
      // Parcourir tous les versets du chapitre
      const verses = Object.keys(chapter);
      
      verses.forEach(verseNum => {
        const text = chapter[verseNum];
        
        if (text && typeof text === 'string' && text.trim().length > 0) {
          allVerses.push({
            book_name: bookName,
            book: bookId,
            chapter: parseInt(chapterNum),
            verse: parseInt(verseNum),
            text: text.trim()
          });
          versesFound++;
        }
      });
    });
    
    console.log(`✅ ${bookName}: ${versesFound} versets, ${chapters.length} chapitres`);
    
  } catch (e) {
    console.error(`❌ Erreur ${bookName}:`, e.message);
  }
}

console.log('🔄 Conversion de la Bible Malagasy...\n');

// Traiter l'Ancien Testament
console.log('📜 Ancien Testament (39 livres):');
ancienBooks.forEach(book => {
  const filePath = path.join(booksDir, 'Testameta taloha', book.file);
  if (fs.existsSync(filePath)) {
    processBookFile(filePath, book.id, book.name);
  } else {
    console.log(`⚠️ Fichier non trouvé: ${book.file}`);
  }
});

// Traiter le Nouveau Testament
console.log('\n✝️ Nouveau Testament (27 livres):');
nouveauBooks.forEach(book => {
  const filePath = path.join(booksDir, 'Testameta vaovao', book.file);
  if (fs.existsSync(filePath)) {
    processBookFile(filePath, book.id, book.name);
  } else {
    console.log(`⚠️ Fichier non trouvé: ${book.file}`);
  }
});

// Trier les versets
console.log('\n🔄 Tri des versets...');
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
    bookCount: 66,
    verseCount: allVerses.length
  },
  verses: allVerses
};

// Sauvegarder
fs.writeFileSync('./assets/data/malgasy.json', JSON.stringify(output, null, 2));

const fileSize = (fs.statSync('./assets/data/malgasy.json').size / 1024 / 1024).toFixed(2);

console.log(`\n✅ Conversion terminée !`);
console.log(`📚 Livres: 66/66`);
console.log(`📖 Versets: ${allVerses.length.toLocaleString()}`);
console.log(`💾 Taille: ${fileSize} MB`);
console.log(`📁 Fichier: assets/data/malgasy.json`);

if (allVerses.length === 0) {
  console.log('\n❌ Aucun verset trouvé!');
} else {
  console.log(`\n📖 Exemple de verset:`);
  console.log(`   ${allVerses[0].book_name} ${allVerses[0].chapter}:${allVerses[0].verse}`);
  console.log(`   "${allVerses[0].text.substring(0, 100)}..."`);
}