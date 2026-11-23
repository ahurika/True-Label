import {
  ConfirmedPackInput,
  FlagCode,
  MatchedAlertEvidence,
  RegistryRecordEvidence,
  VerdictResult as V4VerdictResult,
  V4_VERDICT_DEFINITIONS,
  MANDATORY_COPIED_NUMBER_CAVEAT,
  EvidenceReference,
} from './types';
import {
  VerdictNumber,
  VERDICT_DEFINITIONS as LEGACY_VERDICT_DEFINITIONS,
  LegacyVerdictDefinition,
} from './verdict-types';
import { normalizeRegistrationNumber } from './normalization';
import { validateRegistrationNumber } from './registration-validation';
import { evaluateDateStatus } from './date-validation';
import { evaluateRecordCompleteness } from './record-completeness';
import { evaluateSourceCoverage } from './source-coverage';
import { matchIdentity } from './identity-matching';
import { REASON_CODES } from './reason-codes';
import { validateEvidenceFreshness } from './evidence-validation';

export const DECISION_ENGINE_VERSION = '4.0.0-deterministic';
export const MATCHING_RULE_VERSION = '2026.11.20-v4';

export interface CombinedVerdictResult extends Omit<V4VerdictResult, 'verdictDefinition'> {
  verdictNumber: VerdictNumber;
  verdictDefinition: LegacyVerdictDefinition;
  summary: string;
}

export type VerdictEngineResult = CombinedVerdictResult;

/**
 * ============================================================
 * TRUELABEL DETERMINISTIC VERDICT ENGINE (PRD v4.0 §6)
 * Pure TypeScript business logic for statutory packaging comparison.
 * Evaluates rules in strict numerical sequence.
 * 
 * Strict Priority Order:
 * 1. Priority 1: alert_match (Verdict 2)
 * 2. Priority 2: registration_discrepancy (Verdict 3)
 * 3. Priority 3: could_not_confirm (Verdict 4)
 * 4. Priority 4: registry_match (Verdict 1)
 * ============================================================
 */
