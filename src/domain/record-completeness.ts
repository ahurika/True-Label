import { RecordCompleteness, ProductCategory } from './types';

/**
 * ============================================================
 * TRUELABEL DOMAIN: RECORD COMPLETENESS
 * Evaluates whether a registry record or pack input has the minimum
 * required identity fields to support unambiguous comparison.
 * ============================================================
 */

export interface CompletenessCheckResult {
  completeness: RecordCompleteness;
  isComplete: boolean;
  missingFields: string[];
  reason?: string;
}

/**
 * Evaluates completeness of a statutory registry record.
 * Required: registrationNumber, productName, category.
 * Strongly recommended: brand, manufacturer.
 */
export function evaluateRecordCompleteness(record: {
  registrationNumber?: string;
  productName?: string;
  brand?: string;
  manufacturer?: string;
  category?: ProductCategory;
}): CompletenessCheckResult {
  const missing: string[] = [];

  if (!record.registrationNumber || !record.registrationNumber.trim()) {
    missing.push('registrationNumber');
  }
  if (!record.productName || !record.productName.trim()) {
    missing.push('productName');
  }
  if (!record.category) {
    missing.push('category');
  }

  // A record missing brand and manufacturer is considered incomplete for high-evidence matching
  if (!record.brand && !record.manufacturer) {
    missing.push('brand_or_manufacturer');
  }

  const isComplete = missing.length === 0;

  return {
    completeness: isComplete ? 'complete' : 'incomplete',
    isComplete,
    missingFields: missing,
    reason: isComplete
      ? 'Record possesses all required statutory identity fields'
      : `Record is missing required identity fields: ${missing.join(', ')}`,
  };
}

/**
 * For medicine packaging, checks whether critical clinical identity fields exist.
 */
export function evaluateMedicineDetailsCompleteness(medicine: {
  medicineStrength?: string;
  dosageForm?: string;
  activeIngredients?: string;
}): CompletenessCheckResult {
  const missing: string[] = [];

  if (!medicine.medicineStrength || !medicine.medicineStrength.trim()) {
    missing.push('medicineStrength');
  }
  if (!medicine.activeIngredients || !medicine.activeIngredients.trim()) {
    missing.push('activeIngredients');
  }

  const isComplete = missing.length === 0;

  return {
    completeness: isComplete ? 'complete' : 'incomplete',
    isComplete,
    missingFields: missing,
    reason: isComplete
      ? 'Medicine details contain active ingredients and strength'
      : `Medicine details missing: ${missing.join(', ')}`,
  };
}
