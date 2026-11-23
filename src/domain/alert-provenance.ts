import { EvidenceClassification } from './types';

/**
 * ============================================================================
 * TRUELABEL DOMAIN: STATUTORY ALERT PROVENANCE VALIDATOR
 * ============================================================================
 *
 * ARCHITECTURAL BOUNDARY & LIMITATION STATEMENT:
 * TrueLabel evaluates documentary provenance, exact domain authorization, path
 * specificity, and accountable reviewer sign-off records.
 *
 * It does NOT perform live automated web crawling, TLS content attestation, or
 * cryptographic document hashing of NAFDAC portal HTML over the wire at runtime.
 *
 * Therefore:
 * 1. An HTTPS URL alone is NEVER proof of authenticity.
 * 2. An alert cannot be granted production eligibility merely by setting boolean
 *    flags or plausible timestamps.
 * 3. Production eligibility strictly requires an accountable, documented reviewer
 *    sign-off record (`verifiedBy` and `verifiedAt`) linked to specific affected
 *    batch or pack evidence.
 * ============================================================================
 */

/**
 * Placeholder, generic, and fabricated reviewer identifiers that cannot establish accountability.
 */
export const DISALLOWED_ALERT_REVIEWERS = new Set([
  'unassigned',
  'auto',
  'unknown',
  'placeholder',
  'test',
  'mock',
  'lead-auditor-regulatory-signoff',
  'none',
  'admin',
  'anonymous',
  'default',
]);

/**
 * Exact allowlist of approved statutory NAFDAC domains.
 * Arbitrary subdomains (e.g. attacker.nafdac.gov.ng or untrusted endpoints) are strictly rejected.
 */
export const EXACT_APPROVED_NAFDAC_DOMAINS = new Set([
  'nafdac.gov.ng',
  'www.nafdac.gov.ng',
  'greenbook.nafdac.gov.ng',
  'napams.nafdac.gov.ng',
]);

/**
 * Generic portal roots, directory indices, and category listing paths that do NOT identify a specific notice.
 */
const GENERIC_PORTAL_PATHS = new Set([
  '',
  '/',
  '/category',
  '/category/',
  '/category/public-alerts',
  '/category/public-alerts/',
  '/public-alerts',
  '/public-alerts/',
  '/alerts',
  '/alerts/',
  '/safety-alerts',
  '/safety-alerts/',
  '/news',
  '/news/',
]);

/**
 * Recognized official publication path prefixes on nafdac.gov.ng.
 */
const APPROVED_NOTICE_PREFIXES = ['/safety-alerts/', '/public-alerts/', '/category/public-alerts/', '/alerts/'];

export interface AlertProvenanceInput {
  alertNumber?: string;
  title?: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  retrievedAt?: Date | string | null;
  lastCheckedAt?: Date | string | null;
  lastReviewDate?: Date | string | null;
  verifiedAt?: Date | string | null;
  verifiedBy?: string | null;
  evidenceClassification?: EvidenceClassification | string | null;
  isSyntheticFixture?: boolean | null;
  isProductionEligible?: boolean | null;
  affectedPackNames?: string[];
  batchNumbers?: string[];
  matchedField?: 'batch_number' | 'affected_pack_name' | 'brand_only' | string;
  matchedValue?: string;
}

export interface AlertProvenanceValidationResult {
  isValid: boolean;
  reasons: string[];
}

/**
 * Validates whether an alert meets all strict production evidence-provenance requirements.
 * Reusable across database alert lookups, curated alert fallbacks, and verdict engine gates.
 */
