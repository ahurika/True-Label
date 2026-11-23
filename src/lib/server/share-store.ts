import crypto from 'crypto';
import { ConfirmedPackInput } from '@/domain/types';
import { CombinedVerdictResult } from '@/domain/verdict-engine';

export interface ReadOnlySharePayload {
  token: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string; // 30-day lifetime
  confirmedPack: {
    registrationNumber: string;
    brand: string;
    productName: string;
    manufacturer?: string;
    category: string;
    medicineStrength?: string;
    dosageForm?: string;
    batchNumber?: string;
    expiryDate?: string;
    isManuallyEntered?: boolean;
  };
  verdictResult: CombinedVerdictResult;
  isExpired: boolean;
}

// 30 days in milliseconds
const SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Ephemeral in-memory share cache (keyed by tokenHash, preserved across Next.js module evaluations via globalThis)
const globalForShares = globalThis as unknown as {
  transientShareCache?: Map<string, ReadOnlySharePayload>;
};

export const transientShareCache =
  globalForShares.transientShareCache ?? new Map<string, ReadOnlySharePayload>();

if (process.env.NODE_ENV !== 'production') {
  globalForShares.transientShareCache = transientShareCache;
}

/**
 * Hashes a share token using SHA-256 for secure lookup.
 */
export function hashShareToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Creates a server-side read-only share record from validated scan data.
 * Zero images and zero personal information are stored.
 */
export function createShareRecord(
  confirmedPack: ConfirmedPackInput,
  verdictResult: CombinedVerdictResult
): ReadOnlySharePayload {
  // Generate 24 bytes of cryptographically secure random entropy
  const token = crypto.randomBytes(24).toString('base64url');
  const tokenHash = hashShareToken(token);

  const now = Date.now();
  const expiresAt = now + SHARE_TTL_MS;

  const payload: ReadOnlySharePayload = {
    token,
    tokenHash,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    confirmedPack: {
      registrationNumber: confirmedPack.registrationNumber,
      brand: confirmedPack.brand,
      productName: confirmedPack.productName,
      manufacturer: confirmedPack.manufacturer,
      category: confirmedPack.category,
      medicineStrength: confirmedPack.medicineStrength,
      dosageForm: confirmedPack.dosageForm,
      batchNumber: confirmedPack.batchNumber,
      expiryDate: confirmedPack.expiryDate,
      isManuallyEntered: confirmedPack.isManuallyEntered,
    },
    verdictResult,
    isExpired: false,
  };

  transientShareCache.set(tokenHash, payload);
  return payload;
}

/**
 * Retrieves a share record by its raw token if valid and unexpired.
 */
export function getShareRecordByToken(token: string): ReadOnlySharePayload | null {
  const tokenHash = hashShareToken(token);
  const share = transientShareCache.get(tokenHash);

  if (!share) return null;

  const isExpired = Date.now() > new Date(share.expiresAt).getTime();
  if (isExpired) {
    transientShareCache.delete(tokenHash);
    return null;
  }

  return share;
}
