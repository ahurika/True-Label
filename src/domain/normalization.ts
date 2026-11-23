/**
 * ============================================================
 * TRUELABEL DOMAIN: NORMALIZATION
 * Pure TypeScript text, number and identifier normalisation.
 * ============================================================
 */

/**
 * Normalizes NAFDAC registration numbers for safe format comparison:
 * Strips whitespace, dashes, underscores, periods, and forces uppercase.
 * Example: " 04 - 0123 " -> "040123"
 */
export function normalizeRegistrationNumber(num: string | null | undefined): string {
  if (!num) return '';
  return num.replace(/[\s\-_.]/g, '').toUpperCase().trim();
}

/**
 * Formats a normalized registration number into standard readable hyphenated form where applicable.
 * E.g., "040123" -> "04-0123"
 */
export function formatRegistrationNumber(num: string | null | undefined): string {
  if (!num) return '';
  const clean = normalizeRegistrationNumber(num);
  if (/^(\d{2})(\d{4,5})$/.test(clean)) {
    return clean.replace(/^(\d{2})(\d{4,5})$/, '$1-$2');
  }
  if (/^([A-Z]\d)(\d{4,5})$/.test(clean)) {
    return clean.replace(/^([A-Z]\d)(\d{4,5})$/, '$1-$2');
  }
  return clean;
}

/**
 * Normalizes general text for brand, product name, and manufacturer comparison:
 * Lowercases, strips punctuation, normalises diacritics, and collapses whitespace.
 */
export function normalizeText(text: unknown): string {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  if (!str.trim()) return '';
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes batch numbers: uppercase, alphanumeric only.
 */
export function normalizeBatch(batch: string | null | undefined): string {
  if (!batch) return '';
  return batch.replace(/[\s\-_.]/g, '').toUpperCase().trim();
}
