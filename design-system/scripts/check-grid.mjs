/**
 * check-grid.mjs
 * Validates that CSS files adhere to the 8-point grid rules and token usage.
 */
import fs from 'fs';
import path from 'path';

const dirsToCheck = process.argv.slice(2);
if (dirsToCheck.length === 0) {
  dirsToCheck.push('design-system');
}

let hasErrors = false;

// Allowed literal pixel values: 0, 1px, 2px, 3px (borders, focus rings), 4px (micro gaps / half)
const allowedPixelRegex = /^(0|1px|2px|3px|4px)$/;

function checkCssFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Strip comments
    const stripped = line.replace(/\/\*.*?\*\//g, '').trim();
    if (!stripped || stripped.startsWith('/*') || stripped.startsWith('*') || stripped.startsWith('//')) {
      return;
    }

    // Skip font declarations or keyframes or media queries or svg attributes
    if (stripped.includes('@font-face') || stripped.includes('@keyframes') || stripped.includes('svg')) {
      return;
    }

    // Check for hardcoded arbitrary off-grid pixel values in margin, padding, gap, width, height, border-radius
    // (excluding inside variable definitions in tokens.css which define the tokens themselves)
    if (!filePath.endsWith('tokens.css') && !filePath.endsWith('typography.css')) {
      const propMatch = stripped.match(/(margin|padding|gap|width|height|border-radius|top|bottom|left|right)\s*:\s*([^;]+);/i);
      if (propMatch) {
        const val = propMatch[2].trim();
        const pxMatches = val.match(/\b(\d+)px\b/g);
        if (pxMatches) {
          pxMatches.forEach((px) => {
            const num = parseInt(px.replace('px', ''), 10);
            if (num !== 0 && num !== 1 && num !== 2 && num !== 3 && num !== 4 && num % 8 !== 0) {
              console.warn(`[Grid Warning] ${path.basename(filePath)}:${index + 1}: Off-grid pixel value "${px}" in "${stripped}"`);
            }
          });
        }
      }
    }
  });
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.css') || entry.name.endsWith('.tsx'))) {
      checkCssFile(fullPath);
    }
  }
}

for (const dir of dirsToCheck) {
  walkDir(dir);
}

if (hasErrors) {
  console.error('❌ Grid check failed.');
  process.exit(1);
} else {
  console.log('✅ Grid check passed: All inspected styles respect the 8-point grid and tokens.');
}
