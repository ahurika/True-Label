---
name: prisma-migrations
description: Governs Prisma database schema definitions, relations, indexes, migrations, and idempotent seed management on PostgreSQL/Neon. Use when modifying prisma/schema.prisma, running migrations, or maintaining database seeds.
---

# Prisma Schema & Database Migration Skill

## 1. Purpose
Establishes the standard workflow for modifying and migrating the PostgreSQL database schema using Prisma ORM on Neon Serverless, adhering strictly to the data model constraints defined in PRD v3.1 Section 16.

## 2. When to Use
- Adding or modifying tables, relations, indexes, or enums in `prisma/schema.prisma`.
- Generating and applying database migrations (`prisma migrate dev`, `prisma migrate deploy`).
- Updating or auditing idempotent database seed scripts in `prisma/seed.ts`.
- Planning schema evolutions using the expand-and-contract pattern.

## 3. Prerequisites
- Neon PostgreSQL connection string configured with pooled connection adapters (`DATABASE_URL`, `DIRECT_URL`).
- Prisma CLI installed (`pnpm dlx prisma` or local package).
- Understanding of PRD Section 16 data models and constraints.

## 4. Required Context
- Enums: `RegistryStatus`, `RegistryCoverage`, `RecordCompleteness`, `Category`, `Verdict`, `Outcome`, `Channel`, `EventType`, `AlertMatchType`.
- Key Invariants:
  - `RegistryRecord` must link to `RegistrySource` via foreign key `sourceId` (never loose string names).
  - Uniqueness for registration numbers must be scoped to `[sourceId, category, registrationNumber]`.
  - `ShareRecord` must include an index on `expiresAt` for efficient TTL cleanup.
  - JSON columns (`fieldProvenance`, `evidence`, `confirmedInputs`, `checklist`) must be validated against Zod schemas.

## 5. Step-by-Step Workflow
1. **Schema Definition in `prisma/schema.prisma`**:
   - Declare models matching PRD Section 16: `RegistrySource`, `RegistryRecord`, `ReferenceProduct`, `Alert`, `ShareRecord`, `WhatsAppSession`, `WhatsAppMessage`, `ExtractionLog`, `Event`.
   - Define explicit foreign key relations and cascade behaviors (`onDelete: Restrict` for audit records).
   - Add targeted indexes on query paths (`[category, registrationNumber]`, `[normalizedName]`, `[expiresAt]`).
2. **Validate Schema**:
   - Run `npx prisma validate` and `npx prisma format` to ensure syntactical correctness.
3. **Draft Non-Destructive Migration**:
   - For dev: `npx prisma migrate dev --name <descriptive_change>`.
   - Never drop columns or tables directly in production. Use the expand-and-contract pattern:
     1. Expand: Add new nullable column or table.
     2. Write code to dual-write / read with fallback.
     3. Backfill data.
     4. Contract: Deprecate old column in subsequent release.
4. **Author Idempotent Seed Logic**:
   - In `prisma/seed.ts`, use `prisma.<model>.upsert()` keyed on unique composite identifiers.
   - Load seed data from versioned JSON files containing verified NAFDAC records and alerts.
5. **Verify Neon Driver Adapter**:
   - Ensure Prisma Client initializes with `@prisma/adapter-neon` or pooled connection poolers to prevent connection exhaustion in serverless environments.

## 6. Decision Points
- *Can we add a new category to the `Category` enum?* Only if approved by product governance. Enums in PostgreSQL require careful migration (`ALTER TYPE ... ADD VALUE`).
- *How should high-volume analytics events be cleaned up?* Index `[type, createdAt]` and implement a rolling deletion job (e.g. 90-day retention).

## 7. Safety Checks
- Verify that foreign key constraints exist on all relations.
- Ensure that unique constraints on `registrationNumber` are composite (`[sourceId, category, registrationNumber]`).
- Verify that seeds do not include mock or fictional NAFDAC alerts.

## 8. Testing Requirements
- Test migration application on an ephemeral branch or local PostgreSQL container.
- Test that running `prisma db seed` multiple times produces identical row counts (idempotence).
- Query performance check using `EXPLAIN ANALYZE` for registration number lookups.

## 9. Expected Deliverables
- Fully validated `prisma/schema.prisma`.
- Timestamped SQL migration files in `prisma/migrations/`.
- Executable idempotent seed file `prisma/seed.ts`.

## 10. Definition of Done
- Zero schema validation errors.
- Clean application of migrations on fresh and populated databases.
- Automated seed execution completes without errors or duplicate rows.

## 11. Common Mistakes to Avoid
- Declaring `registrationNumber` as globally unique without scoping to `sourceId` and `category`.
- Storing unvalidated, arbitrary JSON objects in PostgreSQL columns.
- Modifying migration SQL files after they have been pushed to shared environments.
