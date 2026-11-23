import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('node_modules/@fontsource/dm-sans/files');
if (!fs.existsSync(dir)) {
  console.log('Directory not found:', dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.woff') || f.endsWith('.woff2'));
console.log(`Checking ${files.length} font files in @fontsource/dm-sans/files...`);

for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  const str = buf.toString('latin1');
  const hasTnum = str.includes('tnum');
  const hasZero = str.includes('zero');
  const hasGSUB = str.includes('GSUB');
  if (hasTnum || hasZero) {
    console.log(`${f}: tnum=${hasTnum}, zero=${hasZero}`);
  }
}
console.log('Done scanning font files.');
