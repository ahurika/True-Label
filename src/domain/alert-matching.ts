import { MatchedAlertEvidence, ProductCategory } from './types';
import { normalizeBatch, normalizeText } from './normalization';

/**
 * ============================================================
 * TRUELABEL DOMAIN: ALERT MATCHING
 * Evaluates public recall and safety alerts against pack evidence.
 * PRD v4.0 Non-Negotiable Rules:
 * 1. An alert verdict requires:
 *    - An exact confirmed batch number match, OR
 *    - An exact confirmed affected-pack name explicitly listed in the alert.
 * 2. Brand-only similarity creates an informational flag ('ALERT_ON_BRAND'),
 *    NEVER an alert verdict.
 * 3. Fuzzy matching alone cannot generate an alert verdict.
 * ============================================================
 */

export interface AlertDefinition {
  id: string;
  alertNumber: string;
  title: string;
  issuedOn: string;
  category?: ProductCategory;
  genuineBrands: string[];
  affectedPackNames: string[];
  batchNumbers: string[];
  sourceUrl?: string;
  retrievedAt?: string;
  lastReviewDate?: string;
}

export interface AlertMatchResult {
  matchedAlert: MatchedAlertEvidence | null;
  isBrandOnlyAlert: boolean;
  alertBrandNotice?: string;
  hasMatch: boolean;
}

export function matchAlert(
  pack: {
    brand?: string;
    productName?: string;
    batchNumber?: string;
    category?: ProductCategory;
  },
  alerts: AlertDefinition[]
): AlertMatchResult {
  if (!alerts || alerts.length === 0) {
    return { matchedAlert: null, isBrandOnlyAlert: false, hasMatch: false };
  }

  const normBatch = normalizeBatch(pack.batchNumber);
  const normPackName = normalizeText(pack.productName);
  const normBrand = normalizeText(pack.brand);

  let brandOnlyNotice: string | undefined;
  let isBrandOnly = false;

  for (const alert of alerts) {
    // 1. Check exact batch number match (Highest Priority)
    if (normBatch && alert.batchNumbers && alert.batchNumbers.length > 0) {
      for (const alertBatch of alert.batchNumbers) {
        if (normBatch === normalizeBatch(alertBatch)) {
          return {
            matchedAlert: {
              alertId: alert.id,
              alertNumber: alert.alertNumber,
              title: alert.title,
              issuedOn: alert.issuedOn,
              matchedField: 'batch_number',
              matchedValue: pack.batchNumber || alertBatch,
              ruleUsed: 'Exact batch number match against official NAFDAC recall list',
              officialSourceUrl: alert.sourceUrl,
              retrievedAt: alert.retrievedAt,
              lastReviewDate: alert.lastReviewDate,
            },
            isBrandOnlyAlert: false,
            hasMatch: true,
          };
        }
      }
    }

    // 2. Check exact affected-pack name match explicitly listed in the alert
    if (normPackName && alert.affectedPackNames && alert.affectedPackNames.length > 0) {
      for (const affectedPack of alert.affectedPackNames) {
        const normAffected = normalizeText(affectedPack);
        // Must be exact match or complete identity inclusion
        if (normPackName === normAffected || normPackName.includes(normAffected)) {
          return {
            matchedAlert: {
              alertId: alert.id,
              alertNumber: alert.alertNumber,
              title: alert.title,
              issuedOn: alert.issuedOn,
              matchedField: 'affected_pack_name',
              matchedValue: pack.productName || affectedPack,
              ruleUsed: 'Exact affected-pack name match explicitly named in official alert',
              officialSourceUrl: alert.sourceUrl,
              retrievedAt: alert.retrievedAt,
              lastReviewDate: alert.lastReviewDate,
            },
            isBrandOnlyAlert: false,
            hasMatch: true,
          };
        }
      }
    }

    // 3. Check Brand-only match (Flag only, NEVER a verdict)
    if (normBrand && alert.genuineBrands && alert.genuineBrands.length > 0) {
      for (const brand of alert.genuineBrands) {
        if (normBrand === normalizeText(brand)) {
          isBrandOnly = true;
          brandOnlyNotice = `NAFDAC Alert ${alert.alertNumber} mentions brand "${brand}", but neither this pack name nor batch number matches the affected product list.`;
        }
      }
    }
  }

  return {
    matchedAlert: null,
    isBrandOnlyAlert: isBrandOnly,
    alertBrandNotice: brandOnlyNotice,
    hasMatch: false,
  };
}
