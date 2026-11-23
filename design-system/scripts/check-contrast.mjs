/**
 * check-contrast.mjs
 * Validates WCAG 2.2 AA contrast ratios for TrueLabel semantic colors.
 * Minimum contrast: 4.5:1 for normal text, 3:1 for large text / UI components.
 */

// Relative luminance calculation
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Key semantic pairs to validate:
const pairs = [
  // Light mode
  { name: 'Light Page / Text', fg: '#101A26', bg: '#FFFFFF', min: 4.5 },
  { name: 'Light Page / Muted Text', fg: '#66758A', bg: '#FFFFFF', min: 4.5 },
  { name: 'Light Surface / Text', fg: '#101A26', bg: '#F4F6FA', min: 4.5 },
  { name: 'Light Primary Button / On-Primary', fg: '#FFFFFF', bg: '#2A4F86', min: 4.5 },
  { name: 'Light Verdict 1 (Registered and matches) Text / Bg', fg: '#142C4D', bg: '#E6EDF6', min: 4.5 },
  { name: 'Light Verdict 2 (Matches a NAFDAC alert) Text / Bg', fg: '#4A2300', bg: '#FFE4C2', min: 4.5 },
  { name: 'Light Verdict 3 (Number problem) Text / Bg', fg: '#6B3000', bg: '#FFF4E5', min: 4.5 },
  { name: 'Light Verdict 4 (Could not confirm) Text / Bg', fg: '#35424F', bg: '#EAEEF4', min: 4.5 },

  // Dark mode
  { name: 'Dark Page / Text', fg: '#EAEEF4', bg: '#0A1118', min: 4.5 },
  { name: 'Dark Page / Muted Text', fg: '#8C99A9', bg: '#0A1118', min: 4.5 },
  { name: 'Dark Surface / Text', fg: '#EAEEF4', bg: '#101A26', min: 4.5 },
  { name: 'Dark Primary Button / On-Primary', fg: '#0A1118', bg: '#6C95D1', min: 4.5 },
  { name: 'Dark Verdict 1 (Registered and matches) Text / Bg', fg: '#D3E0F0', bg: '#0E2038', min: 4.5 },
  { name: 'Dark Verdict 2 (Matches a NAFDAC alert) Text / Bg', fg: '#FFF4E5', bg: '#4A2300', min: 4.5 },
  { name: 'Dark Verdict 3 (Number problem) Text / Bg', fg: '#FFE4C2', bg: '#4A2300', min: 4.5 },
  { name: 'Dark Verdict 4 (Could not confirm) Text / Bg', fg: '#CBD3DE', bg: '#1E2A38', min: 4.5 },
];

let allPassed = true;
console.log('Checking TrueLabel semantic color contrast ratios (WCAG 2.2 AA)...\n');

pairs.forEach(({ name, fg, bg, min }) => {
  const ratio = getContrastRatio(fg, bg);
  const passed = ratio >= min;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name.padEnd(45)} Ratio: ${ratio.toFixed(2)}:1 (Required: ≥ ${min}:1)`);
  if (!passed) allPassed = false;
});

if (allPassed) {
  console.log('\n✅ All color contrast checks passed (WCAG 2.2 AA compliant).');
} else {
  console.error('\n❌ Some contrast checks failed.');
  process.exit(1);
}
