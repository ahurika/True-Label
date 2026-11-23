import { describe, it, expect } from 'vitest';
import {
  evaluateVerdict,
  normalizeRegistrationNumber,
  normalizeText,
  ConfirmedPackInput,
  RegistryRecordEvidence,
  MatchedAlertEvidence,
} from '../verdict/verdict-engine';

describe('Deterministic Verdict Engine (PRD v3.1 Section 5)', () => {
  const baseInput: ConfirmedPackInput = {
    registrationNumber: 'A0-1234',
    isNumberConfirmedByUser: true,
    brand: 'Golden Penny',
    productName: 'Semovita',
    manufacturer: 'Flour Mills of Nigeria',
    isIdentityConfirmedByUser: true,
    category: 'food',
    batchNumber: 'B12345',
    expiryDate: '2027-12-31',
  };

  const baseRegistryRecord: RegistryRecordEvidence = {
    registrationNumber: 'A0-1234',
    brand: 'Golden Penny',
    productName: 'Semovita',
    manufacturer: 'Flour Mills of Nigeria',
    category: 'food',
    status: 'active',
    sourceCoverage: 'partial',
    sourceId: 'src-nafdac-food-curated',
    sourceName: 'Curated NAFDAC Food Registry',
    sourceUrl: 'https://nafdac.gov.ng/food-registry',
  };

  describe('Normalization functions', () => {
    it('normalizes registration numbers safely', () => {
      expect(normalizeRegistrationNumber(' 04 - 1234 ')).toBe('041234');
      expect(normalizeRegistrationNumber('a1_5678')).toBe('A15678');
      expect(normalizeRegistrationNumber('B4-9999')).toBe('B49999');
    });

    it('normalizes text safely', () => {
      expect(normalizeText('  Golden   Penny, Ltd.  ')).toBe('golden penny ltd');
      expect(normalizeText('Paracetamol (500mg)')).toBe('paracetamol 500mg');
    });
  });

  describe('Priority 1: Matches a NAFDAC alert -> Verdict 2', () => {
    it('returns Verdict 2 on exact batch match', () => {
      const alert: MatchedAlertEvidence = {
        alertId: 'alt-001',
        alertNumber: 'NAFDAC/PR/2026/045',
        title: 'Recall of contaminated batch',
        matchedField: 'batch_number',
        matchedValue: 'B12345',
        ruleUsed: 'exact_batch_match',
      };

      const result = evaluateVerdict(baseInput, alert, baseRegistryRecord);
      expect(result.verdictNumber).toBe(2);
      expect(result.verdictDefinition.code).toBe('alert');
      expect(result.verdictDefinition.title).toBe('Matches a NAFDAC alert');
      expect(result.mandatoryCaveat).toBe(false);
      expect(result.flags).toContain('ALERT_MATCHED');
    });

    it('returns Verdict 2 on affected-pack name match', () => {
      const alert: MatchedAlertEvidence = {
        alertId: 'alt-002',
        alertNumber: 'NAFDAC/PR/2026/088',
        title: 'Public warning on counterfeit packaging',
        matchedField: 'affected_pack_name',
        matchedValue: 'Semovita',
        ruleUsed: 'exact_pack_name_match',
      };

      const result = evaluateVerdict(baseInput, alert, baseRegistryRecord);
      expect(result.verdictNumber).toBe(2);
      expect(result.verdictDefinition.title).toBe('Matches a NAFDAC alert');
    });

    it('brand-only alert match does NOT trigger Alert verdict (flags only)', () => {
      const alert: MatchedAlertEvidence = {
        alertId: 'alt-003',
        alertNumber: 'NAFDAC/PR/2026/012',
        title: 'General brand alert',
        matchedField: 'brand_only',
        matchedValue: 'Golden Penny',
        ruleUsed: 'brand_advisory',
      };

      // Since all other gates pass, brand-only match allows positive match with informational flag
      const result = evaluateVerdict(baseInput, alert, baseRegistryRecord);
      expect(result.verdictNumber).toBe(1);
      expect(result.flags).toContain('ALERT_ON_BRAND_ONLY');
    });
  });

  describe('Priority 2: Number problem -> Verdict 3', () => {
    it('returns Verdict 3 if registration number is malformed or empty', () => {
      const badInput: ConfirmedPackInput = {
        ...baseInput,
        registrationNumber: '',
      };
      const result = evaluateVerdict(badInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(3);
      expect(result.verdictDefinition.title).toBe('Number problem');
    });

    it('returns Verdict 3 if matched record is explicitly inactive/expired', () => {
      const expiredRecord: RegistryRecordEvidence = {
        ...baseRegistryRecord,
        status: 'inactive',
        isExpired: true,
      };
      const result = evaluateVerdict(baseInput, null, expiredRecord);
      expect(result.verdictNumber).toBe(3);
      expect(result.verdictDefinition.title).toBe('Number problem');
    });

    it('returns Verdict 3 if number belongs to a different product or brand in registry', () => {
      const mismatchRecord: RegistryRecordEvidence = {
        ...baseRegistryRecord,
        registrationNumber: 'A0-1234',
        brand: 'Dangote',
        productName: 'Refined Sugar',
      };
      const result = evaluateVerdict(baseInput, null, mismatchRecord);
      expect(result.verdictNumber).toBe(3);
      expect(result.verdictDefinition.title).toBe('Number problem');
      expect(result.discrepancies.length).toBeGreaterThan(0);
    });
  });

  describe('Priority 3: Could not confirm -> Verdict 4', () => {
    it('returns Verdict 4 if user has not confirmed registration number', () => {
      const unconfirmedInput: ConfirmedPackInput = {
        ...baseInput,
        isNumberConfirmedByUser: false,
      };
      const result = evaluateVerdict(unconfirmedInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
    });

    it('returns Verdict 4 if user has not confirmed identity fields', () => {
      const unconfirmedIdInput: ConfirmedPackInput = {
        ...baseInput,
        isIdentityConfirmedByUser: false,
      };
      const result = evaluateVerdict(unconfirmedIdInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
    });

    it('returns Verdict 4 for household products (PRD §1.1 & §8.2 boundary)', () => {
      const householdInput: ConfirmedPackInput = {
        ...baseInput,
        category: 'household',
      };
      const result = evaluateVerdict(householdInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
      expect(result.flags).toContain('HOUSEHOLD_CATEGORY_LIMITED');
    });

    it('returns Verdict 4 for medicine when strength is unconfirmed (PRD §10.7)', () => {
      const medicineInput: ConfirmedPackInput = {
        ...baseInput,
        category: 'medicine',
        medicineStrength: '500mg',
        isStrengthConfirmedByUser: false,
      };
      const result = evaluateVerdict(medicineInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(4);
      expect(result.flags).toContain('MEDICINE_STRENGTH_UNCONFIRMED');
    });

    it('returns Verdict 4 when record is not found in partial curated dataset', () => {
      const result = evaluateVerdict(baseInput, null, null);
      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
      expect(result.flags).toContain('PARTIAL_SOURCE_NO_MATCH');
    });
  });

  describe('Priority 4: Registered and matches -> Verdict 1', () => {
    it('returns Verdict 1 with mandatory caveat when all 7 gates pass', () => {
      const result = evaluateVerdict(baseInput, null, baseRegistryRecord);
      expect(result.verdictNumber).toBe(1);
      expect(result.verdictDefinition.code).toBe('registered');
      expect(result.verdictDefinition.title).toBe('Registered and matches');
      expect(result.mandatoryCaveat).toBe(true);
      expect(result.gateChecks.activeRecordFound).toBe(true);
      expect(result.gateChecks.brandMatches).toBe(true);
    });

    it('returns Verdict 1 for medicine when strength is confirmed', () => {
      const medicineInput: ConfirmedPackInput = {
        ...baseInput,
        category: 'medicine',
        medicineStrength: '500mg',
        isStrengthConfirmedByUser: true,
      };
      const medicineRecord: RegistryRecordEvidence = {
        ...baseRegistryRecord,
        category: 'medicine',
      };
      const result = evaluateVerdict(medicineInput, null, medicineRecord);
      expect(result.verdictNumber).toBe(1);
      expect(result.mandatoryCaveat).toBe(true);
    });
  });
});