export function evaluateVerdict(
  input: ConfirmedPackInput,
  alertMatch: MatchedAlertEvidence | null,
  registryRecord: RegistryRecordEvidence | null,
  options?: {
    isBrandOnlyAlert?: boolean;
    referenceNow?: Date;
    lookupFailedOrTimedOut?: boolean;
  }
): CombinedVerdictResult {
  const flags: string[] = [];
  const discrepancies: string[] = [];
  const evidenceRefs: EvidenceReference[] = [];

  const now = options?.referenceNow || new Date();

  // 1. Evaluate Date and Freshness
  const dateEval = evaluateDateStatus(input.expiryDate, input.manufactureDate, now);
  dateEval.flags.forEach((f) => {
    if (!flags.includes(f)) flags.push(f);
  });

  if (options?.isBrandOnlyAlert && !flags.includes('ALERT_ON_BRAND')) {
    flags.push('ALERT_ON_BRAND');
    flags.push('ALERT_ON_BRAND_ONLY');
  }

  // Gate checks tracking
  const gateChecks = {
    numberConfirmed: input.isNumberConfirmedByUser,
    identityConfirmed: input.isIdentityConfirmedByUser,
    activeRecordFound: false,
    brandMatches: false,
    noAlertApplies: true,
    categoryApprovedForPositive: input.category !== 'household',
    strengthConfirmedIfMedicine:
      input.category !== 'medicine' || Boolean(input.isStrengthConfirmedByUser),
    recordComplete: false,
    sourceFresh: true,
  };

  // Add evidence references
  if (alertMatch) {
    evidenceRefs.push({
      type: 'alert',
      sourceName: `NAFDAC Public Alert ${alertMatch.alertNumber}`,
      sourceUrl: alertMatch.officialSourceUrl,
      retrievedAt: alertMatch.retrievedAt || now.toISOString(),
      lastVerifiedAt: alertMatch.lastReviewDate || now.toISOString(),
      checkedItem: alertMatch.matchedField === 'batch_number' ? 'Batch number' : 'Pack name',
      finding: `Matches affected recall bulletin (${alertMatch.matchedValue})`,
    });
  }

  if (registryRecord) {
    gateChecks.activeRecordFound = registryRecord.status === 'active';
    evidenceRefs.push({
      type: 'registry',
      sourceName: registryRecord.sourceName || 'Curated NAFDAC Statutory Record',
      sourceUrl: registryRecord.sourceUrl,
      retrievedAt: registryRecord.retrievedAt || now.toISOString(),
      lastVerifiedAt: registryRecord.lastVerifiedAt || now.toISOString(),
      checkedItem: 'Registration number & identity',
      finding: `Record status: ${registryRecord.status}; registered to ${registryRecord.brand || registryRecord.productName}`,
    });
  }

  const sourceMetadata = {
    sourceName: registryRecord?.sourceName || 'Curated Statutory Reference Records',
    sourceCoverage: registryRecord?.sourceCoverage || 'partial',
    recordCompleteness: registryRecord?.recordCompleteness || 'complete',
    lastVerifiedAt: registryRecord?.lastVerifiedAt || now.toISOString(),
    isStale: false,
  };

  // ────────────────────────────────────────────────────────────
  // RULE 1 (Priority 1): Matches a NAFDAC alert -> 'alert_match' (Legacy Verdict 2)
  // Triggered ONLY by exact batch number or exact affected-pack name.
  // Brand-only similarity NEVER triggers alert_match.
  // ────────────────────────────────────────────────────────────
  if (alertMatch) {
    if (
      alertMatch.matchedField === 'batch_number' ||
      alertMatch.matchedField === 'affected_pack_name'
    ) {
      gateChecks.noAlertApplies = false;
      flags.push('ALERT_MATCHED');
      const reasonCode =
        alertMatch.matchedField === 'batch_number'
          ? REASON_CODES.ALERT_BATCH_EXACT_MATCH
          : REASON_CODES.ALERT_AFFECTED_PACK_NAME_MATCH;

      const summary = `A specific public NAFDAC recall notice (${alertMatch.alertNumber}) explicitly identifies this product batch or packaging description. Do not consume or distribute this pack.`;

      return {
        verdict: 'alert_match',
        verdictNumber: 2,
        verdictDefinition: LEGACY_VERDICT_DEFINITIONS[2],
        displayLabel: V4_VERDICT_DEFINITIONS.alert_match.displayLabel,
        reasonCode,
        explanation: summary,
        summary,
        mandatoryCaveat: false,
        evidenceReferences: evidenceRefs,
        matchedAlert: alertMatch,
        registryRecord: registryRecord || undefined,
        discrepancies,
        flags: flags as FlagCode[],
        sourceMetadata,
        matchingRuleVersion: MATCHING_RULE_VERSION,
        decisionEngineVersion: DECISION_ENGINE_VERSION,
        nextRecommendedAction:
          'Do not use this product. Safely isolate the pack and report it directly to NAFDAC using the official recall reporting channel.',
        gateChecks,
      };
    }

    // Brand-only match is an informational flag only, NEVER an Alert verdict (PRD §6.2)
    if (alertMatch.matchedField === 'brand_only') {
      flags.push('ALERT_ON_BRAND_ONLY');
      flags.push('ALERT_ON_BRAND');
    }
  }

  // ────────────────────────────────────────────────────────────
  // RULE 2 (Priority 2): Registration details don't match -> 'registration_discrepancy' (Legacy Verdict 3)
  // Triggered when reliable evidence establishes:
  // - Number is malformed or invalid
  // - Number belongs to a different product identity or manufacturer
  // - Record is explicitly marked inactive, cancelled, or expired
  // - Documented complete source proves absence of registration
  // ────────────────────────────────────────────────────────────

  // Format check on registration number
  const regValidation = validateRegistrationNumber(input.registrationNumber, input.category);
  if (!regValidation.isValid) {
    discrepancies.push(`Registration number format issue: ${regValidation.error}`);
    const summary = `The registration number printed on the pack ("${input.registrationNumber}") is malformed or invalid for statutory registration records.`;
    return {
      verdict: 'registration_discrepancy',
      verdictNumber: 3,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[3],
      displayLabel: V4_VERDICT_DEFINITIONS.registration_discrepancy.displayLabel,
      reasonCode: REASON_CODES.DISCREPANCY_REGISTRATION_NUMBER_MALFORMED,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction:
        'Inspect the physical pack to confirm whether the registration number was typed or read accurately. Check official NAFDAC portals for registration status.',
      gateChecks,
    };
  }

  if (registryRecord) {
    // 2A. Record explicitly inactive or expired in official source
    if (registryRecord.status === 'inactive' || registryRecord.isExpired) {
      discrepancies.push('The registered record is explicitly listed as inactive or expired.');
      const summary = `Registration number ${input.registrationNumber} exists in statutory records but is marked inactive, lapsed, or expired.`;
      return {
        verdict: 'registration_discrepancy',
        verdictNumber: 3,
        verdictDefinition: LEGACY_VERDICT_DEFINITIONS[3],
        displayLabel: V4_VERDICT_DEFINITIONS.registration_discrepancy.displayLabel,
        reasonCode: REASON_CODES.DISCREPANCY_RECORD_INACTIVE_OR_EXPIRED,
        explanation: summary,
        summary,
        mandatoryCaveat: false,
        evidenceReferences: evidenceRefs,
        registryRecord,
        discrepancies,
        flags: flags as FlagCode[],
        sourceMetadata,
        matchingRuleVersion: MATCHING_RULE_VERSION,
        decisionEngineVersion: DECISION_ENGINE_VERSION,
        nextRecommendedAction:
          'Contact the manufacturer or verify with NAFDAC whether the marketing authorization for this product has been renewed.',
        gateChecks,
      };
    }

    // 2B. Number belongs to a completely different product identity
    const identityCheck = matchIdentity(
      input.brand,
      input.productName,
      input.manufacturer,
      registryRecord.brand,
      registryRecord.productName,
      registryRecord.manufacturer
    );

    if (identityCheck.isLookalikeName && !flags.includes('LOOKALIKE_NAME')) {
      flags.push('LOOKALIKE_NAME');
    }

    if (identityCheck.isMaterialMismatch && !identityCheck.overallIdentityMatch) {
      discrepancies.push(...identityCheck.mismatchDetails);
      const summary = `Registration number ${input.registrationNumber} is registered to a different product: "${registryRecord.brand || ''} ${registryRecord.productName}" (Manufacturer: ${registryRecord.manufacturer || 'Different entity'}), not "${input.brand} ${input.productName}".`;
      return {
        verdict: 'registration_discrepancy',
        verdictNumber: 3,
        verdictDefinition: LEGACY_VERDICT_DEFINITIONS[3],
        displayLabel: V4_VERDICT_DEFINITIONS.registration_discrepancy.displayLabel,
        reasonCode: REASON_CODES.DISCREPANCY_NUMBER_BELONGS_TO_OTHER_PRODUCT,
        explanation: summary,
        summary,
        mandatoryCaveat: false,
        evidenceReferences: evidenceRefs,
        registryRecord,
        discrepancies,
        flags: flags as FlagCode[],
        sourceMetadata,
        matchingRuleVersion: MATCHING_RULE_VERSION,
        decisionEngineVersion: DECISION_ENGINE_VERSION,
        nextRecommendedAction:
          'Check packaging details carefully. If you suspect packaging misrepresentation, submit a report to regulatory authorities.',
        gateChecks,
      };
    }
  }

  // 2C. Absence from a complete source (PRD §6.2)
  if (!registryRecord && input.isNumberConfirmedByUser) {
    const coverageEval = evaluateSourceCoverage(sourceMetadata.sourceCoverage);
    if (coverageEval.canSupportAbsenceDiscrepancy) {
      discrepancies.push('Registration number was not found in an exhaustive statutory database.');
      const summary = `Registration number ${input.registrationNumber} does not appear in the complete statutory registry dataset for ${input.category}.`;
      return {
        verdict: 'registration_discrepancy',
        verdictNumber: 3,
        verdictDefinition: LEGACY_VERDICT_DEFINITIONS[3],
        displayLabel: V4_VERDICT_DEFINITIONS.registration_discrepancy.displayLabel,
        reasonCode: REASON_CODES.DISCREPANCY_ABSENCE_IN_COMPLETE_REGISTRY,
        explanation: summary,
        summary,
        mandatoryCaveat: false,
        evidenceReferences: evidenceRefs,
        discrepancies,
        flags: flags as FlagCode[],
        sourceMetadata,
        matchingRuleVersion: MATCHING_RULE_VERSION,
        decisionEngineVersion: DECISION_ENGINE_VERSION,
        nextRecommendedAction:
          'Confirm that the number was typed accurately from the physical pack. If accurate, verify via official NAFDAC portals.',
        gateChecks,
      };
    }
  }

  // ────────────────────────────────────────────────────────────
  // RULE 3 (Priority 3): Could not confirm -> 'could_not_confirm' (Legacy Verdict 4)
  // Triggered when evidence is insufficient, unconfirmed, or incomplete:
  // - Lookup failed or timed out
  // - User did not confirm required critical fields
  // - Source is partial and record was not found
  // - Category is unsupported for positive matching (e.g. household products)
  // - Record is stale or lacks field provenance
  // - Identity is ambiguous
  // ────────────────────────────────────────────────────────────

  if (options?.lookupFailedOrTimedOut) {
    const summary = 'The registry lookup service timed out or could not be reached. Documentary comparison could not be completed.';
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_LOOKUP_FAILED_TIMEOUT,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Retry verification in a few moments, or check the NAFDAC portal directly.',
      gateChecks,
    };
  }

  // Gate: User Confirmation Check
  if (!input.isNumberConfirmedByUser || !input.isIdentityConfirmedByUser) {
    const summary = 'The registration number or product identity fields were not explicitly confirmed by the user. TrueLabel never assumes unconfirmed transcription is accurate.';
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_USER_NOT_CONFIRMED,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Review the extracted packaging fields and tap confirm to complete the comparison.',
      gateChecks,
    };
  }

  // Gate: Medicine strength confirmation
  if (input.category === 'medicine' && !input.isStrengthConfirmedByUser) {
    flags.push('MEDICINE_STRENGTH_UNCONFIRMED');
    const summary = 'Active medicine strength was not confirmed. For pharmaceutical packaging, active strength must be confirmed before positive matching.';
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_USER_NOT_CONFIRMED,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Review the medicine label and confirm the printed strength on the pack.',
      gateChecks,
    };
  }

  // Gate: Category Support (PRD §1.1 & §8.2: Household products can NEVER receive positive matching)
  if (input.category === 'household') {
    flags.push('HOUSEHOLD_CATEGORY_LIMITED');
    const summary = 'Household cleaning, pesticide, and chemical products do not currently have an approved statutory registry dataset in TrueLabel. No public recall alerts matched this pack.';
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_CATEGORY_UNSUPPORTED_FOR_POSITIVE,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Check the packaging for safe usage warnings. Verify registration directly on the NAFDAC portal.',
      gateChecks,
    };
  }

  // Gate: No Record Found in Partial Source
  if (!registryRecord) {
    flags.push('PARTIAL_SOURCE_NO_MATCH');
    const summary = `No record matching number "${input.registrationNumber}" was found in our curated statutory reference dataset. Because our dataset has partial coverage, this does NOT mean the product is unregistered.`;
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_NO_RECORD_FOUND_PARTIAL_SOURCE,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Search the official NAFDAC portal (nafdac.gov.ng) or NAPAMS registration database directly.',
      gateChecks,
    };
  }

  // Gate: Record Completeness
  const completeness = evaluateRecordCompleteness(registryRecord);
  gateChecks.recordComplete = completeness.isComplete;
  if (!completeness.isComplete) {
    const summary = `The available statutory record for ${input.registrationNumber} is missing required identity fields (${completeness.missingFields.join(', ')}). A positive match cannot be confirmed without complete identity provenance.`;
    return {
      verdict: 'could_not_confirm',
      verdictNumber: 4,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
      displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
      reasonCode: REASON_CODES.UNCONFIRMED_RECORD_INCOMPLETE,
      explanation: summary,
      summary,
      mandatoryCaveat: false,
      evidenceReferences: evidenceRefs,
      registryRecord,
      discrepancies,
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction: 'Inspect the NAFDAC Green Book or registration portal for exhaustive registration details.',
      gateChecks,
    };
  }

  // Gate: Evidence Freshness (90-day threshold, evaluated if lastVerifiedAt is explicitly given)
  if (registryRecord.lastVerifiedAt) {
    const freshness = validateEvidenceFreshness(registryRecord.lastVerifiedAt, 'registry', now);
    gateChecks.sourceFresh = !freshness.isStale;
    if (freshness.isStale) {
      flags.push('INCOMPLETE_SOURCE');
      sourceMetadata.isStale = true;
      const summary = `The statutory reference record for this product was last verified on ${freshness.lastVerifiedIso} and exceeds the 90-day freshness window. Current registration status cannot be confirmed.`;
      return {
        verdict: 'could_not_confirm',
        verdictNumber: 4,
        verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
        displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
        reasonCode: REASON_CODES.UNCONFIRMED_SOURCE_STALE_OR_UNAVAILABLE,
        explanation: summary,
        summary,
        mandatoryCaveat: false,
        evidenceReferences: evidenceRefs,
        registryRecord,
        discrepancies,
        flags: flags as FlagCode[],
        sourceMetadata,
        matchingRuleVersion: MATCHING_RULE_VERSION,
        decisionEngineVersion: DECISION_ENGINE_VERSION,
        nextRecommendedAction: 'Check live NAFDAC portals to confirm current authorization status.',
        gateChecks,
      };
    }
  }

  // ────────────────────────────────────────────────────────────
  // RULE 4 (Priority 4): High-Evidence Gate Passed -> 'registry_match' (Legacy Verdict 1)
  // All 12 mandatory conditions pass cleanly.
  // ────────────────────────────────────────────────────────────
  const normPackNum = normalizeRegistrationNumber(input.registrationNumber);
  const normRecNum = normalizeRegistrationNumber(registryRecord.registrationNumber);

  if (normPackNum === normRecNum && registryRecord.status === 'active') {
    gateChecks.brandMatches = true;
    const summary = `Confirmed packaging details correspond to an active official statutory registration record for ${registryRecord.brand || ''} ${registryRecord.productName}.`;

    return {
      verdict: 'registry_match',
      verdictNumber: 1,
      verdictDefinition: LEGACY_VERDICT_DEFINITIONS[1],
      displayLabel: V4_VERDICT_DEFINITIONS.registry_match.displayLabel,
      reasonCode: REASON_CODES.REGISTRY_MATCH_ALL_CONDITIONS_PASSED,
      explanation: summary,
      summary,
      mandatoryCaveat: true,
      mandatoryCaveatText: MANDATORY_COPIED_NUMBER_CAVEAT,
      evidenceReferences: evidenceRefs,
      registryRecord,
      discrepancies: [],
      flags: flags as FlagCode[],
      sourceMetadata,
      matchingRuleVersion: MATCHING_RULE_VERSION,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
      nextRecommendedAction:
        'Always inspect physical seals, tamper bands, and packaging quality. Remember that registration numbers can be copied onto fake packaging.',
      gateChecks,
    };
  }

  // Default fallback if any unexpected condition slipped through
  const fallbackSummary = 'Available evidence is insufficient to reach an unambiguous conclusion.';
  return {
    verdict: 'could_not_confirm',
    verdictNumber: 4,
    verdictDefinition: LEGACY_VERDICT_DEFINITIONS[4],
    displayLabel: V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel,
    reasonCode: REASON_CODES.UNCONFIRMED_IDENTITY_AMBIGUOUS,
    explanation: fallbackSummary,
    summary: fallbackSummary,
    mandatoryCaveat: false,
    evidenceReferences: evidenceRefs,
    registryRecord,
    discrepancies,
    flags: flags as FlagCode[],
    sourceMetadata,
    matchingRuleVersion: MATCHING_RULE_VERSION,
    decisionEngineVersion: DECISION_ENGINE_VERSION,
    nextRecommendedAction: 'Check the product details and compare with official NAFDAC publications.',
    gateChecks,
  };
}
