import {
  PrismaClient,
  Category,
  RegistryCoverage,
  RegistryStatus,
  RecordCompleteness,
  EvidenceClassification,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding curated NAFDAC registry sources and records with evidence classification...');

  // 1. Food Registry Source (Curated Snapshot / Prototype)
  const foodSource = await prisma.registrySource.upsert({
    where: {
      name_category: {
        name: 'NAFDAC Registered Food Products Gazette',
        category: Category.food,
      },
    },
    update: {
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of registered food products from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/food-registry',
      lastCheckedAt: new Date('2026-10-15T00:00:00Z'),
    },
    create: {
      name: 'NAFDAC Registered Food Products Gazette',
      category: Category.food,
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of registered food products from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/food-registry',
      lastCheckedAt: new Date('2026-10-15T00:00:00Z'),
    },
  });

  // 2. Medicine Registry Source (Official NAFDAC Green Book)
  const medicineSource = await prisma.registrySource.upsert({
    where: {
      name_category: {
        name: 'NAFDAC Registered Human Medicines (Green Book)',
        category: Category.medicine,
      },
    },
    update: {
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Official database of registered human pharmaceutical products verified against NAFDAC Green Book.',
      lookupMethod: 'greenbook_search',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/',
      lastCheckedAt: new Date('2026-11-23T00:00:00Z'),
    },
    create: {
      name: 'NAFDAC Registered Human Medicines (Green Book)',
      category: Category.medicine,
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Official database of registered human pharmaceutical products verified against NAFDAC Green Book.',
      lookupMethod: 'greenbook_search',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/',
      lastCheckedAt: new Date('2026-11-23T00:00:00Z'),
    },
  });

  // 3. Seed Official Green Book Medicine Records (Awaiting Independent Human Review)
  // Emzor Paracetamol 500mg Tablets — 04-0411 (Official Green Book details/5863)
  // Preserves genuine Green Book product details, but classified as unverified_record
  // and isProductionEligible: false because no independent human audit event has taken place.
  await prisma.registryRecord.upsert({
    where: {
      sourceId_category_registrationNumber: {
        sourceId: medicineSource.id,
        category: Category.medicine,
        registrationNumber: '04-0411',
      },
    },
    update: {
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: RegistryStatus.active,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg' },
      registeredUntil: new Date('2028-03-27T00:00:00Z'), // Green Book current registration date
      completeness: RecordCompleteness.complete,
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      retrievedAt: new Date('2026-11-23T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-23T00:00:00Z'),
      verifiedAt: null,
      verifiedBy: null,
      evidenceClassification: EvidenceClassification.unverified_record,
      isProductionEligible: false,
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
        officialDetailUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
        activeIngredients: 'Paracetamol 500mg',
        attestationStatus: 'Unreviewed: Pending independent auditor review',
      },
    },
    create: {
      registrationNumber: '04-0411',
      category: Category.medicine,
      productName: 'Paracetamol Tablets 500mg',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: RegistryStatus.active,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg' },
      registeredUntil: new Date('2028-03-27T00:00:00Z'),
      completeness: RecordCompleteness.complete,
      sourceId: medicineSource.id,
      sourceUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
      retrievedAt: new Date('2026-11-23T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-23T00:00:00Z'),
      verifiedAt: null,
      verifiedBy: null,
      evidenceClassification: EvidenceClassification.unverified_record,
      isProductionEligible: false,
      fieldProvenance: {
        registrationNumber: 'Official NAFDAC Green Book (04-0411)',
        productName: 'Carton and blister pack label',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd, Ajao Estate, Lagos',
        officialDetailUrl: 'https://greenbook.nafdac.gov.ng/products/details/5863',
        activeIngredients: 'Paracetamol 500mg',
        attestationStatus: 'Unreviewed: Pending independent auditor review',
      },
    },
  });

  // Medik-55 Tablet (Paracetamol/Caffeine) — 04-1234 (Swiss Pharma Nigeria Ltd)
  // Historical record without Green Book product detail page (ineligible for production positive match)
  await prisma.registryRecord.upsert({
    where: {
      sourceId_category_registrationNumber: {
        sourceId: medicineSource.id,
        category: Category.medicine,
        registrationNumber: '04-1234',
      },
    },
    update: {
      productName: 'Medik-55 Tablet (Paracetamol/Caffeine)',
      brand: 'Medik-55',
      manufacturer: 'Swiss Pharma Nigeria Ltd',
      status: RegistryStatus.unknown,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg', caffeine: '30mg' },
      registeredUntil: null,
      completeness: RecordCompleteness.complete,
      sourceUrl: 'https://nafdac.gov.ng/drug-registry',
      retrievedAt: new Date('2026-10-20T00:00:00Z'),
      lastVerifiedAt: new Date('2026-10-20T00:00:00Z'),
      evidenceClassification: EvidenceClassification.historical_official_record,
      isProductionEligible: false,
      fieldProvenance: {
        registrationNumber: 'Historical NAFDAC Drug Gazette (No live Green Book product-level detail page)',
        productName: 'Historical gazette publication',
        manufacturer: 'Swiss Pharma Nigeria Ltd',
        disclaimer: 'Historical gazette entry. Current registration status is unverified without live Green Book product detail confirmation. Ineligible for production positive match.',
      },
    },
    create: {
      registrationNumber: '04-1234',
      category: Category.medicine,
      productName: 'Medik-55 Tablet (Paracetamol/Caffeine)',
      brand: 'Medik-55',
      manufacturer: 'Swiss Pharma Nigeria Ltd',
      status: RegistryStatus.unknown,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg', caffeine: '30mg' },
      registeredUntil: null,
      completeness: RecordCompleteness.complete,
      sourceId: medicineSource.id,
      sourceUrl: 'https://nafdac.gov.ng/drug-registry',
      retrievedAt: new Date('2026-10-20T00:00:00Z'),
      lastVerifiedAt: new Date('2026-10-20T00:00:00Z'),
      evidenceClassification: EvidenceClassification.historical_official_record,
      isProductionEligible: false,
      fieldProvenance: {
        registrationNumber: 'Historical NAFDAC Drug Gazette (No live Green Book product-level detail page)',
        productName: 'Historical gazette publication',
        manufacturer: 'Swiss Pharma Nigeria Ltd',
        disclaimer: 'Historical gazette entry. Current registration status is unverified without live Green Book product detail confirmation. Ineligible for production positive match.',
      },
    },
  });

  // 4. Seed Synthetic Test Fixtures (Class 3 - For Dev/Tests Only, Ineligible for Production Match)
  await prisma.registryRecord.upsert({
    where: {
      sourceId_category_registrationNumber: {
        sourceId: foodSource.id,
        category: Category.food,
        registrationNumber: '01-0812',
      },
    },
    update: {
      productName: 'Semovita 1kg Pack',
      brand: 'Golden Penny',
      manufacturer: 'Flour Mills of Nigeria Plc',
      status: RegistryStatus.active,
      completeness: RecordCompleteness.complete,
      sourceUrl: foodSource.sourceUrl,
      retrievedAt: new Date('2026-10-15T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isProductionEligible: false,
      fieldProvenance: {
        fixtureType: 'synthetic_test_fixture',
        disclaimer: 'Synthetic test fixture for development and testing only. Not an official NAFDAC record.',
      },
    },
    create: {
      registrationNumber: '01-0812',
      category: Category.food,
      productName: 'Semovita 1kg Pack',
      brand: 'Golden Penny',
      manufacturer: 'Flour Mills of Nigeria Plc',
      status: RegistryStatus.active,
      completeness: RecordCompleteness.complete,
      sourceId: foodSource.id,
      sourceUrl: foodSource.sourceUrl,
      retrievedAt: new Date('2026-10-15T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isProductionEligible: false,
      fieldProvenance: {
        fixtureType: 'synthetic_test_fixture',
        disclaimer: 'Synthetic test fixture for development and testing only. Not an official NAFDAC record.',
      },
    },
  });

  await prisma.registryRecord.upsert({
    where: {
      sourceId_category_registrationNumber: {
        sourceId: foodSource.id,
        category: Category.food,
        registrationNumber: 'A0-1234',
      },
    },
    update: {
      productName: 'Semovita (Fortified Wheat Flour)',
      brand: 'Golden Penny',
      manufacturer: 'Flour Mills of Nigeria Plc',
      status: RegistryStatus.active,
      completeness: RecordCompleteness.complete,
      sourceUrl: foodSource.sourceUrl,
      retrievedAt: new Date('2026-10-15T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isProductionEligible: false,
      fieldProvenance: {
        fixtureType: 'synthetic_test_fixture',
        disclaimer: 'Synthetic test fixture for development and testing only. Not an official NAFDAC record.',
      },
    },
    create: {
      registrationNumber: 'A0-1234',
      category: Category.food,
      productName: 'Semovita (Fortified Wheat Flour)',
      brand: 'Golden Penny',
      manufacturer: 'Flour Mills of Nigeria Plc',
      status: RegistryStatus.active,
      completeness: RecordCompleteness.complete,
      sourceId: foodSource.id,
      sourceUrl: foodSource.sourceUrl,
      retrievedAt: new Date('2026-10-15T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isProductionEligible: false,
      fieldProvenance: {
        fixtureType: 'synthetic_test_fixture',
        disclaimer: 'Synthetic test fixture for development and testing only. Not an official NAFDAC record.',
      },
    },
  });

  // 5. Seed Synthetic Test Fixtures: Public Recall Alerts (Dev/Testing Only)
  await prisma.alert.upsert({
    where: { alertNumber: 'Notice No. 2026/088' },
    update: {
      title: 'NAFDAC Alert No. 2026/088: Recall of Contaminated Cough Syrup [Synthetic Test Fixture]',
      issuedOn: new Date('2026-09-10T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Legacy Remedies', 'SafeCough'],
      affectedPackNames: ['Contaminated Cough Syrup 100ml', 'Toxic Cough Mixture 100ml'],
      batchNumbers: ['B2024-X9', 'CS-2024-001', 'SYR-9981'],
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      retrievedAt: new Date('2026-09-11T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isSyntheticFixture: true,
      isProductionEligible: false,
      evidence: {
        finding: 'Synthetic test fixture for recall flow verification. Not an official NAFDAC notice.',
        disclaimer: 'Synthetic test fixture for automated testing only. Ineligible for production alert matching.',
      },
    },
    create: {
      alertNumber: 'Notice No. 2026/088',
      title: 'NAFDAC Alert No. 2026/088: Recall of Contaminated Cough Syrup [Synthetic Test Fixture]',
      issuedOn: new Date('2026-09-10T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Legacy Remedies', 'SafeCough'],
      affectedPackNames: ['Contaminated Cough Syrup 100ml', 'Toxic Cough Mixture 100ml'],
      batchNumbers: ['B2024-X9', 'CS-2024-001', 'SYR-9981'],
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      retrievedAt: new Date('2026-09-11T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isSyntheticFixture: true,
      isProductionEligible: false,
      evidence: {
        finding: 'Synthetic test fixture for recall flow verification. Not an official NAFDAC notice.',
        disclaimer: 'Synthetic test fixture for automated testing only. Ineligible for production alert matching.',
      },
    },
  });

  await prisma.alert.upsert({
    where: { alertNumber: 'Notice No. 2025/112' },
    update: {
      title: 'NAFDAC Alert No. 2025/112: Substandard Paracetamol Batch Alert [Synthetic Test Fixture]',
      issuedOn: new Date('2025-11-04T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Emzor'],
      affectedPackNames: ['Emzor Paracetamol Batch EMZ-9988'],
      batchNumbers: ['EMZ-9988', 'EP-9988-X'],
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      retrievedAt: new Date('2025-11-05T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isSyntheticFixture: true,
      isProductionEligible: false,
      evidence: {
        finding: 'Synthetic test fixture for batch recall verification. Not an official NAFDAC notice.',
        disclaimer: 'Synthetic test fixture for automated testing only. Ineligible for production alert matching.',
      },
    },
    create: {
      alertNumber: 'Notice No. 2025/112',
      title: 'NAFDAC Alert No. 2025/112: Substandard Paracetamol Batch Alert [Synthetic Test Fixture]',
      issuedOn: new Date('2025-11-04T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Emzor'],
      affectedPackNames: ['Emzor Paracetamol Batch EMZ-9988'],
      batchNumbers: ['EMZ-9988', 'EP-9988-X'],
      sourceUrl: 'https://nafdac.gov.ng/category/public-alerts',
      retrievedAt: new Date('2025-11-05T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidenceClassification: EvidenceClassification.synthetic_test_fixture,
      isSyntheticFixture: true,
      isProductionEligible: false,
      evidence: {
        finding: 'Synthetic test fixture for batch recall verification. Not an official NAFDAC notice.',
        disclaimer: 'Synthetic test fixture for automated testing only. Ineligible for production alert matching.',
      },
    },
  });

  console.log('[Seed] Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
