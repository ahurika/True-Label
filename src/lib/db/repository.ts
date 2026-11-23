import { prisma, isDatabaseConfigured } from './index';
import {
  ConfirmedPackInput,
  evaluateVerdict,
  MatchedAlertEvidence,
  ProductCategory,
  RegistryRecordEvidence,
  VerdictEngineResult,
  normalizeRegistrationNumber,
  normalizeText,
  EvidenceClassification,
  validateAlertProvenance,
  validateRegistryRecordProvenance,
} from '@/domain/verdict/verdict-engine';

/**
 * Curated Official NAFDAC Reference Sources
 * PRD v3.1 Section 8 & 16: Strict field-level provenance
 */
export const CURATED_REGISTRY_SOURCES = [
  {
    id: 'src-food-gazette-2026',
    name: 'NAFDAC Registered Food Products Gazette',
    category: 'food' as ProductCategory,
    coverage: 'partial' as const,
    coverageEvidence: 'Official gazette of registered packaged foods, compiled from NAFDAC public portal (curated snapshot).',
    lookupMethod: 'curated_index',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
    lastCheckedAt: new Date('2026-10-15T00:00:00Z'),
  },
  {
    id: 'src-drugs-greenbook-2026',
    name: 'NAFDAC Registered Human Medicines (Green Book)',
    category: 'medicine' as ProductCategory,
    coverage: 'partial' as const,
    coverageEvidence: 'Official database of registered human pharmaceutical products verified against NAFDAC Green Book portal.',
    lookupMethod: 'greenbook_search',
    sourceUrl: 'https://greenbook.nafdac.gov.ng/',
    lastCheckedAt: new Date('2026-11-23T00:00:00Z'),
  },
  {
    id: 'src-drugs-gazette-2026',
    name: 'NAFDAC Registered Human Medicines and Medical Devices',
    category: 'medicine' as ProductCategory,
    coverage: 'partial' as const,
    coverageEvidence: 'Official gazette of registered pharmaceutical products, verified against NAFDAC drug databases.',
    lookupMethod: 'curated_index',
    sourceUrl: 'https://nafdac.gov.ng/drug-registry',
    lastCheckedAt: new Date('2026-10-20T00:00:00Z'),
  },
  {
    id: 'src-alerts-index-2026',
    name: 'NAFDAC Public Safety Alerts & Recalls Index',
    category: 'other' as ProductCategory,
    coverage: 'complete' as const,
    coverageEvidence: 'Continuous index of official NAFDAC public warnings and recall notices published on nafdac.gov.ng.',
    lookupMethod: 'alert_index',
    sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
    lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
  },
];

/**
 * Curated Statutory Records from Published NAFDAC Gazettes & Green Book
 * PRD v3.1 Section 8: Field-level provenance, evidence classification and coverage semantics
 */
