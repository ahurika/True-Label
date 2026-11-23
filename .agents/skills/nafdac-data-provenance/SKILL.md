---
name: nafdac-data-provenance
description: Establishes the official source-data curation, field-level provenance, registry coverage semantics, and alert evidence verification workflows. Use when seeding registry records, adding reference cards, verifying NAFDAC alerts, or auditing source permissions.
---

# NAFDAC Data Provenance & Evidence Curation Skill

## 1. Purpose
Governs the discovery, verification, manual seeding, and provenance tracking of official NAFDAC registry records, public recall alerts, and brand reference products in accordance with PRD v3.1 Section 7, Section 8, and Section 21.

## 2. When to Use
- Adding or updating records in `RegistryRecord` or `RegistrySource`.
- Ingesting and verifying NAFDAC public counterfeit/recall notices in `Alert`.
- Curating reference product cards (`ReferenceProduct`) and schematic pack maps.
- Auditing source coverage status (`complete`, `partial`, `none`) and freshness dates.

## 3. Prerequisites
- Access to official NAFDAC source portals (NAPAMS, Greenbook) or official NAFDAC public alert PDF/web publications.
- Prisma seed script (`prisma/seed.ts`) and data schemas.
- Understanding of the separation between source coverage and record completeness (PRD Section 5.2).

## 4. Required Context
- Absolute Invariant: **No automated scraping or bulk harvesting** without explicit written permission (PRD Section 8).
- Zero Fabricated Data: Never invent registration numbers, mock alerts, or fictitious brands.
- Freshness thresholds:
  - Registry records & reference cards: Show stale notice after **90 days**.
  - Alert index: Show stale notice after **14 days**; reviewed weekly.
- Source Tiers:
  - Tier 1: NAFDAC official portal/alert (authoritative).
  - Tier 2: Brand-provided with written permission (labeled as brand-provided; cannot override verdicts).
  - Tier 3: Team-verified physical retail purchase (appearance only, not proof of contents).

## 5. Step-by-Step Workflow
1. **Source Discovery & Permission Check**:
   - Confirm official NAFDAC source URL and terms of use (Blocker B-02).
   - If using brand references, confirm written brand agreement on file.
2. **Assign Source Coverage Semantics**:
   - Assign `RegistryCoverage` to the `RegistrySource`:
     - `complete`: Verified exhaustive directory for category (absence implies non-registration).
     - `partial`: Curated seed list (matches confirm record; absence never proves non-registration).
     - `none`: No usable registry exists (household category).
3. **Curate Individual Record with Field-Level Provenance**:
   - Extract `registrationNumber`, `productName`, `brand`, `manufacturer`, `dosageForm`, `activeIngredients`.
   - Record exact `sourceUrl`, `retrievedAt`, `lastVerifiedAt`, and `verifier` identity.
   - Attach `fieldProvenance` JSON specifying whether each field was verified against official gazette, NAPAMS portal, or physical pack.
4. **Curate Public Alert Record**:
   - Extract `alertNumber`, `issuedOn`, `title`, `affectedPackNames`, `batchNumbers`, and `sourceUrl`.
   - Store exact matchable batch numbers and affected product strings.
   - Record `evidence` JSON containing alert text quotes and specific counterfeit indicators.
5. **Idempotent Seed Integration**:
   - Add record to `prisma/seed/` using deterministic IDs or composite natural keys (`[sourceId, category, registrationNumber]`).
   - Run seed script and verify checksums.

## 6. Decision Points
- *Can we add an alert reported in a newspaper?* No. News reports are discovery leads only. Wait until the official NAFDAC alert publication is obtained and recorded.
- *Can absence in a partial source trigger Number problem?* Absolutely not. Only complete sources permit absence-based number problems.

## 7. Safety Checks
- Verify that every seeded record has a live, valid `sourceUrl` and recent `lastVerifiedAt` timestamp.
- Ensure no community-uploaded or unverified crowdsourced images are accepted as Tier 1 or Tier 2 references.
- Confirm household products are marked `coverage: none`.

## 8. Testing Requirements
- Unit tests validating that seed files parse cleanly against Prisma schema.
- Regression tests ensuring that updated alert batches correctly link to test packaging fixtures.
- Freshness checks verifying that stale-date notices trigger appropriately when dates exceed 90 days.

## 9. Expected Deliverables
- Validated seed data files in `prisma/seed/`.
- Updated source inventory in `docs/product-governance/PRD_TRACEABILITY.md`.
- Field-level provenance audit logs.

## 10. Definition of Done
- All records traceable to an official public URL or verified brand agreement.
- Zero invented or mock NAFDAC records.
- Source coverage correctly configured and tested against absence logic.

## 11. Common Mistakes to Avoid
- Running automated web scrapers against official government domains without authorization.
- Treating news article claims as authoritative regulatory records.
- Advancing `lastVerifiedAt` dates without an actual verification check.
