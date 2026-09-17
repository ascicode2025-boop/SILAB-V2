const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public', 'asset');

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.toLowerCase().endsWith('.png') && stat.size > 1024 * 1024) { 
      // Only process PNGs larger than 1MB
      console.log(`Compressing ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
      const tempPath = fullPath + '.tmp.png';
      try {
        await sharp(fullPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .png({ compressionLevel: 9, quality: 80, palette: true })
          .toFile(tempPath);
        
        fs.renameSync(tempPath, fullPath);
        const newStat = fs.statSync(fullPath);
        console.log(` -> Done! New size: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (err) {
        console.error(`Failed to process ${file}:`, err);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }
  }
}

processDirectory(dir).then(() => console.log('All done!')).catch(console.error);
