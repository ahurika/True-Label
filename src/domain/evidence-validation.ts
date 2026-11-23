/**
 * ============================================================
 * TRUELABEL DOMAIN: EVIDENCE VALIDATION
 * Validates field-level provenance and source freshness rules:
 * - Registry review target: 90 days
 * - Alert index review target: 7 days
 * - Reference card review target: 90 days
 * ============================================================
 */

export interface FreshnessValidationResult {
  isStale: boolean;
  daysSinceVerification: number;
  maxFreshnessDays: number;
  lastVerifiedIso: string;
  freshnessNotice?: string;
}

export function validateEvidenceFreshness(
  lastVerifiedAt: Date | string | null | undefined,
  type: 'registry' | 'alert' | 'reference',
  referenceNow?: Date
): FreshnessValidationResult {
  const now = referenceNow || new Date();
  const maxDays = type === 'alert' ? 7 : 90;

  if (!lastVerifiedAt) {
    return {
      isStale: true,
      daysSinceVerification: 999,
      maxFreshnessDays: maxDays,
      lastVerifiedIso: 'Unknown',
      freshnessNotice: `This ${type} record has no verified verification timestamp and is considered stale.`,
    };
  }

  const verifiedDate =
    typeof lastVerifiedAt === 'string' ? new Date(lastVerifiedAt) : lastVerifiedAt;

  if (isNaN(verifiedDate.getTime())) {
    return {
      isStale: true,
      daysSinceVerification: 999,
      maxFreshnessDays: maxDays,
      lastVerifiedIso: 'Invalid Date',
      freshnessNotice: `Invalid timestamp for ${type} record.`,
    };
  }

  const diffMs = now.getTime() - verifiedDate.getTime();
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isStale = daysSince > maxDays;

  return {
    isStale,
    daysSinceVerification: Math.max(0, daysSince),
    maxFreshnessDays: maxDays,
    lastVerifiedIso: verifiedDate.toISOString(),
    freshnessNotice: isStale
      ? `This ${type} record was verified ${daysSince} days ago (exceeds ${maxDays}-day freshness window).`
      : undefined,
  };
}
