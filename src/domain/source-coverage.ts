import { SourceCoverage } from './types';

/**
 * ============================================================
 * TRUELABEL DOMAIN: SOURCE COVERAGE
 * Pure TypeScript evaluation of registry source coverage semantics.
 * Coverage types:
 * - 'complete': Documented exhaustive list. Absence can imply non-registration.
 * - 'partial': Curated seed/gazette list. Match proves positive record;
 *              absence NEVER proves non-registration (defaults to 'could_not_confirm').
 * - 'none': No registry list available. Cannot support positive matching.
 * ============================================================
 */

export interface SourceCoverageEvaluation {
  coverage: SourceCoverage;
  canSupportAbsenceDiscrepancy: boolean;
  canSupportPositiveMatching: boolean;
  absenceExplanation: string;
}

export function evaluateSourceCoverage(coverage: SourceCoverage): SourceCoverageEvaluation {
  switch (coverage) {
    case 'complete':
      return {
        coverage: 'complete',
        canSupportAbsenceDiscrepancy: true,
        canSupportPositiveMatching: true,
        absenceExplanation:
          'This registry dataset is documented as complete. Absence of a number from this dataset can reliably indicate that the number is not currently registered.',
      };
    case 'partial':
      return {
        coverage: 'partial',
        canSupportAbsenceDiscrepancy: false,
        canSupportPositiveMatching: true,
        absenceExplanation:
          'This registry source is a curated statutory sample (partial coverage). Absence from this list does NOT prove a product is unregistered or problematic.',
      };
    case 'none':
    default:
      return {
        coverage: 'none',
        canSupportAbsenceDiscrepancy: false,
        canSupportPositiveMatching: false,
        absenceExplanation:
          'No approved registry source is available for this category. Positive matches cannot be issued.',
      };
  }
}
