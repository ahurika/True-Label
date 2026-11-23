import crypto from 'crypto';
import { ConfirmedPackInput, ProductCategory } from '@/domain/types';
import { CombinedVerdictResult } from '@/domain/verdict-engine';

export interface EphemeralScan {
  id: string;
  createdAt: number;
  expiresAt: number; // 30-minute TTL
  consentGranted: boolean;
  status: 'pending' | 'extracting' | 'extracted' | 'confirmed' | 'verified' | 'failed';
  extractedData?: {
    category?: ProductCategory;
    brandName?: string;
    productName?: string;
    registrationNumber?: string;
    manufacturer?: string;
    batchNumber?: string;
    manufactureDate?: string;
    expiryDate?: string;
    netContent?: string;
    ingredientsText?: string;
    activeIngredients?: string;
    strength?: string;
    dosageForm?: string;
    printedDirections?: string;
    confidenceScore?: number;
    rawTextExcerpt?: string;
  };
  confirmedInput?: ConfirmedPackInput;
  verdictResult?: CombinedVerdictResult;
  errorMessage?: string;
}

// 30-minute TTL in milliseconds (PRD §9 & §16.4)
const SCAN_TTL_MS = 30 * 60 * 1000;

// Global in-memory cache for transient scan states
const transientScanCache = new Map<string, EphemeralScan>();

/**
 * Creates a new ephemeral scan record.
 */
export function createScanRecord(consentGranted: boolean = true): EphemeralScan {
  cleanExpiredScans();
  const id = `scan_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Date.now();

  const scan: EphemeralScan = {
    id,
    createdAt: now,
    expiresAt: now + SCAN_TTL_MS,
    consentGranted,
    status: 'pending',
  };

  transientScanCache.set(id, scan);
  return scan;
}

/**
 * Retrieves a scan by its temporary ID if unexpired.
 */
export function getScanRecord(id: string): EphemeralScan | null {
  cleanExpiredScans();
  const scan = transientScanCache.get(id);
  if (!scan) return null;
  if (Date.now() > scan.expiresAt) {
    transientScanCache.delete(id);
    return null;
  }
  return scan;
}

/**
 * Updates a scan with extracted pack details.
 */
export function setScanExtractedData(
  id: string,
  data: EphemeralScan['extractedData']
): EphemeralScan | null {
  const scan = getScanRecord(id);
  if (!scan) return null;

  scan.extractedData = data;
  scan.status = 'extracted';
  transientScanCache.set(id, scan);
  return scan;
}

/**
 * Updates a scan with user-confirmed fields.
 */
export function setScanConfirmedData(
  id: string,
  confirmedInput: ConfirmedPackInput
): EphemeralScan | null {
  const scan = getScanRecord(id);
  if (!scan) return null;

  scan.confirmedInput = confirmedInput;
  scan.status = 'confirmed';
  transientScanCache.set(id, scan);
  return scan;
}

/**
 * Sets the final evaluated verdict on the scan.
 */
export function setScanVerdictResult(
  id: string,
  verdictResult: CombinedVerdictResult
): EphemeralScan | null {
  const scan = getScanRecord(id);
  if (!scan) return null;

  scan.verdictResult = verdictResult;
  scan.status = 'verified';
  transientScanCache.set(id, scan);
  return scan;
}

/**
 * Deletes transient scan state immediately on user request.
 */
export function deleteScanRecord(id: string): boolean {
  return transientScanCache.delete(id);
}

/**
 * Garbage-collects scans that have exceeded the 30-minute TTL.
 */
export function cleanExpiredScans(): void {
  const now = Date.now();
  for (const [id, scan] of transientScanCache.entries()) {
    if (now > scan.expiresAt) {
      transientScanCache.delete(id);
    }
  }
}