export const CURATED_REGISTRY_RECORDS: RegistryRecordEvidence[] = [
  // ── Official Reference Records Awaiting Review (Unreviewed) ─
  // Preserves genuine Green Book product details (details/5863), but classified as unverified_record
  // and isProductionEligible: false because no authenticated human review or independent audit event
  // has taken place. Cannot produce registry_match or ground a discrepancy accusation.
  {
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
    registeredUntil: '2028-03-27', // Green Book official registration validity
    isExpired: false,
    evidenceClassification: 'unverified_record',
    isProductionEligible: false,
    isVerifiedOfficial: false,
    isSyntheticFixture: false,
    retrievedAt: '2026-11-23T00:00:00Z',
    lastVerifiedAt: '2026-11-23T00:00:00Z',
    verifiedAt: undefined,
    verifiedBy: undefined,
    fieldProvenance: {
      registrationNumber: 'Official NAFDAC Green Book (04-0411)',
      productName: 'Carton and blister pack label',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
      officialDetailUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      activeIngredients: 'Paracetamol 500mg',
      reviewStatus: 'Unreviewed: Pending internal regulatory review and independent auditor attestation',
    },
  },
  {
    registrationNumber: '04-1234',
    productName: 'Medik-55 Tablet (Paracetamol/Caffeine)',
    brand: 'Medik-55',
    manufacturer: 'Swiss Pharma Nigeria Ltd',
    category: 'medicine',
    status: 'unknown',
    sourceCoverage: 'partial',
    sourceId: 'src-drugs-gazette-2026',
    sourceName: 'NAFDAC Registered Human Medicines and Medical Devices (Historical Gazette)',
    sourceUrl: 'https://nafdac.gov.ng/drug-registry',
    registeredUntil: undefined,
    isExpired: false,
    evidenceClassification: 'historical_official_record',
    isProductionEligible: false,
    isVerifiedOfficial: false,
    isSyntheticFixture: false,
    retrievedAt: '2026-10-20T00:00:00Z',
    lastVerifiedAt: '2026-10-20T00:00:00Z',
    fieldProvenance: {
      registrationNumber: 'Historical NAFDAC Drug Gazette (No live Green Book product-level detail page)',
      productName: 'Historical gazette publication',
      manufacturer: 'Swiss Pharma Nigeria Ltd',
      disclaimer: 'Historical gazette entry. Current registration status is unverified without live Green Book product detail confirmation. Ineligible for production positive match.',
    },
  },

  // ── Synthetic Test Fixtures (Class 3 - Development and Testing Only) ──
  {
    registrationNumber: '01-0812',
    productName: 'Semovita 1kg Pack',
    brand: 'Golden Penny',
    manufacturer: 'Flour Mills of Nigeria Plc',
    category: 'food',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-food-gazette-2026',
    sourceName: 'NAFDAC Registered Food Products Gazette',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
    registeredUntil: '2028-12-31',
    isExpired: false,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
  {
    registrationNumber: 'A0-1234',
    productName: 'Semovita (Fortified Wheat Flour)',
    brand: 'Golden Penny',
    manufacturer: 'Flour Mills of Nigeria Plc',
    category: 'food',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-food-gazette-2026',
    sourceName: 'NAFDAC Registered Food Products Gazette',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
    registeredUntil: '2027-06-30',
    isExpired: false,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
  {
    registrationNumber: '04-5678',
    productName: 'Amoxicillin 500mg Capsules',
    brand: 'Beecham',
    manufacturer: 'GlaxoSmithKline Nigeria Plc',
    category: 'medicine',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-drugs-gazette-2026',
    sourceName: 'NAFDAC Registered Human Medicines and Medical Devices',
    sourceUrl: 'https://nafdac.gov.ng/drug-registry',
    registeredUntil: '2027-11-20',
    isExpired: false,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
  {
    registrationNumber: '01-0023',
    productName: 'Full Cream Evaporated Milk',
    brand: 'Peak',
    manufacturer: 'FrieslandCampina WAMCO Nigeria PLC',
    category: 'food',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-food-gazette-2026',
    sourceName: 'NAFDAC Registered Food Products Gazette',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
    registeredUntil: '2028-04-10',
    isExpired: false,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
  {
    registrationNumber: '02-4411',
    productName: 'Tomato Paste 70g Sachet',
    brand: 'Gino',
    manufacturer: 'Watanmal Group Nigeria Ltd',
    category: 'food',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-food-gazette-2026',
    sourceName: 'NAFDAC Registered Food Products Gazette',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
    registeredUntil: '2027-09-01',
    isExpired: false,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
  {
    registrationNumber: '04-9999',
    productName: 'Withdrawn Cold Relief Syrup',
    brand: 'Legacy Remedies',
    manufacturer: 'Defunct Laboratories Nigeria',
    category: 'medicine',
    status: 'inactive',
    sourceCoverage: 'partial',
    sourceId: 'src-drugs-gazette-2026',
    sourceName: 'NAFDAC Registered Human Medicines and Medical Devices',
    sourceUrl: 'https://nafdac.gov.ng/drug-registry',
    registeredUntil: '2022-01-01',
    isExpired: true,
    evidenceClassification: 'synthetic_test_fixture',
    isProductionEligible: false,
    isSyntheticFixture: true,
    isVerifiedOfficial: false,
  },
];

export interface CuratedAlertDefinition {
  id: string;
  alertNumber: string;
  title: string;
  issuedOn: Date;
  category: ProductCategory;
  genuineBrands: string[];
  affectedPackNames: string[];
  batchNumbers: string[];
  sourceUrl: string;
  officialSourceUrl: string;
  retrievedAt: Date;
  lastCheckedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  evidenceClassification: EvidenceClassification;
  isVerifiedOfficial: boolean;
  isSyntheticFixture: boolean;
  isProductionEligible?: boolean;
  evidence?: Record<string, string>;
}

/**
 * Curated Public Alerts for Development and Test Harnesses.
 * Notice 2026/088 and Notice 2025/112 are synthetic test fixtures with prototype batch numbers
 * (B2024-X9, CS-2024-001, SYR-9981, EMZ-9988, EP-9988-X). They are ineligible for production matching.
 */
export const CURATED_PUBLIC_ALERTS: CuratedAlertDefinition[] = [
  {
    id: 'alert-2026-088',
    alertNumber: 'Notice No. 2026/088',
    title: 'NAFDAC Alert No. 2026/088: Recall of Contaminated Cough Syrup [Synthetic Test Fixture]',
    issuedOn: new Date('2026-09-10T00:00:00Z'),
    category: 'medicine',
    genuineBrands: ['Legacy Remedies', 'SafeCough'],
    affectedPackNames: [
      'Contaminated Cough Syrup 100ml',
      'Toxic Cough Mixture 100ml',
    ],
    batchNumbers: ['B2024-X9', 'CS-2024-001', 'SYR-9981'],
    sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
    officialSourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
    retrievedAt: new Date('2026-09-11T00:00:00Z'),
    lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
    evidenceClassification: 'synthetic_test_fixture',
    isVerifiedOfficial: false,
    isSyntheticFixture: true,
    isProductionEligible: false,
    evidence: {
      laboratoryFinding: 'Diethylene glycol contamination above permissible limit',
      disclaimer: 'Synthetic test fixture for test harnesses only. Not an official NAFDAC notice.',
    },
  },
  {
    id: 'alert-2025-112',
    alertNumber: 'Notice No. 2025/112',
    title: 'NAFDAC Alert No. 2025/112: Substandard Paracetamol Batch Alert [Synthetic Test Fixture]',
    issuedOn: new Date('2025-11-04T00:00:00Z'),
    category: 'medicine',
    genuineBrands: ['Emzor'],
    affectedPackNames: ['Emzor Paracetamol Batch EMZ-9988'],
    batchNumbers: ['EMZ-9988', 'EP-9988-X'],
    sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
    officialSourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
    retrievedAt: new Date('2025-11-05T00:00:00Z'),
    lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
    evidenceClassification: 'synthetic_test_fixture',
    isVerifiedOfficial: false,
    isSyntheticFixture: true,
    isProductionEligible: false,
    evidence: {
      laboratoryFinding: 'Dissolution failure observed in specific batch',
      disclaimer: 'Synthetic test fixture for test harnesses only. Not an official NAFDAC notice.',
    },
  },
];

export interface RegistryLookupResult {
  record: RegistryRecordEvidence | null;
  lookupFailedOrTimedOut: boolean;
}

/**
 * Finds a registry record with explicit lookup status.
 * Enforces production fail-closed behavior:
 * - In production: Database lookup only. In-memory fixtures are strictly excluded.
 *   If the database is unavailable or query fails, returns lookupFailedOrTimedOut: true.
 * - In dev/test: Falls back to curated records for local testing and isolated harnesses.
 */
export async function findRegistryRecordDetailed(
  registrationNumber: string,
  category?: ProductCategory
): Promise<RegistryLookupResult> {
  const normInputNo = normalizeRegistrationNumber(registrationNumber);
  if (!normInputNo) return { record: null, lookupFailedOrTimedOut: false };

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Production Mode: Strict Database Verification & Fail-Closed Behavior
  if (isProduction) {
    if (!isDatabaseConfigured()) {
      console.warn('[Repository] Production database is not configured. Failing closed to unconfirmed.');
      return { record: null, lookupFailedOrTimedOut: true };
    }

    try {
      const dbRecord = await prisma.registryRecord.findFirst({
        where: {
          registrationNumber: {
            equals: registrationNumber,
            mode: 'insensitive',
          },
          ...(category && category !== 'other' && { category }),
        },
        include: {
          source: true,
        },
      });

      if (!dbRecord) {
        return { record: null, lookupFailedOrTimedOut: false };
      }

      // Verify production eligibility and evidence classification at database level
      const provenanceValidation = validateRegistryRecordProvenance({
        registrationNumber: dbRecord.registrationNumber,
        productName: dbRecord.productName,
        brand: dbRecord.brand || undefined,
        manufacturer: dbRecord.manufacturer || undefined,
        sourceUrl: dbRecord.sourceUrl,
        evidenceClassification: dbRecord.evidenceClassification as EvidenceClassification,
        isProductionEligible: dbRecord.isProductionEligible,
        verifiedAt: dbRecord.verifiedAt,
        verifiedBy: dbRecord.verifiedBy,
        lastVerifiedAt: dbRecord.lastVerifiedAt,
        fieldProvenance: dbRecord.fieldProvenance as Record<string, string>,
      });

      if (!provenanceValidation.isValid) {
        console.warn(
          `[Repository] Record ${registrationNumber} found in DB but is not production eligible:`,
          provenanceValidation.reasons
        );
        return { record: null, lookupFailedOrTimedOut: false };
      }

      const isExpired = dbRecord.registeredUntil
        ? new Date(dbRecord.registeredUntil) < new Date()
        : dbRecord.status === 'inactive';

      return {
        record: {
          registrationNumber: dbRecord.registrationNumber,
          productName: dbRecord.productName,
          brand: dbRecord.brand || undefined,
          manufacturer: dbRecord.manufacturer || undefined,
          category: dbRecord.category as ProductCategory,
          status: dbRecord.status as 'active' | 'inactive' | 'unknown',
          sourceCoverage: dbRecord.source.coverage as 'complete' | 'partial' | 'none',
          sourceId: dbRecord.sourceId,
          sourceName: dbRecord.source.name,
          sourceUrl: dbRecord.sourceUrl,
          registeredUntil: dbRecord.registeredUntil?.toISOString(),
          isExpired,
          evidenceClassification: dbRecord.evidenceClassification as EvidenceClassification,
          isProductionEligible: dbRecord.isProductionEligible,
          isVerifiedOfficial: true,
          isSyntheticFixture: false,
          retrievedAt: dbRecord.retrievedAt?.toISOString(),
          lastVerifiedAt: dbRecord.lastVerifiedAt?.toISOString(),
          verifiedAt: dbRecord.verifiedAt?.toISOString(),
          verifiedBy: dbRecord.verifiedBy || undefined,
          fieldProvenance: dbRecord.fieldProvenance as Record<string, string>,
        },
        lookupFailedOrTimedOut: false,
      };
    } catch (error) {
      console.warn('[Repository] Production database query failed. Failing closed to unconfirmed:', error);
      return { record: null, lookupFailedOrTimedOut: true };
    }
  }

  // 2. Non-Production Mode (Development & Testing)
  if (isDatabaseConfigured()) {
    try {
      const dbRecord = await prisma.registryRecord.findFirst({
        where: {
          registrationNumber: {
            equals: registrationNumber,
            mode: 'insensitive',
          },
          ...(category && category !== 'other' && { category }),
        },
        include: {
          source: true,
        },
      });

      if (dbRecord) {
        const isExpired = dbRecord.registeredUntil
          ? new Date(dbRecord.registeredUntil) < new Date()
          : dbRecord.status === 'inactive';

        return {
          record: {
            registrationNumber: dbRecord.registrationNumber,
            productName: dbRecord.productName,
            brand: dbRecord.brand || undefined,
            manufacturer: dbRecord.manufacturer || undefined,
            category: dbRecord.category as ProductCategory,
            status: dbRecord.status as 'active' | 'inactive' | 'unknown',
            sourceCoverage: dbRecord.source.coverage as 'complete' | 'partial' | 'none',
            sourceId: dbRecord.sourceId,
            sourceName: dbRecord.source.name,
            sourceUrl: dbRecord.sourceUrl,
            registeredUntil: dbRecord.registeredUntil?.toISOString(),
            isExpired,
            evidenceClassification: dbRecord.evidenceClassification as EvidenceClassification,
            isProductionEligible: dbRecord.isProductionEligible,
            isVerifiedOfficial: dbRecord.evidenceClassification === 'independently_verified_official',
            isSyntheticFixture: dbRecord.evidenceClassification === 'synthetic_test_fixture',
            retrievedAt: dbRecord.retrievedAt?.toISOString(),
            lastVerifiedAt: dbRecord.lastVerifiedAt?.toISOString(),
            verifiedAt: dbRecord.verifiedAt?.toISOString(),
            verifiedBy: dbRecord.verifiedBy || undefined,
            fieldProvenance: dbRecord.fieldProvenance as Record<string, string>,
          },
          lookupFailedOrTimedOut: false,
        };
      }
    } catch (error) {
      console.warn('[Repository] Non-production database query error, using isolated test fixtures:', error);
    }
  }

  // Curated Fallback for Development and Test environments ONLY
  const match = CURATED_REGISTRY_RECORDS.find((rec) => {
    const normRecNo = normalizeRegistrationNumber(rec.registrationNumber);
    const numMatches = normRecNo === normInputNo;
    if (!numMatches) return false;
    if (category && category !== 'other' && rec.category !== category) {
      return false;
    }
    return true;
  });

  return { record: match || null, lookupFailedOrTimedOut: false };
}

/**
 * Finds a registry record by registration number and optional category.
 */
export async function findRegistryRecord(
  registrationNumber: string,
  category?: ProductCategory
): Promise<RegistryRecordEvidence | null> {
  const result = await findRegistryRecordDetailed(registrationNumber, category);
  return result.record;
}

/**
 * Finds matching public alerts based on batch number, affected pack name, or brand.
 * Priority 1: batch_number or affected_pack_name match triggers Alert verdict.
 * Brand-only match is flagged as informational only (PRD §5).
 * In production: Synthetic alerts are strictly excluded.
 */
export async function findAlertMatch(
  batchNumber?: string,
  productName?: string,
  brand?: string
): Promise<MatchedAlertEvidence | null> {
  const isProduction = process.env.NODE_ENV === 'production';
  const normBatch = batchNumber ? normalizeText(batchNumber) : '';
  const normProd = productName ? normalizeText(productName) : '';
  const normBrand = brand ? normalizeText(brand) : '';

  if (isDatabaseConfigured()) {
    try {
      const dbAlerts = await prisma.alert.findMany();
      if (dbAlerts.length > 0) {
        // In production, require independently verified official alerts only via central provenance validator:
        const eligibleAlerts = isProduction
          ? dbAlerts.filter((a) => {
              const val = validateAlertProvenance({
                alertNumber: a.alertNumber,
                title: a.title,
                sourceUrl: a.sourceUrl,
                officialSourceUrl: a.sourceUrl,
                retrievedAt: a.retrievedAt,
                lastCheckedAt: a.lastCheckedAt,
                verifiedAt: a.verifiedAt,
                verifiedBy: a.verifiedBy,
                evidenceClassification: a.evidenceClassification,
                isSyntheticFixture: a.isSyntheticFixture,
                isProductionEligible: a.isProductionEligible,
                affectedPackNames: a.affectedPackNames,
                batchNumbers: a.batchNumbers,
              });
              return val.isValid;
            })
          : dbAlerts;

        for (const alert of eligibleAlerts) {
          // 1. Batch number match
          if (normBatch && (alert.batchNumbers || []).some((b) => normalizeText(b) === normBatch)) {
            return {
              alertId: alert.id,
              alertNumber: alert.alertNumber,
              title: alert.title,
              matchedField: 'batch_number',
              matchedValue: batchNumber || '',
              ruleUsed: 'Exact batch number match against official recall list',
              sourceUrl: alert.sourceUrl,
              officialSourceUrl: alert.sourceUrl,
              retrievedAt: alert.retrievedAt?.toISOString(),
              lastReviewDate: alert.lastCheckedAt?.toISOString(),
              verifiedAt: alert.verifiedAt?.toISOString(),
              verifiedBy: alert.verifiedBy || undefined,
              evidenceClassification: alert.evidenceClassification as EvidenceClassification,
              isVerifiedOfficial: alert.evidenceClassification === 'independently_verified_official' && !alert.isSyntheticFixture,
              isSyntheticFixture: alert.isSyntheticFixture,
              isProductionEligible: alert.isProductionEligible,
            };
          }

          // 2. Affected pack name match
          if (
            normProd &&
            (alert.affectedPackNames || []).some((p) => {
              const normP = normalizeText(p);
              return normP.includes(normProd) || normProd.includes(normP);
            })
          ) {
            return {
              alertId: alert.id,
              alertNumber: alert.alertNumber,
              title: alert.title,
              matchedField: 'affected_pack_name',
              matchedValue: productName || '',
              ruleUsed: 'Product name matches affected-pack name in official alert',
              sourceUrl: alert.sourceUrl,
              officialSourceUrl: alert.sourceUrl,
              retrievedAt: alert.retrievedAt?.toISOString(),
              lastReviewDate: alert.lastCheckedAt?.toISOString(),
              verifiedAt: alert.verifiedAt?.toISOString(),
              verifiedBy: alert.verifiedBy || undefined,
              evidenceClassification: alert.evidenceClassification as EvidenceClassification,
              isVerifiedOfficial: alert.evidenceClassification === 'independently_verified_official' && !alert.isSyntheticFixture,
              isSyntheticFixture: alert.isSyntheticFixture,
              isProductionEligible: alert.isProductionEligible,
            };
          }

          // 3. Brand-only match (informational flag only)
          if (
            normBrand &&
            (alert.genuineBrands || []).some((b) => {
              const nb = normalizeText(b);
              return nb === normBrand || normBrand.includes(nb);
            })
          ) {
            return {
              alertId: alert.id,
              alertNumber: alert.alertNumber,
              title: alert.title,
              matchedField: 'brand_only',
              matchedValue: brand || '',
              ruleUsed: 'Brand matches genuine brand under public alert warning',
              sourceUrl: alert.sourceUrl,
              officialSourceUrl: alert.sourceUrl,
              retrievedAt: alert.retrievedAt?.toISOString(),
              lastReviewDate: alert.lastCheckedAt?.toISOString(),
              verifiedAt: alert.verifiedAt?.toISOString(),
              verifiedBy: alert.verifiedBy || undefined,
              evidenceClassification: alert.evidenceClassification as EvidenceClassification,
              isVerifiedOfficial: alert.evidenceClassification === 'independently_verified_official' && !alert.isSyntheticFixture,
              isSyntheticFixture: alert.isSyntheticFixture,
              isProductionEligible: alert.isProductionEligible,
            };
          }
        }
      }
    } catch (error) {
      console.warn('[Repository] Database query error for alerts, checking official curated alerts:', error);
    }
  }

  // Curated Fallback
  // In production, enforce identical strict provenance validation:
  const eligibleCuratedAlerts = isProduction
    ? CURATED_PUBLIC_ALERTS.filter((a) => {
        const val = validateAlertProvenance({
          alertNumber: a.alertNumber,
          title: a.title,
          sourceUrl: a.sourceUrl,
          officialSourceUrl: a.officialSourceUrl,
          retrievedAt: a.retrievedAt,
          lastCheckedAt: a.lastCheckedAt,
          verifiedAt: a.verifiedAt,
          verifiedBy: a.verifiedBy,
          evidenceClassification: a.evidenceClassification,
          isSyntheticFixture: a.isSyntheticFixture,
          isProductionEligible: a.isProductionEligible,
          affectedPackNames: a.affectedPackNames,
          batchNumbers: a.batchNumbers,
        });
        return val.isValid;
      })
    : CURATED_PUBLIC_ALERTS;

  for (const alert of eligibleCuratedAlerts) {
    // 1. Batch match
    if (normBatch && (alert.batchNumbers || []).some((b) => normalizeText(b) === normBatch)) {
      return {
        alertId: alert.id,
        alertNumber: alert.alertNumber,
        title: alert.title,
        matchedField: 'batch_number',
        matchedValue: batchNumber || '',
        ruleUsed: 'Exact batch number match against official recall list',
        sourceUrl: alert.sourceUrl,
        officialSourceUrl: alert.sourceUrl,
        retrievedAt: alert.retrievedAt?.toISOString(),
        lastReviewDate: alert.lastCheckedAt?.toISOString(),
        verifiedAt: alert.verifiedAt?.toISOString(),
        verifiedBy: alert.verifiedBy,
        evidenceClassification: alert.evidenceClassification,
        isVerifiedOfficial: alert.isVerifiedOfficial,
        isSyntheticFixture: alert.isSyntheticFixture,
        isProductionEligible: alert.isProductionEligible ?? false,
      };
    }

    // 2. Affected pack name match
    if (
      normProd &&
      (alert.affectedPackNames || []).some((p) => {
        const normP = normalizeText(p);
        return normP.includes(normProd) || normProd.includes(normP);
      })
    ) {
      return {
        alertId: alert.id,
        alertNumber: alert.alertNumber,
        title: alert.title,
        matchedField: 'affected_pack_name',
        matchedValue: productName || '',
        ruleUsed: 'Product name matches affected-pack name in official alert',
        sourceUrl: alert.sourceUrl,
        officialSourceUrl: alert.sourceUrl,
        retrievedAt: alert.retrievedAt?.toISOString(),
        lastReviewDate: alert.lastCheckedAt?.toISOString(),
        verifiedAt: alert.verifiedAt?.toISOString(),
        verifiedBy: alert.verifiedBy,
        evidenceClassification: alert.evidenceClassification,
        isVerifiedOfficial: alert.isVerifiedOfficial,
        isSyntheticFixture: alert.isSyntheticFixture,
        isProductionEligible: alert.isProductionEligible ?? false,
      };
    }

    // 3. Brand-only match
    if (
      normBrand &&
      (alert.genuineBrands || []).some((b) => {
        const nb = normalizeText(b);
        return nb === normBrand || normBrand.includes(nb);
      })
    ) {
      return {
        alertId: alert.id,
        alertNumber: alert.alertNumber,
        title: alert.title,
        matchedField: 'brand_only',
        matchedValue: brand || '',
        ruleUsed: 'Brand matches genuine brand under public alert warning',
        sourceUrl: alert.sourceUrl,
        officialSourceUrl: alert.sourceUrl,
        retrievedAt: alert.retrievedAt?.toISOString(),
        lastReviewDate: alert.lastCheckedAt?.toISOString(),
        verifiedAt: alert.verifiedAt?.toISOString(),
        verifiedBy: alert.verifiedBy,
        evidenceClassification: alert.evidenceClassification,
        isVerifiedOfficial: alert.isVerifiedOfficial,
        isSyntheticFixture: alert.isSyntheticFixture,
        isProductionEligible: alert.isProductionEligible ?? false,
      };
    }
  }

  return null;
}

/**
 * End-to-end Verification Engine Invocation.
 * 1. Resolves registry records from Neon DB / Curated repository.
 * 2. Resolves public alerts from Neon DB / Curated alerts.
 * 3. Evaluates PRD v3.1 deterministic verdict precedence.
 */
export async function verifyConfirmedPack(
  input: ConfirmedPackInput
): Promise<VerdictEngineResult> {
  const [registryResult, alertMatch] = await Promise.all([
    findRegistryRecordDetailed(input.registrationNumber, input.category),
    findAlertMatch(input.batchNumber, input.productName, input.brand),
  ]);

  return evaluateVerdict(input, alertMatch, registryResult.record, {
    lookupFailedOrTimedOut: registryResult.lookupFailedOrTimedOut,
  });
}
