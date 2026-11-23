-- CreateEnum
CREATE TYPE "EvidenceClassification" AS ENUM ('independently_verified_official', 'historical_official_record', 'synthetic_test_fixture', 'unverified_record');

-- AlterTable
ALTER TABLE "RegistryRecord" ADD COLUMN "evidenceClassification" "EvidenceClassification" NOT NULL DEFAULT 'unverified_record',
ADD COLUMN "isProductionEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN "evidenceClassification" "EvidenceClassification" NOT NULL DEFAULT 'unverified_record',
ADD COLUMN "isSyntheticFixture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isProductionEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedBy" TEXT;

-- CreateIndex
CREATE INDEX "RegistryRecord_evidenceClassification_idx" ON "RegistryRecord"("evidenceClassification");

-- CreateIndex
CREATE INDEX "RegistryRecord_isProductionEligible_idx" ON "RegistryRecord"("isProductionEligible");

-- CreateIndex
CREATE INDEX "Alert_evidenceClassification_idx" ON "Alert"("evidenceClassification");

-- CreateIndex
CREATE INDEX "Alert_isSyntheticFixture_idx" ON "Alert"("isSyntheticFixture");

-- CreateIndex
CREATE INDEX "Alert_isProductionEligible_idx" ON "Alert"("isProductionEligible");

-- Data-migration safeguard: Explicitly ensure all existing rows in RegistryRecord and Alert are set to unverified and ineligible
UPDATE "RegistryRecord" SET "evidenceClassification" = 'unverified_record', "isProductionEligible" = false, "verifiedAt" = NULL, "verifiedBy" = NULL;
UPDATE "Alert" SET "evidenceClassification" = 'unverified_record', "isSyntheticFixture" = false, "isProductionEligible" = false, "verifiedAt" = NULL, "verifiedBy" = NULL;

-- Known synthetic alert fixture Notice 2026/088 is explicitly marked as synthetic
UPDATE "Alert" SET "isSyntheticFixture" = true, "evidenceClassification" = 'synthetic_test_fixture' WHERE "alertNumber" = 'Notice No. 2026/088';
