const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./assets/data/segond_1910.json', 'utf8'));
console.log('Structure:', Object.keys(data));
console.log('Nombre de versets:', data.verses?.length);

if (data.verses && data.verses[0]) {
  console.log('Premier verset:', data.verses[0]);
}