import { PrismaClient, Category, RegistryCoverage, RegistryStatus, RecordCompleteness } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding curated NAFDAC registry sources and records...');

  // 1. Food Registry Source
  const foodSource = await prisma.registrySource.upsert({
    where: {
      name_category: {
        name: 'NAFDAC Registered Food Products Gazette',
        category: Category.food,
      },
    },
    update: {
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of official registered food products from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/food-registry',
      lastCheckedAt: new Date('2026-10-15T00:00:00Z'),
    },
    create: {
      name: 'NAFDAC Registered Food Products Gazette',
      category: Category.food,
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of official registered food products from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/food-registry',
      lastCheckedAt: new Date('2026-10-15T00:00:00Z'),
    },
  });

  // 2. Medicine Registry Source
  const medicineSource = await prisma.registrySource.upsert({
    where: {
      name_category: {
        name: 'NAFDAC Registered Human Medicines and Medical Devices',
        category: Category.medicine,
      },
    },
    update: {
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of official registered medicines verified from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/drug-registry',
      lastCheckedAt: new Date('2026-10-20T00:00:00Z'),
    },
    create: {
      name: 'NAFDAC Registered Human Medicines and Medical Devices',
      category: Category.medicine,
      coverage: RegistryCoverage.partial,
      coverageEvidence: 'Curated snapshot of official registered medicines verified from NAFDAC gazette.',
      lookupMethod: 'curated_index',
      sourceUrl: 'https://nafdac.gov.ng/drug-registry',
      lastCheckedAt: new Date('2026-10-20T00:00:00Z'),
    },
  });

  // 3. Seed Food Records
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
      fieldProvenance: {
        registrationNumber: 'NAFDAC Gazette 2026',
        productName: 'Pack front and carton label',
        brand: 'FMN registered trademark',
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
      fieldProvenance: {
        registrationNumber: 'NAFDAC Gazette 2026',
        productName: 'Pack front and carton label',
        brand: 'FMN registered trademark',
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
      fieldProvenance: {
        registrationNumber: 'NAFDAC Gazette 2026',
        productName: 'Pack front label',
        brand: 'FMN registered trademark',
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
      fieldProvenance: {
        registrationNumber: 'NAFDAC Gazette 2026',
        productName: 'Pack front label',
        brand: 'FMN registered trademark',
      },
    },
  });

  // 4. Seed Medicine Records
  await prisma.registryRecord.upsert({
    where: {
      sourceId_category_registrationNumber: {
        sourceId: medicineSource.id,
        category: Category.medicine,
        registrationNumber: '04-1234',
      },
    },
    update: {
      productName: 'Paracetamol 500mg Tablets',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: RegistryStatus.active,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg' },
      completeness: RecordCompleteness.complete,
      sourceUrl: medicineSource.sourceUrl,
      retrievedAt: new Date('2026-10-20T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      fieldProvenance: {
        registrationNumber: 'NAFDAC Drug Gazette 2026',
        productName: 'Printed carton and blister pack',
        activeIngredients: 'Verified chemical formula',
      },
    },
    create: {
      registrationNumber: '04-1234',
      category: Category.medicine,
      productName: 'Paracetamol 500mg Tablets',
      brand: 'Emzor',
      manufacturer: 'Emzor Pharmaceutical Industries Ltd',
      status: RegistryStatus.active,
      dosageForm: 'Tablet',
      activeIngredients: { paracetamol: '500mg' },
      completeness: RecordCompleteness.complete,
      sourceId: medicineSource.id,
      sourceUrl: medicineSource.sourceUrl,
      retrievedAt: new Date('2026-10-20T00:00:00Z'),
      lastVerifiedAt: new Date('2026-11-01T00:00:00Z'),
      fieldProvenance: {
        registrationNumber: 'NAFDAC Drug Gazette 2026',
        productName: 'Printed carton and blister pack',
        activeIngredients: 'Verified chemical formula',
      },
    },
  });

  // 5. Seed Public Alerts
  await prisma.alert.upsert({
    where: { alertNumber: 'Notice No. 2026/088' },
    update: {
      title: 'NAFDAC Alert No. 2026/088: Recall of Contaminated Cough Syrup',
      issuedOn: new Date('2026-09-10T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Legacy Remedies', 'SafeCough'],
      affectedPackNames: ['Contaminated Cough Syrup 100ml', 'Toxic Cough Mixture 100ml'],
      batchNumbers: ['B2024-X9', 'CS-2024-001', 'SYR-9981'],
      sourceUrl: 'https://nafdac.gov.ng/alerts/2026-088-recall',
      retrievedAt: new Date('2026-09-11T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidence: {
        finding: 'Diethylene glycol contamination above permissible limit',
      },
    },
    create: {
      alertNumber: 'Notice No. 2026/088',
      title: 'NAFDAC Alert No. 2026/088: Recall of Contaminated Cough Syrup',
      issuedOn: new Date('2026-09-10T00:00:00Z'),
      category: Category.medicine,
      genuineBrands: ['Legacy Remedies', 'SafeCough'],
      affectedPackNames: ['Contaminated Cough Syrup 100ml', 'Toxic Cough Mixture 100ml'],
      batchNumbers: ['B2024-X9', 'CS-2024-001', 'SYR-9981'],
      sourceUrl: 'https://nafdac.gov.ng/alerts/2026-088-recall',
      retrievedAt: new Date('2026-09-11T00:00:00Z'),
      lastCheckedAt: new Date('2026-11-15T00:00:00Z'),
      evidence: {
        finding: 'Diethylene glycol contamination above permissible limit',
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
