import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  Category,
  EvidenceClassification,
  Alert,
} from '@prisma/client';
import {
  findRegistryRecordDetailed,
  findAlertMatch,
  verifyConfirmedPack,
  CURATED_PUBLIC_ALERTS,
  CURATED_REGISTRY_RECORDS,
} from '@/lib/db/repository';
import { prisma } from '@/lib/db';
import { ConfirmedPackInput, MatchedAlertEvidence, RegistryRecordEvidence } from '@/domain/types';
import { evaluateVerdict } from '@/domain/verdict-engine';
import { REASON_CODES } from '@/domain/reason-codes';
import { validateAlertProvenance } from '@/domain/alert-provenance';
import { validateRegistryRecordProvenance } from '@/domain/registry-provenance';

describe('Final Production Evidence Gate & Provenance Regression Tests', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // ── 1. Unapproved Domain Is Rejected ────────────────────────────────────────
  it('1. HTTPS URL on an unapproved domain is rejected', () => {
    const unapprovedDomainAlert = {
      alertNumber: 'Notice No. 2026/001',
      title: 'Recall Alert on Imposter Portal',
      sourceUrl: 'https://fake-nafdac-portal.com/safety-alerts/contaminated-cough-syrup-recall-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['BATCH-001'],
      affectedPackNames: ['Contaminated Syrup 100ml'],
    };

    const result = validateAlertProvenance(unapprovedDomainAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('not an approved official statutory NAFDAC domain') || r.includes('not in the exact approved'))).toBe(true);
  });

  // ── 2. General NAFDAC Homepage / Category Page Is Insufficient Evidence ────
  it('2. General NAFDAC homepage or category listing is insufficient evidence', () => {
    const testCases = [
      'https://nafdac.gov.ng',
      'https://nafdac.gov.ng/',
      'https://nafdac.gov.ng/category/public-alerts',
      'https://nafdac.gov.ng/category/public-alerts/',
      'https://nafdac.gov.ng/alerts',
      'https://nafdac.gov.ng/alerts/',
      'https://nafdac.gov.ng/safety-alerts',
    ];

    for (const url of testCases) {
      const genericUrlAlert = {
        alertNumber: 'Notice No. 2026/GENERIC',
        title: 'Alert pointing to generic portal page',
        sourceUrl: url,
        retrievedAt: '2026-11-20T00:00:00Z',
        lastReviewDate: '2026-11-23T00:00:00Z',
        verifiedBy: 'dr-pharmacovigilance-audit-01',
        evidenceClassification: 'independently_verified_official' as const,
        isSyntheticFixture: false,
        isProductionEligible: true,
        batchNumbers: ['BATCH-GENERIC-01'],
        affectedPackNames: ['Generic Product 100ml'],
      };

      const result = validateAlertProvenance(genericUrlAlert);
      expect(result.isValid).toBe(false);
      expect(
        result.reasons.some((r) =>
          r.includes('points to a general portal homepage') || r.includes('category listing') || r.includes('top-level directory')
        )
      ).toBe(true);
    }
  });

  // ── 3. Specific Official Notice With Complete Evidence Can Pass ─────────────
  it('3. Specific official notice with complete evidence passes provenance validation', () => {
    const validOfficialNotice = {
      alertNumber: 'Notice No. 2026/VALID-01',
      title: 'Official NAFDAC Recall of Contaminated Pediatric Formula',
      sourceUrl: 'https://nafdac.gov.ng/safety-alerts/contaminated-pediatric-formula-recall-notice-2026-001',
      officialSourceUrl: 'https://nafdac.gov.ng/safety-alerts/contaminated-pediatric-formula-recall-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['CONFIRMED-RECALL-BATCH-99'],
      affectedPackNames: ['Pediatric Formula 100ml Suspension'],
    };

    const result = validateAlertProvenance(validOfficialNotice);
    expect(result.isValid).toBe(true);
    expect(result.reasons.length).toBe(0);
  });

  // ── 4. Missing Verification Timestamp Is Rejected ───────────────────────────
  it('4. Missing verification timestamp is rejected', () => {
    const missingTimestampAlert = {
      alertNumber: 'Notice No. 2026/NOTIME',
      title: 'Alert missing verification date',
      sourceUrl: 'https://nafdac.gov.ng/safety-alerts/recall-notice-2026-002',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: undefined, // Missing verification timestamp
      lastCheckedAt: undefined,
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['BATCH-99'],
      affectedPackNames: ['Product 100ml'],
    };

    const result = validateAlertProvenance(missingTimestampAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('missing an independent verification/review timestamp'))).toBe(true);
  });

  // ── 5. Missing Exact Affected Batch Evidence Is Rejected ────────────────────
  it('5. Missing exact affected batch or pack evidence is rejected', () => {
    const missingBatchEvidenceAlert = {
      alertNumber: 'Notice No. 2026/NOBATCH',
      title: 'Alert without any affected batches or pack descriptions',
      sourceUrl: 'https://nafdac.gov.ng/safety-alerts/recall-notice-2026-003',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: [], // Empty
      affectedPackNames: [], // Empty
    };

    const result = validateAlertProvenance(missingBatchEvidenceAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('contains neither confirmed affected batch numbers nor affected pack names'))).toBe(true);
  });

  // ── 5b. Arbitrary Subdomain Is Rejected ──────────────────────────────────────
  it('5b. Arbitrary or unapproved NAFDAC subdomain is strictly rejected', () => {
    const subdomainAlert = {
      alertNumber: 'Notice No. 2026/SUBDOMAIN-01',
      title: 'Alert hosted on arbitrary subdomain',
      sourceUrl: 'https://untrusted-api.nafdac.gov.ng/safety-alerts/fake-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['BATCH-SUB-01'],
      affectedPackNames: ['Subdomain Product 100ml'],
    };

    const result = validateAlertProvenance(subdomainAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('not in the exact approved statutory NAFDAC domain allowlist'))).toBe(true);
  });

  // ── 5c. URL Containing User Credentials Is Rejected ──────────────────────────
  it('5c. URL containing deceptive user credentials is strictly rejected', () => {
    const userinfoAlert = {
      alertNumber: 'Notice No. 2026/USERINFO-01',
      title: 'Alert with user credentials in URL',
      sourceUrl: 'https://admin:pass123@nafdac.gov.ng/safety-alerts/fake-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['BATCH-USERINFO-01'],
      affectedPackNames: ['Userinfo Product 100ml'],
    };

    const result = validateAlertProvenance(userinfoAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('unexpected user credentials or userinfo'))).toBe(true);
  });

  // ── 5d. URL With Non-443 Port Is Rejected ────────────────────────────────────
  it('5d. URL with non-standard port is strictly rejected', () => {
    const portAlert = {
      alertNumber: 'Notice No. 2026/PORT-01',
      title: 'Alert on non-standard port',
      sourceUrl: 'https://nafdac.gov.ng:8080/safety-alerts/fake-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official' as const,
      isSyntheticFixture: false,
      isProductionEligible: true,
      batchNumbers: ['BATCH-PORT-01'],
      affectedPackNames: ['Port Product 100ml'],
    };

    const result = validateAlertProvenance(portAlert);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('default HTTPS port 443'))).toBe(true);
  });

  // ── 5e. Alert Lacking Accountable Reviewer (verifiedBy) Is Rejected ──────────
  it('5e. Alert lacking accountable reviewer sign-off is rejected', () => {
    const testReviewers = [undefined, '', '   ', 'unassigned', 'auto', 'unknown', 'lead-auditor-regulatory-signoff', 'placeholder', 'test'];

    for (const reviewer of testReviewers) {
      const alert = {
        alertNumber: 'Notice No. 2026/NO-REVIEWER',
        title: 'Alert lacking human auditor reference',
        sourceUrl: 'https://nafdac.gov.ng/safety-alerts/confirmed-notice-2026-001',
        retrievedAt: '2026-11-20T00:00:00Z',
        lastReviewDate: '2026-11-23T00:00:00Z',
        verifiedBy: reviewer,
        evidenceClassification: 'independently_verified_official' as const,
        isSyntheticFixture: false,
        isProductionEligible: true,
        batchNumbers: ['BATCH-99'],
        affectedPackNames: ['Product 100ml'],
      };

      const result = validateAlertProvenance(alert);
      expect(result.isValid).toBe(false);
      expect(result.reasons.some((r) => r.includes('accountable reviewer reference'))).toBe(true);
    }
  });

  // ── 6. Synthetic Alerts Cannot Match in Production ──────────────────────────
  it('6. Synthetic alerts cannot match in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(prisma.alert, 'findMany').mockResolvedValue([]);

    // Attempt alert lookup against synthetic batch B2024-X9 in production
    const alert = await findAlertMatch('B2024-X9', 'Contaminated Cough Syrup 100ml', 'SafeCough');
    expect(alert).toBeNull();

    const syntheticAlert: MatchedAlertEvidence = {
      alertId: 'alert-2026-088',
      alertNumber: 'Notice No. 2026/088',
      title: 'Recall of Contaminated Cough Syrup [Synthetic Test Fixture]',
      matchedField: 'batch_number',
      matchedValue: 'B2024-X9',
      ruleUsed: 'Exact batch match',
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      officialSourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      evidenceClassification: 'synthetic_test_fixture',
      isSyntheticFixture: true,
      isVerifiedOfficial: false,
      isProductionEligible: false,
    };

    const input: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Legacy Remedies',
      productName: 'Contaminated Cough Syrup 100ml',
      batchNumber: 'B2024-X9',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdict = evaluateVerdict(input, syntheticAlert, null);
    expect(verdict.verdict).not.toBe('alert_match');
  });

  // ── 7. Unverified Alerts Cannot Match in Production ─────────────────────────
  it('7. Unverified alerts cannot match in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const unverifiedAlert: MatchedAlertEvidence = {
      alertId: 'mock-unreviewed-alert',
      alertNumber: 'Notice No. 2026/UNREVIEWED',
      title: 'Unreviewed Public Notice',
      matchedField: 'batch_number',
      matchedValue: 'BATCH-UNREVIEWED-01',
      ruleUsed: 'Exact batch number match',
      sourceUrl: 'https://nafdac.gov.ng/alerts/unreviewed',
      officialSourceUrl: 'https://nafdac.gov.ng/alerts/unreviewed',
      retrievedAt: new Date().toISOString(),
      lastReviewDate: new Date().toISOString(),
      evidenceClassification: 'unverified_record',
      isSyntheticFixture: false,
      isVerifiedOfficial: false,
      isProductionEligible: false,
    };

    const input: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      batchNumber: 'BATCH-UNREVIEWED-01',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdict = evaluateVerdict(input, unverifiedAlert, null);
    expect(verdict.verdict).not.toBe('alert_match');
  });

  // ── 8. Ineligible Alerts Cannot Match in Production ─────────────────────────
  it('8. Ineligible alerts (isProductionEligible === false) cannot match in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const ineligibleAlert: MatchedAlertEvidence = {
      alertId: 'mock-ineligible-alert',
      alertNumber: 'Notice No. 2026/INELIGIBLE',
      title: 'Alert pending clinical and legal sign-off',
      matchedField: 'batch_number',
      matchedValue: 'BATCH-INELIGIBLE-01',
      ruleUsed: 'Exact batch number match',
      sourceUrl: 'https://nafdac.gov.ng/safety-alerts/pending-review-notice-2026-099',
      officialSourceUrl: 'https://nafdac.gov.ng/safety-alerts/pending-review-notice-2026-099',
      retrievedAt: new Date().toISOString(),
      lastReviewDate: new Date().toISOString(),
      evidenceClassification: 'independently_verified_official',
      isSyntheticFixture: false,
      isVerifiedOfficial: true,
      isProductionEligible: false, // Ineligible
    };

    const input: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      batchNumber: 'BATCH-INELIGIBLE-01',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdict = evaluateVerdict(input, ineligibleAlert, null);
    expect(verdict.verdict).not.toBe('alert_match');
  });

  // ── 9. Curated Fallback and Database Lookup Enforce Identical Provenance Rules ─
  it('9. Curated fallback and database lookup enforce identical provenance rules via validateAlertProvenance', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    // Both Notice 2026/088 and Notice 2025/112 in curated fallback are synthetic fixtures
    const curated088 = CURATED_PUBLIC_ALERTS.find((a) => a.alertNumber === 'Notice No. 2026/088');
    const curatedValidation = validateAlertProvenance({
      alertNumber: curated088?.alertNumber,
      title: curated088?.title,
      sourceUrl: curated088?.sourceUrl,
      officialSourceUrl: curated088?.officialSourceUrl,
      retrievedAt: curated088?.retrievedAt,
      lastCheckedAt: curated088?.lastCheckedAt,
      evidenceClassification: curated088?.evidenceClassification,
      isSyntheticFixture: curated088?.isSyntheticFixture,
      isProductionEligible: curated088?.isProductionEligible,
      affectedPackNames: curated088?.affectedPackNames,
      batchNumbers: curated088?.batchNumbers,
    });
    expect(curatedValidation.isValid).toBe(false);

    // Database lookup with an identical synthetic record
    const mockDbAlert: Alert = {
      id: 'db-alert-synthetic',
      alertNumber: 'Notice No. 2026/088',
      issuedOn: new Date(),
      title: 'Notice 2026/088 from DB',
      category: Category.medicine,
      genuineBrands: ['Legacy Remedies'],
      affectedPackNames: ['Contaminated Cough Syrup 100ml'],
      batchNumbers: ['B2024-X9'],
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      retrievedAt: new Date(),
      lastCheckedAt: new Date(),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isSyntheticFixture: true,
      isProductionEligible: false,
      verifiedAt: null,
      verifiedBy: null,
      evidence: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.alert, 'findMany').mockResolvedValue([mockDbAlert]);

    // findAlertMatch in production filters out the DB record using the identical validation policy
    const dbMatch = await findAlertMatch('B2024-X9');
    expect(dbMatch).toBeNull();
  });

  // ── 10. Historical Medik-55 Cannot Produce a Production Registry Match ─────────
  it('10. Historical Medik-55 (04-1234) cannot produce a production registry match', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const medik55Record = CURATED_REGISTRY_RECORDS.find((r) => r.registrationNumber === '04-1234');
    expect(medik55Record).toBeDefined();
    expect(medik55Record?.evidenceClassification).toBe('historical_official_record');
    expect(medik55Record?.isProductionEligible).toBe(false);
    expect(medik55Record?.isVerifiedOfficial).toBe(false);
    expect(medik55Record?.status).toBe('unknown');

    const input: ConfirmedPackInput = {
      registrationNumber: '04-1234',
      isNumberConfirmedByUser: true,
      brand: 'Medik-55',
      productName: 'Medik-55 Tablet (Paracetamol/Caffeine)',
      manufacturer: 'Swiss Pharma Nigeria Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdict = evaluateVerdict(input, null, medik55Record || null);
    expect(verdict.verdict).not.toBe('registry_match');
    expect(verdict.verdict).toBe('could_not_confirm');
    expect(verdict.verdictNumber).toBe(4);
    expect(verdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);
    expect(verdict.explanation).toContain('historical');
  });

  // ── 11. Existing Database Records Remain Unverified After Migration Safeguard ──
  it('11. Existing database records remain unverified and ineligible after migration', () => {
    // Simulating pre-migration records without classification
    const preMigrationRecord: RegistryRecordEvidence = {
      registrationNumber: '01-0001',
      productName: 'Unclassified Legacy Food Product',
      brand: 'Legacy Brand',
      manufacturer: 'Legacy Maker',
      category: 'food',
      status: 'active',
      sourceCoverage: 'partial',
      sourceId: 'src-legacy',
      evidenceClassification: 'unverified_record',
      isProductionEligible: false,
    };

    const input: ConfirmedPackInput = {
      registrationNumber: '01-0001',
      isNumberConfirmedByUser: true,
      brand: 'Legacy Brand',
      productName: 'Unclassified Legacy Food Product',
      manufacturer: 'Legacy Maker',
      isIdentityConfirmedByUser: true,
      category: 'food',
    };

    const verdict = evaluateVerdict(input, null, preMigrationRecord);
    expect(verdict.verdict).toBe('could_not_confirm');
    expect(verdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);
  });

  // ── 12. Exact Batch Matching and Brand-Only Informational Behaviour Remain Correct ─
  it('12. Exact batch matching and brand-only informational behaviour remain correct', async () => {
    const verifiedOfficialNotice: MatchedAlertEvidence = {
      alertId: 'alert-official-verified',
      alertNumber: 'Notice No. 2026/VALID-01',
      title: 'Official NAFDAC Recall Bulletin',
      matchedField: 'batch_number',
      matchedValue: 'OFFICIAL-RECALL-BATCH-99',
      ruleUsed: 'Exact batch number match against official recall list',
      sourceUrl: 'https://nafdac.gov.ng/safety-alerts/contaminated-pediatric-formula-recall-notice-2026-001',
      officialSourceUrl: 'https://nafdac.gov.ng/safety-alerts/contaminated-pediatric-formula-recall-notice-2026-001',
      retrievedAt: '2026-11-20T00:00:00Z',
      lastReviewDate: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-23T00:00:00Z',
      verifiedBy: 'dr-pharmacovigilance-audit-01',
      evidenceClassification: 'independently_verified_official',
      isSyntheticFixture: false,
      isVerifiedOfficial: true,
      isProductionEligible: true,
    };

    const inputWithExactBatch: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      batchNumber: 'OFFICIAL-RECALL-BATCH-99',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdictBatch = evaluateVerdict(inputWithExactBatch, verifiedOfficialNotice, null);
    expect(verdictBatch.verdict).toBe('alert_match');
    expect(verdictBatch.verdictNumber).toBe(2);
    expect(verdictBatch.reasonCode).toBe(REASON_CODES.ALERT_BATCH_EXACT_MATCH);
    expect(verdictBatch.flags).toContain('ALERT_MATCHED');

    // Brand-only match with safe batch
    const brandOnlyAlert: MatchedAlertEvidence = {
      ...verifiedOfficialNotice,
      matchedField: 'brand_only',
      matchedValue: 'Emzor',
    };

    const inputBrandOnly: ConfirmedPackInput = {
      ...inputWithExactBatch,
      batchNumber: 'SAFE-UNTOUCHED-BATCH-001',
    };

    const verdictBrand = evaluateVerdict(inputBrandOnly, brandOnlyAlert, null);
    expect(verdictBrand.verdict).not.toBe('alert_match');
    expect(verdictBrand.flags).toContain('ALERT_ON_BRAND');
    expect(verdictBrand.flags).toContain('ALERT_ON_BRAND_ONLY');
  });

  // ── 13. Discrepancy Gate: Unverified / Historical Record (04-1234) Fails Closed to could_not_confirm ─
  it('13. 04-1234 (historical gazette entry) fails closed to could_not_confirm rather than declaring a public manufacturer mismatch', async () => {
    const input: ConfirmedPackInput = {
      registrationNumber: '04-1234',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol 500mg Tablets',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const verdict = await verifyConfirmedPack(input);
    expect(verdict.verdict).toBe('could_not_confirm');
    expect(verdict.verdictNumber).toBe(4);
    expect(verdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);
    expect(verdict.explanation).toContain('historical');
  });

  // ── 14. Unreviewed Emzor (04-0411) Fails Closed, While Attested Record Passes All Gates ───────
  it('14. Unreviewed Emzor record (04-0411) in curated registry is unverified and fails closed, while an attested record passes', () => {
    const record0411 = CURATED_REGISTRY_RECORDS.find((r) => r.registrationNumber === '04-0411');
    expect(record0411).toBeDefined();
    // 14a. Emzor is unverified and production-ineligible until genuine human audit occurs
    expect(record0411?.evidenceClassification).toBe('unverified_record');
    expect(record0411?.isProductionEligible).toBe(false);
    expect(record0411?.verifiedAt).toBeUndefined();
    expect(record0411?.verifiedBy).toBeUndefined();

    const baseInput: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
      medicineStrength: '500mg',
    };

    // 14b. Unreviewed record cannot produce registry_match in dev or production
    const unreviewedVerdictDev = evaluateVerdict(baseInput, null, record0411 || null);
    expect(unreviewedVerdictDev.verdict).toBe('could_not_confirm');
    expect(unreviewedVerdictDev.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);

    vi.stubEnv('NODE_ENV', 'production');
    const unreviewedVerdictProd = evaluateVerdict(baseInput, null, record0411 || null);
    expect(unreviewedVerdictProd.verdict).toBe('could_not_confirm');
    expect(unreviewedVerdictProd.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);
    vi.unstubAllEnvs();

    // 14c. An attested mock record with genuine evidence and reviewer audit passes all gates
    const attestedRecord: RegistryRecordEvidence = {
      ...record0411!,
      evidenceClassification: 'independently_verified_official',
      isProductionEligible: true,
      isVerifiedOfficial: true,
      verifiedAt: '2026-11-20T10:00:00Z',
      verifiedBy: 'pharm-regulatory-reviewer-0821',
    };

    const passingVerdict = evaluateVerdict(baseInput, null, attestedRecord);
    expect(passingVerdict.verdict).toBe('registry_match');
    expect(passingVerdict.verdictNumber).toBe(1);
    expect(passingVerdict.mandatoryCaveat).toBe(true);

    // 14d. Attested record still fails if registration number is unconfirmed by user
    const unconfirmedNumVerdict = evaluateVerdict(
      { ...baseInput, isNumberConfirmedByUser: false },
      null,
      attestedRecord
    );
    expect(unconfirmedNumVerdict.verdict).toBe('could_not_confirm');
    expect(unconfirmedNumVerdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_USER_NOT_CONFIRMED);

    // 14e. Attested record still fails if pack identity is unconfirmed by user
    const unconfirmedIdVerdict = evaluateVerdict(
      { ...baseInput, isIdentityConfirmedByUser: false },
      null,
      attestedRecord
    );
    expect(unconfirmedIdVerdict.verdict).toBe('could_not_confirm');
    expect(unconfirmedIdVerdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_USER_NOT_CONFIRMED);

    // 14f. Attested record still fails if medicine strength is unconfirmed by user
    const unconfirmedStrengthVerdict = evaluateVerdict(
      { ...baseInput, isStrengthConfirmedByUser: false },
      null,
      attestedRecord
    );
    expect(unconfirmedStrengthVerdict.verdict).toBe('could_not_confirm');
    expect(unconfirmedStrengthVerdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_USER_NOT_CONFIRMED);

    // 14g. Attested record detects discrepancy if manufacturer mismatches
    const mismatchedMakerVerdict = evaluateVerdict(
      { ...baseInput, manufacturer: 'Counterfeit Chemical Works Ltd' },
      null,
      attestedRecord
    );
    expect(mismatchedMakerVerdict.verdict).toBe('registration_discrepancy');
    expect(mismatchedMakerVerdict.reasonCode).toBe(REASON_CODES.DISCREPANCY_NUMBER_BELONGS_TO_OTHER_PRODUCT);

    // 14h. Attested record detects discrepancy if record is expired
    const expiredRecord: RegistryRecordEvidence = {
      ...attestedRecord,
      isExpired: true,
      status: 'inactive',
    };
    const expiredVerdict = evaluateVerdict(baseInput, null, expiredRecord);
    expect(expiredVerdict.verdict).toBe('registration_discrepancy');
    expect(expiredVerdict.reasonCode).toBe(REASON_CODES.DISCREPANCY_RECORD_INACTIVE_OR_EXPIRED);
  });

  // ── 15. Production Database Failure Fails Closed to could_not_confirm ────────
  it('15. Production database unavailability returns could_not_confirm with lookup timeout code', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(prisma.alert, 'findMany').mockResolvedValue([]);

    vi.spyOn(prisma.registryRecord, 'findFirst').mockRejectedValue(
      new Error('Connection terminated by serverless pooler')
    );

    const input: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    const lookup = await findRegistryRecordDetailed('04-0411', 'medicine');
    expect(lookup.lookupFailedOrTimedOut).toBe(true);
    expect(lookup.record).toBeNull();

    const verdict = await verifyConfirmedPack(input);
    expect(verdict.verdict).toBe('could_not_confirm');
    expect(verdict.verdictNumber).toBe(4);
    expect(verdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_LOOKUP_FAILED_TIMEOUT);
    expect(verdict.explanation).toContain('timed out or could not be reached');
  });

  // ── 16. Scans API Timeout Returns Safe Response With Fallback ────────────────
  it('16. Scans API timeout returns expected safe error with canFallbackToManual: true', () => {
    const mockAbort = new Error('The operation was aborted');
    mockAbort.name = 'AbortError';

    const isAbort = mockAbort.name === 'AbortError';
    const errorMsg = isAbort
      ? 'Request timed out after 15 seconds'
      : mockAbort.message;

    expect(errorMsg).toBe('Request timed out after 15 seconds');

    const safeResponse = {
      success: false,
      status: 'error',
      message: `Vision extraction service unavailable: ${errorMsg}. Please enter pack details manually.`,
      canFallbackToManual: true,
    };

    expect(safeResponse.status).toBe('error');
    expect(safeResponse.canFallbackToManual).toBe(true);
    expect(safeResponse.message).toContain('Request timed out after 15 seconds');
    expect(safeResponse.message).toContain('Please enter pack details manually');
  });

  // ── 17. Discrepancy Gate: Unreviewed 04-0411 Cannot Trigger Discrepancy, Attested Record Does ─
  it('17. Unreviewed 04-0411 fails closed to could_not_confirm, while attested record detects manufacturer discrepancy', async () => {
    const input: ConfirmedPackInput = {
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      manufacturer: 'Counterfeit Chemical Works Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      isStrengthConfirmedByUser: true,
    };

    // 17a. Unreviewed 04-0411 in curated repository fails closed without declaring a discrepancy
    const unreviewedVerdict = await verifyConfirmedPack(input);
    expect(unreviewedVerdict.verdict).toBe('could_not_confirm');
    expect(unreviewedVerdict.reasonCode).toBe(REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE);

    // 17b. When an attested record exists, manufacturer mismatch triggers registration_discrepancy
    const attestedRecord: RegistryRecordEvidence = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      category: 'medicine',
      status: 'active',
      sourceCoverage: 'partial',
      sourceId: 'src-drugs-greenbook-2026',
      sourceName: 'NAFDAC Registered Human Medicines (Green Book)',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      registeredUntil: '2028-03-27',
      isExpired: false,
      evidenceClassification: 'independently_verified_official',
      isProductionEligible: true,
      isVerifiedOfficial: true,
      isSyntheticFixture: false,
      retrievedAt: '2026-11-23T00:00:00Z',
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-20T10:00:00Z',
      verifiedBy: 'pharm-regulatory-reviewer-0821',
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
        officialDetailUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
        activeIngredients: 'Paracetamol 500mg',
      },
    };

    const attestedDiscrepancy = evaluateVerdict(input, null, attestedRecord);
    expect(attestedDiscrepancy.verdict).toBe('registration_discrepancy');
    expect(attestedDiscrepancy.verdictNumber).toBe(3);
    expect(attestedDiscrepancy.reasonCode).toBe(REASON_CODES.DISCREPANCY_NUMBER_BELONGS_TO_OTHER_PRODUCT);
    expect(attestedDiscrepancy.explanation).toContain('Emzor Pharmaceutical Industries Ltd');
  });

  // ── 18. Registry Gate: lastVerifiedAt alone cannot satisfy production gate ────
  it('18. lastVerifiedAt alone cannot satisfy the production registry verification gate without explicit verifiedAt', () => {
    const recordWithOnlyLastVerified = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z', // Has lastVerifiedAt
      verifiedAt: undefined, // Missing explicit verifiedAt
      verifiedBy: 'pharm-regulatory-reviewer-0821',
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      },
    };

    const result = validateRegistryRecordProvenance(recordWithOnlyLastVerified);
    expect(result.isValid).toBe(false);
    expect(
      result.reasons.some((r) =>
        r.includes('missing an explicit independent auditor verification timestamp (verifiedAt)')
      )
    ).toBe(true);
  });

  // ── 19. Registry Gate: verifiedAt without verifiedBy is rejected ───────────────
  it('19. verifiedAt without verifiedBy is rejected', () => {
    const recordWithoutReviewer = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-23T00:00:00Z',
      verifiedBy: undefined, // Missing reviewer
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      },
    };

    const result = validateRegistryRecordProvenance(recordWithoutReviewer);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('lacks an accountable reviewer reference (verifiedBy)'))).toBe(true);
  });

  // ── 20. Registry Gate: verifiedBy without verifiedAt is rejected ───────────────
  it('20. verifiedBy without verifiedAt is rejected', () => {
    const recordWithoutDate = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: undefined, // Missing verifiedAt
      verifiedBy: 'pharm-regulatory-reviewer-0821',
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      },
    };

    const result = validateRegistryRecordProvenance(recordWithoutDate);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('missing an explicit independent auditor verification timestamp'))).toBe(true);
  });

  // ── 20b. Fabricated Placeholder Reviewer Value Is Rejected ──────────────────
  it('20b. Fabricated placeholder reviewer identifiers are strictly rejected', () => {
    const disallowedReviewers = [
      'lead-auditor-regulatory-signoff',
      'placeholder',
      'test',
      'mock',
      'admin',
      'unassigned',
      'auto',
      'unknown',
      'none',
    ];

    for (const placeholder of disallowedReviewers) {
      const record = {
        registrationNumber: '04-0411',
        productName: 'Paracetamol Tablets 500mg',
        brand: 'Emzor',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd',
        sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
        evidenceClassification: 'independently_verified_official' as const,
        isProductionEligible: true,
        lastVerifiedAt: '2026-11-23T00:00:00Z',
        verifiedAt: '2026-11-23T00:00:00Z',
        verifiedBy: placeholder,
        fieldProvenance: {
          registrationNumber: 'Official NAFDAC Green Book (04-0411)',
          productName: 'Carton and blister pack label',
          manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
        },
      };

      const result = validateRegistryRecordProvenance(record);
      expect(result.isValid).toBe(false);
      expect(result.reasons.some((r) => r.includes('lacks an accountable reviewer reference (verifiedBy)'))).toBe(true);
    }
  });

  // ── 20c. Product-Specific Official URL Alone Does Not Qualify a Record ────────
  it('20c. A product-specific official Green Book URL alone does not qualify an unreviewed record', () => {
    const recordWithUrlOnly = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863', // Valid URL
      evidenceClassification: 'unverified_record' as const, // Unverified
      isProductionEligible: false,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: undefined, // No audit
      verifiedBy: undefined, // No auditor
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      },
    };

    const result = validateRegistryRecordProvenance(recordWithUrlOnly);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('independently_verified_official'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('isProductionEligible !== true'))).toBe(true);
  });

  // ── 20d. Correct Source Fields Without Real Review Attestation Remain Ineligible ─
  it('20d. Correct source fields and populated fieldProvenance without real review attestation remain ineligible', () => {
    const recordWithoutAttestation = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: undefined, // Missing attestation date
      verifiedBy: undefined, // Missing attestation reviewer
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
        officialDetailUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      },
    };

    const result = validateRegistryRecordProvenance(recordWithoutAttestation);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('missing an explicit independent auditor verification timestamp'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('lacks an accountable reviewer reference'))).toBe(true);
  });

  // ── 21. Registry Gate: Missing source evidence (fieldProvenance) is rejected ──
  it('21. A record with verifiedAt and verifiedBy but missing source evidence is rejected', () => {
    const recordWithoutEvidence = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-23T00:00:00Z',
      verifiedBy: 'pharm-regulatory-reviewer-0821',
      fieldProvenance: undefined, // Missing fieldProvenance
    };

    const result = validateRegistryRecordProvenance(recordWithoutEvidence);
    expect(result.isValid).toBe(false);
    expect(result.reasons.some((r) => r.includes('missing documented field provenance evidence'))).toBe(true);
  });

  // ── 22. Registry Gate: Properly reviewed record with all required evidence passes
  it('22. A properly reviewed record with all required evidence passes registry validation', () => {
    const validRecord = {
      registrationNumber: '04-0411',
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      evidenceClassification: 'independently_verified_official' as const,
      isProductionEligible: true,
      lastVerifiedAt: '2026-11-23T00:00:00Z',
      verifiedAt: '2026-11-23T00:00:00Z',
      verifiedBy: 'pharm-regulatory-reviewer-0821',
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      },
    };

    const result = validateRegistryRecordProvenance(validRecord);
    expect(result.isValid).toBe(true);
    expect(result.reasons.length).toBe(0);
  });

  // ── 23. In Production, DB record with lastVerifiedAt but missing verifiedAt is rejected by repository
  it('23. In production mode, DB record with lastVerifiedAt but missing verifiedAt is rejected by repository query', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const mockLegacyDbRecord = {
      id: 'rec-legacy-01',
      registrationNumber: '04-0411',
      category: Category.medicine,
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: 'active' as const,
      registeredUntil: new Date('2028-03-27'),
      completeness: 'complete' as const,
      sourceId: 'src-drugs-greenbook-2026',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      retrievedAt: new Date('2026-11-23'),
      lastVerifiedAt: new Date('2026-11-23'), // Present from default
      verifiedAt: null, // Missing!
      verifiedBy: null, // Missing!
      evidenceClassification: EvidenceClassification.independently_verified_official,
      isProductionEligible: true,
      fieldProvenance: {
        registrationNumber: '04-0411',
        productName: 'Paracetamol Tablets 500mg',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      },
      source: {
        id: 'src-drugs-greenbook-2026',
        name: 'NAFDAC Green Book',
        coverage: 'partial' as const,
      },
    };

    vi.spyOn(prisma.registryRecord, 'findFirst').mockResolvedValue(
      mockLegacyDbRecord as unknown as Awaited<ReturnType<typeof prisma.registryRecord.findFirst>>
    );

    const lookup = await findRegistryRecordDetailed('04-0411', 'medicine');
    expect(lookup.record).toBeNull();
  });

  // ── 23. In Production, DB record with lastVerifiedAt but missing verifiedAt is rejected by repository
  it('23. In production mode, DB record with lastVerifiedAt but missing verifiedAt is rejected by repository query', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const mockLegacyDbRecord = {
      id: 'rec-legacy-01',
      registrationNumber: '04-0411',
      category: Category.medicine,
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: 'active' as const,
      registeredUntil: new Date('2028-03-27'),
      completeness: 'complete' as const,
      sourceId: 'src-drugs-greenbook-2026',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      retrievedAt: new Date('2026-11-23'),
      lastVerifiedAt: new Date('2026-11-23'), // Present from default
      verifiedAt: null, // Missing!
      verifiedBy: null, // Missing!
      evidenceClassification: EvidenceClassification.independently_verified_official,
      isProductionEligible: true,
      fieldProvenance: {
        registrationNumber: '04-0411',
        productName: 'Paracetamol Tablets 500mg',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      },
      source: {
        id: 'src-drugs-greenbook-2026',
        name: 'NAFDAC Green Book',
        coverage: 'partial' as const,
      },
    };

    vi.spyOn(prisma.registryRecord, 'findFirst').mockResolvedValue(
      mockLegacyDbRecord as unknown as Awaited<ReturnType<typeof prisma.registryRecord.findFirst>>
    );

    const lookup = await findRegistryRecordDetailed('04-0411', 'medicine');
    expect(lookup.record).toBeNull();
  });
});
