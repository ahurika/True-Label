import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('node_modules/@fontsource/dm-sans/files');
const destDir = path.resolve('public/fonts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy WOFF2 files for 400, 500, 600, 700 (latin and latin-ext)
const weights = ['400', '500', '600', '700'];
const allFiles = fs.readdirSync(srcDir);
const matching = allFiles.filter(f => {
  return f.endsWith('.woff2') && weights.some(w => f.includes(`-${w}-normal`));
});

console.log(`Copying ${matching.length} font files to ${destDir}...`);
for (const file of matching) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  console.log(`Copied ${file}`);
}

console.log('Font copying complete.');
