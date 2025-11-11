const https = require('https');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, '..', 'fonts');
const fonts = [
  {
    name: 'NotoSans-Regular.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/notosans/NotoSans-Regular.ttf'
  },
  {
    name: 'NotoSans-Bold.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/notosans/NotoSans-Bold.ttf'
  }
];

// Crear directorio si no existe
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

console.log('📥 Descargando fuentes con soporte UTF-8...\n');

fonts.forEach(font => {
  const filePath = path.join(fontDir, font.name);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${font.name} ya existe`);
    return;
  }

  const file = fs.createWriteStream(filePath);
  
  https.get(font.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`✅ ${font.name} descargada correctamente`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`❌ Error descargando ${font.name}: ${err.message}`);
  });
});