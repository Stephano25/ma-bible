const fs = require('fs');

try {
  const fr = JSON.parse(fs.readFileSync('./assets/data/segond_1910.json', 'utf8'));
  console.log('Type de segond_1910.json:', Array.isArray(fr) ? 'Tableau' : typeof fr);
  console.log('Est un tableau:', Array.isArray(fr));
  if (!Array.isArray(fr)) {
    console.log('Clés:', Object.keys(fr));
    console.log('Premier élément:', fr[0]);
  }
} catch(e) {
  console.error('Erreur:', e.message);
}