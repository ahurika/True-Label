import fs from 'node:fs';
import path from 'node:path';

const figmaDir = path.resolve('True Label Design System');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (entry.name.endsWith('.pdf')) {
      results.push({ name: entry.name, path: fullPath, relPath: path.relative(figmaDir, fullPath) });
    }
  }
  return results;
}

const allPdfs = walk(figmaDir);
console.log(`Total PDF files found: ${allPdfs.length}`);

// Group by screen state code or category
const stateMap = new Map();

for (const pdf of allPdfs) {
  // Typical name: "A01 · Before you buy, read the label. · 1440 · Dark.pdf"
  // Or folder name: "H06 · Shared record/read only · 1440 · Dark.pdf"
  let match = pdf.name.match(/^([A-Z]\d{2}|O\d)\s*·\s*([^·]+)/);
  if (!match) {
    // Check relPath for folder-based states like "H06 · Shared record/..."
    match = pdf.relPath.match(/^([A-Z]\d{2}|O\d)\s*·\s*([^\\\/]+)/);
  }
  
  if (match) {
    const code = match[1];
    const title = match[2].trim();
    if (!stateMap.has(code)) {
      stateMap.set(code, { code, title, files: [] });
    }
    stateMap.get(code).files.push(pdf.name);
  } else {
    console.log('Non-screen PDF:', pdf.relPath);
  }
}

const sortedCodes = Array.from(stateMap.keys()).sort((a, b) => {
  return a.localeCompare(b, undefined, { numeric: true });
});

console.log(`\nUnique screen/overlay codes found: ${sortedCodes.length}`);
for (const code of sortedCodes) {
  const item = stateMap.get(code);
  console.log(`${code}: "${item.title}" (${item.files.length} variants)`);
}

// Check C series specifically
console.log('\nC series states:');
for (let i = 1; i <= 16; i++) {
  const code = `C${String(i).padStart(2, '0')}`;
  if (stateMap.has(code)) {
    console.log(`  ${code}: FOUND - "${stateMap.get(code).title}"`);
  } else {
    console.log(`  ${code}: MISSING from source folder`);
  }
}
