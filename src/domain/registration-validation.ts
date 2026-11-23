import { ProductCategory } from './types';
import { normalizeRegistrationNumber } from './normalization';

/**
 * ============================================================
 * TRUELABEL DOMAIN: REGISTRATION VALIDATION
 * Pure TypeScript format checking for official registration numbers.
 * ============================================================
 */

export interface RegistrationValidationResult {
  isValid: boolean;
  normalized: string;
  isCategoryFormatExpected: boolean;
  formatDescription: string;
  error?: string;
}

/**
 * Common Nigerian NAFDAC patterns:
 * - Traditional drugs/food: 2 digits + 4 digits (e.g. 04-0123, 01-1234, A4-1234)
 * - Modern 6-8 alphanumeric strings (e.g. B4-1234, NR-12345, 04-12345)
 */
export function validateRegistrationNumber(
  rawNumber: string,
  category?: ProductCategory
): RegistrationValidationResult {
  const normalized = normalizeRegistrationNumber(rawNumber);

  if (!normalized) {
    return {
      isValid: false,
      normalized: '',
      isCategoryFormatExpected: false,
      formatDescription: 'Empty or missing registration number',
      error: 'Registration number is missing or empty',
    };
  }

  // Minimum length for a Nigerian NAFDAC registration code is 5 characters (e.g. 04-123 or A1-123)
  if (normalized.length < 5 || normalized.length > 15) {
    return {
      isValid: false,
      normalized,
      isCategoryFormatExpected: false,
      formatDescription: 'Registration number length is invalid (must be 5 to 15 alphanumeric characters)',
      error: `Invalid length (${normalized.length} characters)`,
    };
  }

  // Check character set (alphanumeric only)
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      isCategoryFormatExpected: false,
      formatDescription: 'Registration number contains forbidden symbols',
      error: 'Only letters and numbers are permitted',
    };
  }

  // Common NAFDAC prefix category heuristics
  // Medicine: typically starts with 04-, A4-, B4-, etc.
  const isCategoryExpected = true;
  let formatDesc = 'Valid statutory format';

  if (category === 'medicine') {
    if (/^04|^A4|^B4/.test(normalized)) {
      formatDesc = 'Standard NAFDAC human medicine format';
    } else {
      formatDesc = 'Non-standard prefix for human medicine';
    }
  } else if (category === 'food' || category === 'beverage' || category === 'water') {
    if (/^01|^A1|^B1|^08/.test(normalized)) {
      formatDesc = 'Standard NAFDAC food/water format';
    }
  }

  return {
    isValid: true,
    normalized,
    isCategoryFormatExpected: isCategoryExpected,
    formatDescription: formatDesc,
  };
}
