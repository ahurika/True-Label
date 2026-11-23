import { VerdictCode } from './types';

/**
 * ============================================================
 * TRUELABEL AUTHORITATIVE VERDICT DEFINITIONS (PRD v4.0 & v3.1 compatibility)
 * ============================================================
 */

export type VerdictNumber = 1 | 2 | 3 | 4;

export type LegacyVerdictCode = 'registered' | 'alert' | 'number-problem' | 'unconfirmed';

export type AnyVerdictCode = VerdictCode | LegacyVerdictCode;

export interface LegacyVerdictDefinition {
  number: VerdictNumber;
  code: LegacyVerdictCode;
  v4Code: VerdictCode;
  title: string;
  iconName: 'Ledger' | 'Bell' | 'Flag' | 'MagnifierQuestion';
  evaluationPriority: 1 | 2 | 3 | 4;
  mandatoryCaveat: boolean;
  statusTokenIndex: 1 | 2 | 3 | 4;
}

export const VERDICT_DEFINITIONS: Record<VerdictNumber, LegacyVerdictDefinition> = {
  1: {
    number: 1,
    code: 'registered',
    v4Code: 'registry_match',
    title: 'Registered and matches',
    iconName: 'Ledger',
    evaluationPriority: 4,
    mandatoryCaveat: true,
    statusTokenIndex: 1,
  },
  2: {
    number: 2,
    code: 'alert',
    v4Code: 'alert_match',
    title: 'Matches a NAFDAC alert',
    iconName: 'Bell',
    evaluationPriority: 1,
    mandatoryCaveat: false,
    statusTokenIndex: 4,
  },
  3: {
    number: 3,
    code: 'number-problem',
    v4Code: 'registration_discrepancy',
    title: 'Number problem',
    iconName: 'Flag',
    evaluationPriority: 2,
    mandatoryCaveat: false,
    statusTokenIndex: 3,
  },
  4: {
    number: 4,
    code: 'unconfirmed',
    v4Code: 'could_not_confirm',
    title: 'Could not confirm',
    iconName: 'MagnifierQuestion',
    evaluationPriority: 3,
    mandatoryCaveat: false,
    statusTokenIndex: 2,
  },
} as const;

export const VERDICTS_BY_CODE: Record<string, LegacyVerdictDefinition> = {
  registered: VERDICT_DEFINITIONS[1],
  registry_match: VERDICT_DEFINITIONS[1],
  alert: VERDICT_DEFINITIONS[2],
  alert_match: VERDICT_DEFINITIONS[2],
  'number-problem': VERDICT_DEFINITIONS[3],
  registration_discrepancy: VERDICT_DEFINITIONS[3],
  unconfirmed: VERDICT_DEFINITIONS[4],
  could_not_confirm: VERDICT_DEFINITIONS[4],
};

export function getVerdictTitle(verdict: VerdictNumber | AnyVerdictCode): string {
  if (typeof verdict === 'number') {
    return VERDICT_DEFINITIONS[verdict]?.title ?? 'Could not confirm';
  }
  return VERDICTS_BY_CODE[verdict]?.title ?? 'Could not confirm';
}

export function requiresCopiedNumberCaveat(verdict: VerdictNumber | AnyVerdictCode): boolean {
  if (typeof verdict === 'number') {
    return VERDICT_DEFINITIONS[verdict]?.mandatoryCaveat ?? false;
  }
  return VERDICTS_BY_CODE[verdict]?.mandatoryCaveat ?? false;
}
