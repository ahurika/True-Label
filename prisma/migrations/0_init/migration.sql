-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AlertMatchType" AS ENUM ('batch_number', 'affected_pack_name', 'brand_only', 'none');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('medicine', 'device', 'herbal', 'food', 'beverage', 'water', 'cosmetic', 'toothpaste', 'household', 'other');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('web', 'whatsapp');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('scan_started', 'scan_completed', 'field_confirmed', 'field_edited', 'audio_played', 'share_created', 'report_started', 'report_action', 'dispute_submitted', 'typed_number', 'retry', 'error');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('ok', 'low_confidence', 'rejected', 'error');

-- CreateEnum
CREATE TYPE "RecordCompleteness" AS ENUM ('complete', 'incomplete');

-- CreateEnum
CREATE TYPE "RegistryCoverage" AS ENUM ('complete', 'partial', 'none');

-- CreateEnum
CREATE TYPE "RegistryStatus" AS ENUM ('active', 'inactive', 'unknown');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('alert', 'number_problem', 'could_not_confirm', 'registered_matches');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "alertNumber" TEXT NOT NULL,
    "issuedOn" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category",
    "genuineBrands" TEXT[],
    "affectedPackNames" TEXT[],
    "batchNumbers" TEXT[],
    "sourceUrl" TEXT NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "evidence" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "category" "Category",
    "verdict" "Verdict",
    "hasReferenceCard" BOOLEAN,
    "editedFieldCount" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL,
    "pseudonymousId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractionLog" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "outcome" "Outcome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceProduct" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "brand" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "packVariant" TEXT NOT NULL,
    "packSizes" TEXT[],
    "registryRecordId" TEXT,
    "photoDate" TIMESTAMP(3),
    "ingredientsText" TEXT,
    "checklist" JSONB NOT NULL,
    "packMapKey" TEXT NOT NULL,
    "sourceProvenance" JSONB NOT NULL,
    "sourceTier" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryRecord" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT,
    "manufacturer" TEXT,
    "applicant" TEXT,
    "dosageForm" TEXT,
    "activeIngredients" JSONB,
    "status" "RegistryStatus" NOT NULL,
    "registeredUntil" TIMESTAMP(3),
    "completeness" "RecordCompleteness" NOT NULL,
    "normalizedName" TEXT,
    "normalizedBrand" TEXT,
    "normalizedManufacturer" TEXT,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL,
    "fieldProvenance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrySource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "coverage" "RegistryCoverage" NOT NULL,
    "coverageEvidence" TEXT NOT NULL,
    "lookupMethod" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareRecord" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "confirmedInputs" JSONB NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "reasonCodes" JSONB NOT NULL,
    "flags" JSONB NOT NULL,
    "alertEvidence" JSONB NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "sourceDataAsOf" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "messageId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingStatus" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" TEXT NOT NULL,
    "senderHash" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_alertNumber_key" ON "Alert"("alertNumber");

-- CreateIndex
CREATE INDEX "Alert_category_idx" ON "Alert"("category");

-- CreateIndex
CREATE INDEX "Alert_issuedOn_idx" ON "Alert"("issuedOn");

-- CreateIndex
CREATE INDEX "Event_pseudonymousId_createdAt_idx" ON "Event"("pseudonymousId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_type_createdAt_idx" ON "Event"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ExtractionLog_outcome_createdAt_idx" ON "ExtractionLog"("outcome", "createdAt");

-- CreateIndex
CREATE INDEX "ReferenceProduct_category_brand_productName_idx" ON "ReferenceProduct"("category", "brand", "productName");

-- CreateIndex
CREATE INDEX "RegistryRecord_category_registrationNumber_idx" ON "RegistryRecord"("category", "registrationNumber");

-- CreateIndex
CREATE INDEX "RegistryRecord_normalizedName_idx" ON "RegistryRecord"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryRecord_sourceId_category_registrationNumber_key" ON "RegistryRecord"("sourceId", "category", "registrationNumber");

-- CreateIndex
CREATE INDEX "RegistrySource_category_idx" ON "RegistrySource"("category");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrySource_name_category_key" ON "RegistrySource"("name", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ShareRecord_tokenHash_key" ON "ShareRecord"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareRecord_expiresAt_idx" ON "ShareRecord"("expiresAt");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_expiresAt_idx" ON "WhatsAppMessage"("expiresAt");

-- CreateIndex
CREATE INDEX "WhatsAppSession_expiresAt_idx" ON "WhatsAppSession"("expiresAt");

-- CreateIndex
CREATE INDEX "WhatsAppSession_senderHash_expiresAt_idx" ON "WhatsAppSession"("senderHash", "expiresAt");

-- AddForeignKey
ALTER TABLE "ReferenceProduct" ADD CONSTRAINT "ReferenceProduct_registryRecordId_fkey" FOREIGN KEY ("registryRecordId") REFERENCES "RegistryRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryRecord" ADD CONSTRAINT "RegistryRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "RegistrySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
