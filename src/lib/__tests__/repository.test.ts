import { describe, it, expect } from 'vitest';
import {
  findRegistryRecord,
  findAlertMatch,
  verifyConfirmedPack,
  CURATED_REGISTRY_RECORDS,
  CURATED_PUBLIC_ALERTS,
} from '../db/repository';

describe('Curated Registry & Alert Repository Layer', () => {
  it('exposes curated records and alerts with field-level provenance', () => {
    expect(CURATED_REGISTRY_RECORDS.length).toBeGreaterThan(0);
    expect(CURATED_PUBLIC_ALERTS.length).toBeGreaterThan(0);
  });

  describe('findRegistryRecord', () => {
    it('finds active food record by registration number', async () => {
      const record = await findRegistryRecord('A0-1234', 'food');
      expect(record).not.toBeNull();
      expect(record?.brand).toBe('Golden Penny');
      expect(record?.productName).toContain('Semovita');
      expect(record?.status).toBe('active');
    });

    it('finds active medicine record by registration number', async () => {
      const record = await findRegistryRecord('04-0411', 'medicine');
      expect(record).not.toBeNull();
      expect(record?.brand).toBe('Emzor');
      expect(record?.category).toBe('medicine');
    });

    it('returns null for unseeded or unknown registration number', async () => {
      const record = await findRegistryRecord('XX-999999');
      expect(record).toBeNull();
    });

    it('normalizes formatting when searching (strips spaces and dashes)', async () => {
      const record1 = await findRegistryRecord('A0 1234', 'food');
      const record2 = await findRegistryRecord('A0-1234', 'food');
      expect(record1).toEqual(record2);
    });
  });

  describe('findAlertMatch', () => {
    it('matches exact batch number on active recall notice', async () => {
      const match = await findAlertMatch('B2024-X9', 'Any Product');
      expect(match).not.toBeNull();
      expect(match?.matchedField).toBe('batch_number');
      expect(match?.alertNumber).toBe('Notice No. 2026/088');
    });

    it('matches affected-pack name on active recall notice', async () => {
      const match = await findAlertMatch('BATCH-CLEAN', 'Contaminated Cough Syrup 100ml');
      expect(match).not.toBeNull();
      expect(match?.matchedField).toBe('affected_pack_name');
    });

    it('flags brand-only match as brand_only (never triggers alert verdict alone)', async () => {
      const match = await findAlertMatch('CLEAN-BATCH', 'Safe Medicine', 'Legacy Remedies');
      expect(match).not.toBeNull();
      expect(match?.matchedField).toBe('brand_only');
    });

    it('returns null when neither batch, pack name, nor brand matches an alert', async () => {
      const match = await findAlertMatch('CLEAN-BATCH', 'Clean Product', 'Clean Brand');
      expect(match).toBeNull();
    });
  });

  describe('verifyConfirmedPack End-to-End Evaluation', () => {
    it('evaluates Verdict 1 (Registered and matches) when all 7 gates pass with mandatory caveat', async () => {
      const result = await verifyConfirmedPack({
        registrationNumber: 'A0-1234',
        isNumberConfirmedByUser: true,
        brand: 'Golden Penny',
        productName: 'Semovita (Fortified Wheat Flour)',
        manufacturer: 'Flour Mills of Nigeria Plc',
        isIdentityConfirmedByUser: true,
        category: 'food',
      });

      expect(result.verdictNumber).toBe(1);
      expect(result.verdictDefinition.title).toBe('Registered and matches');
      expect(result.mandatoryCaveat).toBe(true);
      expect(result.gateChecks.numberConfirmed).toBe(true);
      expect(result.gateChecks.identityConfirmed).toBe(true);
      expect(result.gateChecks.activeRecordFound).toBe(true);
      expect(result.gateChecks.brandMatches).toBe(true);
      expect(result.gateChecks.noAlertApplies).toBe(true);
    });

    it('evaluates Verdict 2 (Matches a NAFDAC alert) when batch matches recall', async () => {
      const result = await verifyConfirmedPack({
        registrationNumber: '04-9999',
        isNumberConfirmedByUser: true,
        brand: 'Legacy Remedies',
        productName: 'Cough Syrup',
        isIdentityConfirmedByUser: true,
        category: 'medicine',
        batchNumber: 'B2024-X9',
        medicineStrength: '100ml',
        isStrengthConfirmedByUser: true,
      });

      expect(result.verdictNumber).toBe(2);
      expect(result.verdictDefinition.title).toBe('Matches a NAFDAC alert');
      expect(result.matchedAlert?.matchedField).toBe('batch_number');
    });

    it('evaluates Verdict 3 (Number problem) when record is expired in source', async () => {
      const result = await verifyConfirmedPack({
        registrationNumber: '04-9999',
        isNumberConfirmedByUser: true,
        brand: 'Legacy Remedies',
        productName: 'Withdrawn Cold Relief Syrup',
        isIdentityConfirmedByUser: true,
        category: 'medicine',
        medicineStrength: '100ml',
        isStrengthConfirmedByUser: true,
      });

      expect(result.verdictNumber).toBe(3);
      expect(result.verdictDefinition.title).toBe('Number problem');
      expect(result.discrepancies.length).toBeGreaterThan(0);
    });

    it('evaluates Verdict 4 (Could not confirm) when user identity is unconfirmed', async () => {
      const result = await verifyConfirmedPack({
        registrationNumber: 'A0-1234',
        isNumberConfirmedByUser: true,
        brand: 'Golden Penny',
        productName: 'Semovita (Fortified Wheat Flour)',
        isIdentityConfirmedByUser: false, // Unconfirmed
        category: 'food',
      });

      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
    });

    it('evaluates Verdict 4 (Could not confirm) for household chemical products (no approved registry in v1)', async () => {
      const result = await verifyConfirmedPack({
        registrationNumber: '02-9988',
        isNumberConfirmedByUser: true,
        brand: 'CleanBrand',
        productName: 'Bleach Solution',
        isIdentityConfirmedByUser: true,
        category: 'household',
      });

      expect(result.verdictNumber).toBe(4);
      expect(result.verdictDefinition.title).toBe('Could not confirm');
      expect(result.flags).toContain('HOUSEHOLD_CATEGORY_LIMITED');
    });
  });
});
