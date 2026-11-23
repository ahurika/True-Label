import { describe, it, expect } from 'vitest';
import {
  evaluateVerdict,
  normalizeRegistrationNumber,
  formatRegistrationNumber,
  normalizeText,
  validateRegistrationNumber,
  parsePackDate,
  evaluateDateStatus,
  evaluateRecordCompleteness,
  evaluateSourceCoverage,
  matchIdentity,
  matchAlert,
  validateEvidenceFreshness,
  ConfirmedPackInput,
  RegistryRecordEvidence,
  AlertDefinition,
  MANDATORY_COPIED_NUMBER_CAVEAT,
  V4_VERDICT_DEFINITIONS,
} from '../index';

describe('PRD v4.0 Domain Modules and Locked Verdicts', () => {
  describe('1. Normalization & Formatting', () => {
    it('normalizes registration numbers safely', () => {
      expect(normalizeRegistrationNumber(' 04 - 0123 ')).toBe('040123');
      expect(normalizeRegistrationNumber('a1_5678.')).toBe('A15678');
      expect(normalizeRegistrationNumber('')).toBe('');
    });

    it('formats registration numbers into hyphenated representation', () => {
      expect(formatRegistrationNumber('040123')).toBe('04-0123');
      expect(formatRegistrationNumber('A15678')).toBe('A1-5678');
    });

    it('normalizes diacritics, case, and whitespace in text', () => {
      expect(normalizeText('  Nestlé   Water, Ltd.  ')).toBe('nestle water ltd');
      expect(normalizeText('Coartem® 20/120mg')).toBe('coartem 20120mg');
    });
  });

  describe('2. Registration Validation', () => {
    it('validates standard NAFDAC medicine prefixes', () => {
      const res = validateRegistrationNumber('04-0123', 'medicine');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('040123');
      expect(res.formatDescription).toContain('Standard NAFDAC human medicine');
    });

    it('rejects numbers that are too short or contain symbols', () => {
      const resShort = validateRegistrationNumber('12');
      expect(resShort.isValid).toBe(false);

      const resSymbols = validateRegistrationNumber('04$1234');
      expect(resSymbols.isValid).toBe(false);
    });
  });

  describe('3. Date Validation & Time Rules', () => {
    it('handles month-end expiry dates', () => {
      const { date, isMonthOnly } = parsePackDate('11/2026');
      expect(date).not.toBeNull();
      expect(isMonthOnly).toBe(true);
      expect(date?.getUTCFullYear()).toBe(2026);
      expect(date?.getUTCMonth()).toBe(10); // November is month index 10
      expect(date?.getUTCDate()).toBe(30); // 30th November
    });

    it('detects expired products against reference server time', () => {
      const refTime = new Date('2026-11-20T12:00:00Z');
      const evalPast = evaluateDateStatus('10/2026', undefined, refTime);
      expect(evalPast.isExpired).toBe(true);
      expect(evalPast.flags).toContain('EXPIRED_PRODUCT');

      const evalFuture = evaluateDateStatus('12/2026', undefined, refTime);
      expect(evalFuture.isExpired).toBe(false);
    });

    it('detects future manufacture and inconsistent date sequences', () => {
      const refTime = new Date('2026-11-20T12:00:00Z');
      const evalInconsistent = evaluateDateStatus('10/2026', '12/2026', refTime);
      expect(evalInconsistent.isDateInconsistent).toBe(true);
      expect(evalInconsistent.flags).toContain('DATE_ISSUE');
    });
  });

  describe('4. Record Completeness & Source Coverage Separation', () => {
    it('evaluates complete vs incomplete registry records', () => {
      const completeRecord = evaluateRecordCompleteness({
        registrationNumber: '04-0123',
        productName: 'Paracetamol',
        brand: 'Emzor',
        manufacturer: 'Emzor Pharma',
        category: 'medicine',
      });
      expect(completeRecord.isComplete).toBe(true);
      expect(completeRecord.completeness).toBe('complete');

      const incompleteRecord = evaluateRecordCompleteness({
        registrationNumber: '04-0123',
        category: 'medicine',
      });
      expect(incompleteRecord.isComplete).toBe(false);
      expect(incompleteRecord.completeness).toBe('incomplete');
      expect(incompleteRecord.missingFields).toContain('productName');
    });

    it('proves that partial sources NEVER support absence-based discrepancy', () => {
      const partialCov = evaluateSourceCoverage('partial');
      expect(partialCov.canSupportAbsenceDiscrepancy).toBe(false);
      expect(partialCov.canSupportPositiveMatching).toBe(true);

      const completeCov = evaluateSourceCoverage('complete');
      expect(completeCov.canSupportAbsenceDiscrepancy).toBe(true);

      const freshness = validateEvidenceFreshness('2026-01-01', 'registry', new Date('2026-11-20'));
      expect(freshness.isStale).toBe(true);
    });
  });

  describe('5. Identity & Lookalike Matching', () => {
    it('detects brand and manufacturer matches', () => {
      const match = matchIdentity(
        'Golden Penny',
        'Semovita',
        'Flour Mills of Nigeria',
        'Golden Penny',
        'Semovita Fortified Wheat Flour',
        'Flour Mills of Nigeria Plc'
      );
      expect(match.overallIdentityMatch).toBe(true);
      expect(match.brandMatches).toBe(true);
      expect(match.manufacturerMatches).toBe(true);
    });

    it('detects potential lookalike brand names', () => {
      const lookalike = matchIdentity(
        'Gollden Peny',
        'Semovita',
        'Flour Mills',
        'Golden Penny',
        'Semovita',
        'Flour Mills'
      );
      expect(lookalike.isLookalikeName).toBe(true);
      expect(lookalike.overallIdentityMatch).toBe(false);
    });
  });

  describe('6. Alert Matcher: Exact Evidence Law', () => {
    const alerts: AlertDefinition[] = [
      {
        id: 'alt-01',
        alertNumber: 'NAFDAC-2026-001',
        title: 'Recall of Benylin Paediatric Syrup Batch 012345',
        issuedOn: '2026-04-10',
        genuineBrands: ['Benylin'],
        affectedPackNames: ['Benylin Paediatric Syrup 100ml'],
        batchNumbers: ['012345'],
      },
    ];

    it('matches exact batch number on recall alert', () => {
      const res = matchAlert({ batchNumber: '012345' }, alerts);
      expect(res.hasMatch).toBe(true);
      expect(res.matchedAlert?.alertNumber).toBe('NAFDAC-2026-001');
      expect(res.matchedAlert?.matchedField).toBe('batch_number');
    });

    it('brand-only match sets isBrandOnlyAlert and NEVER triggers alert match', () => {
      const res = matchAlert({ brand: 'Benylin', batchNumber: '999999' }, alerts);
      expect(res.hasMatch).toBe(false);
      expect(res.isBrandOnlyAlert).toBe(true);
      expect(res.matchedAlert).toBeNull();
      expect(res.alertBrandNotice).toContain('mentions brand');
    });
  });

  describe('7. Locked Four Verdicts Hierarchy (PRD v4.0 §6)', () => {
    const validPack: ConfirmedPackInput = {
      registrationNumber: '04-0123',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      medicineStrength: '500mg',
      isStrengthConfirmedByUser: true,
      batchNumber: 'B8877',
      expiryDate: '12/2027',
    };

    const validRecord: RegistryRecordEvidence = {
      registrationNumber: '04-0123',
      brand: 'Emzor',
      productName: 'Paracetamol Tablets',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      category: 'medicine',
      status: 'active',
      sourceCoverage: 'partial',
      recordCompleteness: 'complete',
      sourceId: 'src-med-01',
      sourceName: 'NAFDAC Official Gazette Snapshot',
      retrievedAt: '2026-10-01T00:00:00Z',
      lastVerifiedAt: '2026-11-01T00:00:00Z',
    };

    it('Priority 1 wins: alert_match triggers on affected batch even if registry matches', () => {
      const alertMatch = {
        alertId: 'a-1',
        alertNumber: 'NAFDAC-2026-099',
        title: 'Emergency recall notice',
        issuedOn: '2026-11-01',
        matchedField: 'batch_number' as const,
        matchedValue: 'B8877',
        ruleUsed: 'Exact batch match',
      };

      const result = evaluateVerdict(validPack, alertMatch, validRecord);
      expect(result.verdict).toBe('alert_match');
      expect(result.displayLabel).toBe(V4_VERDICT_DEFINITIONS.alert_match.displayLabel);
      expect(result.mandatoryCaveat).toBe(false);
    });

    it('Priority 2: registration_discrepancy triggers when number belongs to different product', () => {
      const conflictingRecord: RegistryRecordEvidence = {
        ...validRecord,
        brand: 'Panadol',
        productName: 'Panadol Extra Tablets',
        manufacturer: 'GlaxoSmithKline',
      };

      const result = evaluateVerdict(validPack, null, conflictingRecord);
      expect(result.verdict).toBe('registration_discrepancy');
      expect(result.displayLabel).toBe(V4_VERDICT_DEFINITIONS.registration_discrepancy.displayLabel);
      expect(result.discrepancies.length).toBeGreaterThan(0);
    });

    it('Priority 3: could_not_confirm triggers when record is absent in partial source', () => {
      const result = evaluateVerdict(validPack, null, null);
      expect(result.verdict).toBe('could_not_confirm');
      expect(result.displayLabel).toBe(V4_VERDICT_DEFINITIONS.could_not_confirm.displayLabel);
      expect(result.explanation).toContain('partial coverage');
    });

    it('Priority 3: could_not_confirm triggers for household products (PRD §1.1 boundary)', () => {
      const householdPack: ConfirmedPackInput = {
        ...validPack,
        category: 'household',
      };
      const result = evaluateVerdict(householdPack, null, validRecord);
      expect(result.verdict).toBe('could_not_confirm');
      expect(result.explanation).toContain('Household cleaning, pesticide, and chemical products');
    });

    it('Priority 4: registry_match triggers with mandatory copied-number caveat', () => {
      const result = evaluateVerdict(validPack, null, validRecord);
      expect(result.verdict).toBe('registry_match');
      expect(result.displayLabel).toBe(V4_VERDICT_DEFINITIONS.registry_match.displayLabel);
      expect(result.mandatoryCaveat).toBe(true);
      expect(result.mandatoryCaveatText).toBe(MANDATORY_COPIED_NUMBER_CAVEAT);
      expect(result.evidenceReferences.length).toBeGreaterThan(0);
    });
  });
});
