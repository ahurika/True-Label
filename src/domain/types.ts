/**
 * ============================================================
 * TRUELABEL DOMAIN TYPES (PRD v4.0)
 * Authoritative domain models and enums for deterministic verification.
 * ============================================================
 */

export type ProductCategory =
  | 'medicine'
  | 'food'
  | 'beverage'
  | 'water'
  | 'cosmetic'
  | 'toothpaste'
  | 'device'
  | 'herbal'
  | 'household'
  | 'other';

/**
 * Locked verdicts as specified in PRD v4.0 §6.1
 */
export type VerdictCode =
  | 'alert_match'
  | 'registration_discrepancy'
  | 'could_not_confirm'
  | 'registry_match';

export type VerdictPriority = 1 | 2 | 3 | 4;

export type SourceCoverage = 'complete' | 'partial' | 'none';

export type RecordCompleteness = 'complete' | 'incomplete';

export type RegistryStatus = 'active' | 'inactive' | 'unknown';

export type FlagCode =
  | 'LOOKALIKE_NAME'
  | 'ALERT_ON_BRAND'
  | 'MISSING_REGISTRATION_NUMBER'
  | 'DATE_ISSUE'
  | 'EXPIRED_PRODUCT'
  | 'SELLER_CONCERN'
  | 'INCOMPLETE_SOURCE';

export interface VerdictDefinition {
  code: VerdictCode;
  priority: VerdictPriority;
  displayLabel: string;
  shortLabel: string;
  meaning: string;
  iconName: 'Bell' | 'Flag' | 'MagnifierQuestion' | 'Ledger';
  mandatoryCaveat: boolean;
  statusTokenIndex: 1 | 2 | 3 | 4;
}

export const V4_VERDICT_DEFINITIONS: Record<VerdictCode, VerdictDefinition> = {
  alert_match: {
    code: 'alert_match',
    priority: 1,
    displayLabel: 'Matches a NAFDAC alert',
    shortLabel: 'Alert match',
    meaning: 'A specific official alert matches the confirmed product evidence',
    iconName: 'Bell',
    mandatoryCaveat: false,
    statusTokenIndex: 4,
  },
  registration_discrepancy: {
    code: 'registration_discrepancy',
    priority: 2,
    displayLabel: "Registration details don't match",
    shortLabel: 'Discrepancy',
    meaning: 'Reliable evidence establishes a material registration-number or identity conflict',
    iconName: 'Flag',
    mandatoryCaveat: false,
    statusTokenIndex: 3,
  },
  could_not_confirm: {
    code: 'could_not_confirm',
    priority: 3,
    displayLabel: 'Could not confirm',
    shortLabel: 'Unconfirmed',
    meaning: 'Available evidence is insufficient to reach a reliable comparison',
    iconName: 'MagnifierQuestion',
    mandatoryCaveat: false,
    statusTokenIndex: 2,
  },
  registry_match: {
    code: 'registry_match',
    priority: 4,
    displayLabel: 'Registry details match',
    shortLabel: 'Registry match',
    meaning: 'Confirmed identity details correspond to a sufficiently complete, current and verified registry record',
    iconName: 'Ledger',
    mandatoryCaveat: true,
    statusTokenIndex: 1,
  },
} as const;

export const VERDICT_DEFINITIONS_V4 = V4_VERDICT_DEFINITIONS;

export interface ConfirmedPackInput {
  registrationNumber: string;
  isNumberConfirmedByUser: boolean;
  brand: string;
  productName: string;
  manufacturer?: string;
  isIdentityConfirmedByUser: boolean;
  category: ProductCategory;
  medicineStrength?: string;
  dosageForm?: string;
  activeIngredients?: string;
  printedDirections?: string;
  isStrengthConfirmedByUser?: boolean;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  netContent?: string;
  isManuallyEntered?: boolean;
}

export type EvidenceClassification =
  | 'independently_verified_official'
  | 'historical_official_record'
  | 'synthetic_test_fixture'
  | 'unverified_record';

export interface MatchedAlertEvidence {
  alertId: string;
  alertNumber: string;
  title: string;
  issuedOn?: string;
  matchedField: 'batch_number' | 'affected_pack_name' | 'brand_only';
  matchedValue: string;
  ruleUsed: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  retrievedAt?: string;
  lastReviewDate?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  evidenceClassification?: EvidenceClassification;
  isSyntheticFixture?: boolean;
  isVerifiedOfficial?: boolean;
  isProductionEligible?: boolean;
}

export interface RegistryRecordEvidence {
  registrationNumber: string;
  productName: string;
  brand?: string;
  manufacturer?: string;
  category: ProductCategory;
  status: RegistryStatus;
  sourceCoverage: SourceCoverage;
  recordCompleteness?: RecordCompleteness;
  sourceId: string;
  sourceName?: string;
  sourceUrl?: string;
  retrievedAt?: string;
  lastVerifiedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  registeredUntil?: string;
  isExpired?: boolean;
  fieldProvenance?: Record<string, string>;
  isSyntheticFixture?: boolean;
  isVerifiedOfficial?: boolean;
  evidenceClassification?: EvidenceClassification;
  isProductionEligible?: boolean;
}

export interface EvidenceReference {
  type: 'alert' | 'registry' | 'provenance';
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  checkedItem: string;
  finding: string;
}

export interface VerdictResult {
  verdict: VerdictCode;
  verdictDefinition: VerdictDefinition;
  displayLabel: string;
  reasonCode: string;
  explanation: string;
  mandatoryCaveat: boolean;
  mandatoryCaveatText?: string;
  evidenceReferences: EvidenceReference[];
  matchedAlert?: MatchedAlertEvidence;
  registryRecord?: RegistryRecordEvidence;
  discrepancies: string[];
  flags: FlagCode[];
  sourceMetadata: {
    sourceName: string;
    sourceCoverage: SourceCoverage;
    recordCompleteness: RecordCompleteness;
    lastVerifiedAt: string;
    isStale: boolean;
  };
  matchingRuleVersion: string;
  decisionEngineVersion: string;
  nextRecommendedAction: string;
  gateChecks: {
    numberConfirmed: boolean;
    identityConfirmed: boolean;
    activeRecordFound: boolean;
    brandMatches: boolean;
    noAlertApplies: boolean;
    categoryApprovedForPositive: boolean;
    strengthConfirmedIfMedicine: boolean;
    recordComplete: boolean;
    sourceFresh: boolean;
  };
}

export const MANDATORY_COPIED_NUMBER_CAVEAT =
  'A matching registration record does not prove that the physical contents of this pack are genuine or safe. A registered number can appear on a copied or counterfeit pack.';

export const MANDATORY_PHARMACIST_NOTICE =
  'For questions about using this medicine, speak with a pharmacist or qualified healthcare professional. TrueLabel does not prescribe or change medicine directions.';
