import { ProductCategory } from '@/domain/types';
import { CombinedVerdictResult } from '@/domain/verdict-engine';

export interface PackSessionData {
  scanId?: string;
  capturedPreviewUrl: string | null;
  additionalImages: string[]; // up to 3 images (front, back, batch)
  registrationNumber: string;
  brand: string;
  productName: string;
  manufacturer: string;
  batchNumber: string;
  manufactureDate?: string;
  expiryDate: string;
  category: ProductCategory;
  medicineStrength: string;
  dosageForm?: string;
  activeIngredients: string;
  directions: string;
  isNumberConfirmed: boolean;
  isIdentityConfirmed: boolean;
  isStrengthConfirmed: boolean;
  isManuallyEntered?: boolean;
  verdictResult: CombinedVerdictResult | null;
  hasActiveScan: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'truelabel_active_pack';

export const EMPTY_PACK_SESSION: PackSessionData = {
  capturedPreviewUrl: null,
  additionalImages: [],
  registrationNumber: '',
  brand: '',
  productName: '',
  manufacturer: '',
  batchNumber: '',
  manufactureDate: '',
  expiryDate: '',
  category: 'other',
  medicineStrength: '',
  dosageForm: '',
  activeIngredients: '',
  directions: '',
  isNumberConfirmed: false,
  isIdentityConfirmed: false,
  isStrengthConfirmed: false,
  isManuallyEntered: false,
  verdictResult: null,
  hasActiveScan: false,
  lastUpdated: new Date().toISOString(),
};

/**
 * Reads active pack data from browser sessionStorage.
 * Safe for SSR (returns EMPTY_PACK_SESSION when window is undefined).
 */
export function getPackSession(): PackSessionData {
  if (typeof window === 'undefined') {
    return { ...EMPTY_PACK_SESSION };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...EMPTY_PACK_SESSION };
    }
    const parsed = JSON.parse(raw);
    return { ...EMPTY_PACK_SESSION, ...parsed };
  } catch (e) {
    console.warn('[PackSession] Failed to read from sessionStorage:', e);
    return { ...EMPTY_PACK_SESSION };
  }
}

/**
 * Merges partial data into active pack session and saves to sessionStorage.
 */
export function setPackSession(partial: Partial<PackSessionData>): PackSessionData {
  if (typeof window === 'undefined') {
    return { ...EMPTY_PACK_SESSION, ...partial, hasActiveScan: true };
  }

  try {
    const current = getPackSession();
    const updated: PackSessionData = {
      ...current,
      ...partial,
      hasActiveScan: true,
      lastUpdated: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('[PackSession] Failed to save to sessionStorage:', e);
    return { ...EMPTY_PACK_SESSION, ...partial, hasActiveScan: true };
  }
}

/**
 * Resets active pack session back to initial defaults.
 */
export function resetPackSession(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[PackSession] Failed to clear sessionStorage:', e);
    }
  }
}