export function validateAlertProvenance(input: AlertProvenanceInput): AlertProvenanceValidationResult {
  const reasons: string[] = [];

  // 1. Evidence Classification Gate
  if (input.evidenceClassification !== 'independently_verified_official') {
    reasons.push(
      `Evidence classification must be 'independently_verified_official'; received '${input.evidenceClassification || 'none'}'`
    );
  }

  // 2. Production Eligibility Gate
  if (input.isProductionEligible !== true) {
    reasons.push('Alert has not been verified and approved as production eligible (isProductionEligible !== true)');
  }

  // 3. Synthetic Test Fixture Gate
  if (input.isSyntheticFixture === true) {
    reasons.push('Alert is marked as a synthetic test fixture and is barred from production matching');
  }

  // 4. Source URL & Domain Authorization Gate
  const urlStr = input.officialSourceUrl || input.sourceUrl;
  if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) {
    reasons.push('Alert is missing an official source URL');
  } else {
    try {
      const parsed = new URL(urlStr.trim());

      // Protocol check: Strict HTTPS required
      if (parsed.protocol !== 'https:') {
        reasons.push(`Official source URL must use secure HTTPS; received protocol '${parsed.protocol}'`);
      }

      // Rejection of deceptive URL elements: userinfo, non-default ports, trailing dot hostnames
      if (parsed.username || parsed.password) {
        reasons.push('Source URL contains unexpected user credentials or userinfo');
      }

      if (parsed.port && parsed.port !== '443') {
        reasons.push(`Official statutory portal must use default HTTPS port 443; received port '${parsed.port}'`);
      }

      if (parsed.hostname.endsWith('.')) {
        reasons.push('Deceptive trailing dot detected in hostname');
      }

      // Hostname check: Exact allowlist matching only. Arbitrary subdomains are strictly rejected.
      const cleanHost = parsed.hostname.toLowerCase();
      if (!EXACT_APPROVED_NAFDAC_DOMAINS.has(cleanHost)) {
        reasons.push(
          `Source domain '${cleanHost}' is not in the exact approved statutory NAFDAC domain allowlist: [${Array.from(
            EXACT_APPROVED_NAFDAC_DOMAINS
          ).join(', ')}]`
        );
      }

      // 5. Specific Published Notice Path Validation
      const cleanPath = parsed.pathname.replace(/\/+$/, '').toLowerCase();
      if (GENERIC_PORTAL_PATHS.has(cleanPath) || cleanPath === '') {
        reasons.push('Source URL points to a general portal homepage or category listing, not a specific official notice page');
      } else {
        const segments = cleanPath.split('/').filter(Boolean);
        const hasApprovedPrefix = APPROVED_NOTICE_PREFIXES.some((prefix) => parsed.pathname.toLowerCase().startsWith(prefix));

        if (!hasApprovedPrefix) {
          reasons.push(
            `Source URL path '${parsed.pathname}' does not reside under an approved statutory public notice directory`
          );
        }

        const leaf = segments[segments.length - 1] || '';
        if (leaf.length < 5 || ['index', 'home', 'default', 'alerts', 'all', 'public-alerts'].includes(leaf)) {
          reasons.push('Source URL leaf slug does not identify a specific published notice document');
        }
      }
    } catch {
      reasons.push(`Source URL '${urlStr}' is malformed and cannot be parsed as a valid URL`);
    }
  }

  // 6. Evidence Identifying Exact Affected Product / Batch
  const hasBatches =
    Array.isArray(input.batchNumbers) &&
    input.batchNumbers.some((b) => Boolean(b && typeof b === 'string' && b.trim()));
  const hasPacks =
    Array.isArray(input.affectedPackNames) &&
    input.affectedPackNames.some((p) => Boolean(p && typeof p === 'string' && p.trim()));

  if (input.matchedField) {
    if (!input.matchedValue || !input.matchedValue.trim()) {
      reasons.push('Matched alert evidence is missing an affected product or batch identifier');
    }
  } else {
    if (!hasBatches && !hasPacks) {
      reasons.push('Alert record contains neither confirmed affected batch numbers nor affected pack names');
    }
  }

  // 7. Retrieval Timestamp
  if (!input.retrievedAt) {
    reasons.push('Alert record is missing a retrieval timestamp (retrievedAt)');
  } else {
    const d = new Date(input.retrievedAt);
    if (isNaN(d.getTime())) {
      reasons.push(`Invalid retrieval timestamp: '${input.retrievedAt}'`);
    }
  }

  // 8. Independent Verification & Accountable Reviewer Sign-Off Gate
  const reviewDate = input.verifiedAt || input.lastReviewDate || input.lastCheckedAt;
  if (!reviewDate) {
    reasons.push('Alert record is missing an independent verification/review timestamp (verifiedAt/lastReviewDate)');
  } else {
    const d = new Date(reviewDate);
    if (isNaN(d.getTime())) {
      reasons.push(`Invalid verification timestamp: '${reviewDate}'`);
    }
  }

  // Accountable Reviewer Requirement
  const reviewer = input.verifiedBy;
  if (
    !reviewer ||
    typeof reviewer !== 'string' ||
    !reviewer.trim() ||
    DISALLOWED_ALERT_REVIEWERS.has(reviewer.trim().toLowerCase())
  ) {
    reasons.push(
      'Alert lacks an accountable reviewer reference (verifiedBy); production eligibility cannot be granted without documented human audit'
    );
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}
