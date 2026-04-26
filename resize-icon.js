// resize-icon.js
const sharp = require('sharp');

const inputIcon = './assets/bible.png';

async function resize() {
  await sharp(inputIcon)
    .resize(512, 512)
    .png()
    .toFile('./assets/bible-resized.png');
  console.log('✅ Icône redimensionnée à 512x512');
}

resize().catch(console.error);