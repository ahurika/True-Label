---
trigger: glob
globs: ["prisma/**/*.prisma", "src/db/**/*.ts", "src/repositories/**/*.ts", "prisma/seed/**/*.ts", "prisma/migrations/**/*"]
description: Governs Prisma database schema, data integrity, migrations, and provenance tracking
---

# Data Architecture & Prisma Rules

## 1. Schema Integrity & Prisma Constraints (PRD Section 16)
- Every `RegistryRecord` must link to a valid `RegistrySource` via foreign key `sourceId`. Free-form unconstrained string source names are prohibited.
- Unique constraints on registration numbers must be scoped to `[sourceId, category, registrationNumber]`, acknowledging that different agencies or categories may reuse numbering schemes.
- All JSON columns (e.g. `fieldProvenance`, `checklist`, `evidence`, `confirmedInputs`) must have corresponding Zod schema validation at the repository boundary.
- All enums (`RegistryStatus`, `RegistryCoverage`, `RecordCompleteness`, `Category`, `Verdict`, `Outcome`, `Channel`, `EventType`, `AlertMatchType`) must match PRD Section 16 exactly.

## 2. Field-Level Provenance
Every record must track provenance:
- Exact `sourceUrl` and `retrievedAt` timestamp.
- `lastVerifiedAt` timestamp and verifier identity.
- Individual field provenance metadata indicating whether brand, manufacturer, and ingredients were directly transcribed from official portals or verified pack physical purchases.

## 3. Safe Migrations & PostgreSQL Standards
- Migrations must be non-destructive and backward-compatible (expand-and-contract pattern).
- Indexes must support common lookup patterns (`[category, registrationNumber]`, `[normalizedName]`, `[expiresAt]`).
- Do not run raw destructive SQL scripts or table drops in production.

## 4. Idempotent Seeds & Zero Fabricated Data
- Seed scripts (`prisma/seed.ts`) must be completely idempotent (upsert based on natural unique keys).
- Never insert fabricated, invented, or fake NAFDAC registration numbers, alerts, or manufacturer details into database seeds. Seed data must originate from officially documented sources or verified reference packs.

## 5. Automated Data Lifecycle & TTL Enforcement
- Scheduled tasks (e.g. Vercel Cron) must enforce data retention policies:
  - Clean up expired `ShareRecord` entries (> 30 days).
  - Clean up expired `WhatsAppSession` records (> 30 minutes).
  - Clean up expired `WhatsAppMessage` deduplication entries.
