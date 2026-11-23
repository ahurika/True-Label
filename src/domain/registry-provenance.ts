import { EvidenceClassification } from './types';
import { EXACT_APPROVED_NAFDAC_DOMAINS } from './alert-provenance';

/**
 * ============================================================================
 * TRUELABEL DOMAIN: STATUTORY REGISTRY RECORD PROVENANCE VALIDATOR
 * ============================================================================
 *
 * ARCHITECTURAL BOUNDARY & LIMITATION STATEMENT:
 * TrueLabel evaluates documentary provenance, exact domain authorization,
 * path specificity, and accountable human reviewer sign-off records.
 *
 * It does NOT perform live automated web scraping or TLS content attestation
 * of NAFDAC Green Book pages over the wire at runtime.
 *
 * Therefore:
 * 1. An HTTPS URL alone is NEVER proof of authenticity.
 * 2. `lastVerifiedAt` has a database default and represents periodic freshness;
 *    it CANNOT substitute for an explicit auditor sign-off timestamp (`verifiedAt`).
 * 3. Production eligibility strictly requires:
 *    a. `evidenceClassification === 'independently_verified_official'`
 *    b. `isProductionEligible === true`
 *    c. A valid, product-specific official source URL on an approved NAFDAC domain.
 *    d. An explicit, valid `verifiedAt` timestamp.
 *    e. A non-empty, accountable `verifiedBy` reviewer reference.
 *    f. Documented source evidence (`fieldProvenance`) covering registration number,
 *       product name, and manufacturer.
 * ============================================================================
 */

/**
 * Placeholder, generic, and fabricated reviewer identifiers that cannot establish accountability.
 */
export const DISALLOWED_REVIEWER_IDENTIFIERS = new Set([
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
 * Generic portal roots, directory indices, and search listings that do NOT identify a specific product.
 */
const GENERIC_REGISTRY_PORTAL_PATHS = new Set([
  '',
  '/',
  '/food-registry',
  '/food-registry/',
  '/drug-registry',
  '/drug-registry/',
  '/registry',
  '/registry/',
  '/greenbook',
  '/greenbook/',
  '/napams',
  '/napams/',
  '/products',
  '/products/',
  '/database',
  '/database/',
]);

export interface RegistryProvenanceInput {
  registrationNumber?: string;
  productName?: string;
  brand?: string;
  manufacturer?: string;
  sourceUrl?: string;
  retrievedAt?: Date | string | null;
  lastVerifiedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  verifiedBy?: string | null;
  evidenceClassification?: EvidenceClassification | string | null;
  isProductionEligible?: boolean | null;
  fieldProvenance?: Record<string, unknown> | null;
}

export interface RegistryProvenanceValidationResult {
  isValid: boolean;
  reasons: string[];
}

/**
 * Validates whether a registry record meets all strict production evidence-provenance requirements.
 * Reusable across repository queries, cache fallbacks, and verdict engine gates.
 */
export function validateRegistryRecordProvenance(
  input: RegistryProvenanceInput
): RegistryProvenanceValidationResult {
  const reasons: string[] = [];

  // 1. Evidence Classification Gate
  if (input.evidenceClassification !== 'independently_verified_official') {
    reasons.push(
      `Evidence classification must be 'independently_verified_official'; received '${input.evidenceClassification || 'none'}'`
    );
  }

  // 2. Production Eligibility Gate
  if (input.isProductionEligible !== true) {
    reasons.push(
      'Registry record has not been approved as production eligible (isProductionEligible !== true)'
    );
  }

  // 3. Source URL & Domain Authorization Gate
  const urlStr = input.sourceUrl;
  if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) {
    reasons.push('Registry record is missing an official source URL');
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

      // Product-Specific Document Path Validation
      const cleanPath = parsed.pathname.replace(/\/+$/, '').toLowerCase();
      if (GENERIC_REGISTRY_PORTAL_PATHS.has(cleanPath) || cleanPath === '') {
        reasons.push(
          'Source URL points to a general portal homepage or category directory, not a specific official product record'
        );
      } else {
        const segments = cleanPath.split('/').filter(Boolean);
        const leaf = segments[segments.length - 1] || '';
        if (
          leaf.length < 3 ||
          ['index', 'home', 'default', 'products', 'all', 'registry', 'database'].includes(leaf)
        ) {
          reasons.push('Source URL leaf slug does not identify a specific published product document');
        }
      }
    } catch {
      reasons.push(`Source URL '${urlStr}' is malformed and cannot be parsed as a valid URL`);
    }
  }

  // 4. Explicit Independent Auditor Verification Timestamp Gate
  // lastVerifiedAt cannot substitute for verifiedAt!
  if (!input.verifiedAt) {
    reasons.push(
      'Registry record is missing an explicit independent auditor verification timestamp (verifiedAt); lastVerifiedAt cannot substitute for verifiedAt'
    );
  } else {
    const d = new Date(input.verifiedAt);
    if (isNaN(d.getTime())) {
      reasons.push(`Invalid independent verification timestamp: '${input.verifiedAt}'`);
    }
  }

  // 5. Accountable Reviewer Reference Gate
  const reviewer = input.verifiedBy;
  if (
    !reviewer ||
    typeof reviewer !== 'string' ||
    !reviewer.trim() ||
    DISALLOWED_REVIEWER_IDENTIFIERS.has(reviewer.trim().toLowerCase())
  ) {
    reasons.push(
      'Registry record lacks an accountable reviewer reference (verifiedBy); production eligibility cannot be granted without documented human audit'
    );
  }

  // 6. Documented Source Evidence Gate (fieldProvenance)
  const prov = input.fieldProvenance;
  if (!prov || typeof prov !== 'object') {
    reasons.push(
      'Registry record is missing documented field provenance evidence (fieldProvenance)'
    );
  } else {
    const hasRegNumEvidence = Boolean(
      prov.registrationNumber && typeof prov.registrationNumber === 'string' && prov.registrationNumber.trim()
    );
    const hasProdNameEvidence = Boolean(
      prov.productName && typeof prov.productName === 'string' && prov.productName.trim()
    );
    const hasMakerEvidence = Boolean(
      prov.manufacturer && typeof prov.manufacturer === 'string' && prov.manufacturer.trim()
    );

    if (!hasRegNumEvidence || !hasProdNameEvidence || !hasMakerEvidence) {
      reasons.push(
        'Documented source evidence (fieldProvenance) must explicitly cover registrationNumber, productName, and manufacturer'
      );
    }
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}
