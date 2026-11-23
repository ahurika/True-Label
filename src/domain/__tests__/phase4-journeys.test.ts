import { describe, it, expect } from 'vitest';
import { verifyConfirmedPack } from '@/lib/db/repository';

describe('Phase 4: Full User Journey Verification (All 8 Scenarios)', () => {
  it('Scenario 1: Confirmed matching registry record (Positive Verdict)', async () => {
    const result = await verifyConfirmedPack({
      registrationNumber: '01-0812',
      isNumberConfirmedByUser: true,
      brand: 'Golden Penny',
      productName: 'Semovita 1kg Pack',
      manufacturer: 'Flour Mills of Nigeria Plc',
      isIdentityConfirmedByUser: true,
      category: 'food',
    });

    expect(result.verdict).toBe('registry_match');
    expect(result.mandatoryCaveat).toBe(true);
    expect(result.gateChecks.activeRecordFound).toBe(true);
    expect(result.gateChecks.brandMatches).toBe(true);
    console.log('[Scenario 1 PASS] registry_match with mandatory caveat.');
  });

  it('Scenario 2: Registration number mismatch (Different product registered)', async () => {
    // 01-0812 belongs to Semovita by Flour Mills, but user enters Gino Tomato Paste
    const result = await verifyConfirmedPack({
      registrationNumber: '01-0812',
      isNumberConfirmedByUser: true,
      brand: 'Gino',
      productName: 'Tomato Paste',
      manufacturer: 'Watanmal Group',
      isIdentityConfirmedByUser: true,
      category: 'food',
    });

    expect(result.verdict).toBe('registration_discrepancy');
    expect(result.discrepancies.length).toBeGreaterThan(0);
    console.log('[Scenario 2 PASS] registration_discrepancy detected (name/brand mismatch).');
  });

  it('Scenario 3: Confirmed safety alert (Priority 1: Matches NAFDAC alert)', async () => {
    // Exact batch match to recall notice
    const result = await verifyConfirmedPack({
      registrationNumber: '04-1234',
      isNumberConfirmedByUser: true,
      brand: 'Legacy Remedies',
      productName: 'Contaminated Cough Syrup 100ml',
      manufacturer: 'Legacy Remedies',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      batchNumber: 'B2024-X9',
      medicineStrength: '100ml',
      isStrengthConfirmedByUser: true,
    });

    expect(result.verdict).toBe('alert_match');
    expect(result.matchedAlert?.matchedField).toBe('batch_number');
    console.log('[Scenario 3 PASS] alert_match: Recall alert takes precedence over registry.');
  });

  it('Scenario 4: Brand-only alert match (Informational flag, not an alert verdict)', async () => {
    // Brand 'Legacy Remedies' has an alert, but batch 'CLEAN-999' is not affected
    const result = await verifyConfirmedPack({
      registrationNumber: '01-0812',
      isNumberConfirmedByUser: true,
      brand: 'Legacy Remedies',
      productName: 'Semovita 1kg Pack',
      manufacturer: 'Flour Mills of Nigeria Plc',
      isIdentityConfirmedByUser: true,
      category: 'food',
      batchNumber: 'CLEAN-999',
    });

    // Alert flag is present
    expect(result.flags.some(f => f.includes('ALERT_ON_BRAND'))).toBe(true);
    console.log('[Scenario 4 PASS] Brand-only alert produces informational advisory without false recall.');
  });

  it('Scenario 5: Unknown registration number (Partial source fallback: could_not_confirm)', async () => {
    const result = await verifyConfirmedPack({
      registrationNumber: '99-8877',
      isNumberConfirmedByUser: true,
      brand: 'Unlisted Brand',
      productName: 'Unlisted Product',
      manufacturer: 'Unlisted Maker',
      isIdentityConfirmedByUser: true,
      category: 'food',
    });

    expect(result.verdict).toBe('could_not_confirm');
    expect(result.explanation).toContain('curated statutory reference');
    console.log('[Scenario 5 PASS] could_not_confirm returned honestly for unknown number in partial dataset.');
  });

  it('Scenario 6: Inactive/Expired record (Number problem / Discrepancy)', async () => {
    // 04-9999 is expired/inactive in curated registry
    const result = await verifyConfirmedPack({
      registrationNumber: '04-9999',
      isNumberConfirmedByUser: true,
      brand: 'Legacy Remedies',
      productName: 'Withdrawn Cold Relief Syrup',
      manufacturer: 'Defunct Laboratories Nigeria',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      medicineStrength: '100ml',
      isStrengthConfirmedByUser: true,
    });

    expect(result.verdict).toBe('registration_discrepancy');
    expect(result.discrepancies.some(d => d.toLowerCase().includes('expired') || d.toLowerCase().includes('inactive'))).toBe(true);
    console.log('[Scenario 6 PASS] registration_discrepancy returned for inactive/expired record.');
  });

  it('Scenario 7: Manually entered product details (Unreviewed record safely fails closed to could_not_confirm)', async () => {
    // User types unreviewed Emzor Paracetamol 500mg (04-0411)
    const result = await verifyConfirmedPack({
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol Tablets 500mg',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      medicineStrength: '500mg',
      isStrengthConfirmedByUser: true,
    });

    // Unreviewed record cannot produce registry_match; must fail closed to could_not_confirm
    expect(result.verdict).toBe('could_not_confirm');
    expect(result.reasonCode).toBe('UNCONFIRMED_RECORD_INCOMPLETE');
    expect(result.explanation).toContain('unverified');
    console.log('[Scenario 7 PASS] Unreviewed 04-0411 safely fails closed to could_not_confirm without authenticated audit.');
  });

  it('Scenario 8: Unconfirmed registration number (Safety gate fails closed)', async () => {
    const result = await verifyConfirmedPack({
      registrationNumber: '01-0812',
      isNumberConfirmedByUser: false, // NOT confirmed
      brand: 'Golden Penny',
      productName: 'Semovita 1kg Pack',
      manufacturer: 'Flour Mills of Nigeria Plc',
      isIdentityConfirmedByUser: true,
      category: 'food',
    });

    expect(result.verdict).toBe('could_not_confirm');
    expect(result.gateChecks.numberConfirmed).toBe(false);
    console.log('[Scenario 8 PASS] Unconfirmed number fails closed to could_not_confirm.');
  });

  it('Scenario 9: Unreviewed statutory records fail closed without false discrepancy accusations', async () => {
    // 9A. Unreviewed Green Book record (04-0411) cannot prove manufacturer discrepancy and fails closed
    const unreviewedDiscrepancy = await verifyConfirmedPack({
      registrationNumber: '04-0411',
      isNumberConfirmedByUser: true,
      brand: 'Counterfeit Pharma',
      productName: 'Counterfeit Paracetamol 500mg',
      manufacturer: 'Counterfeit Chemical Works Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      medicineStrength: '500mg',
      isStrengthConfirmedByUser: true,
    });

    expect(unreviewedDiscrepancy.verdict).toBe('could_not_confirm');
    expect(unreviewedDiscrepancy.reasonCode).toBe('UNCONFIRMED_RECORD_INCOMPLETE');
    console.log('[Scenario 9A PASS] Unreviewed 04-0411 safely fails closed to could_not_confirm without public accusation.');

    // 9B. Historical record (04-1234) lacks verified Green Book detail page: cannot prove discrepancy, fails closed to could_not_confirm
    const historicalResult = await verifyConfirmedPack({
      registrationNumber: '04-1234',
      isNumberConfirmedByUser: true,
      brand: 'Emzor',
      productName: 'Paracetamol 500mg Tablets',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      isIdentityConfirmedByUser: true,
      category: 'medicine',
      medicineStrength: '500mg',
      isStrengthConfirmedByUser: true,
    });

    expect(historicalResult.verdict).toBe('could_not_confirm');
    expect(historicalResult.explanation).toContain('historical or unverified');
    console.log('[Scenario 9B PASS] Unverified historical 04-1234 honestly returns could_not_confirm without false public accusation.');
  });
});
