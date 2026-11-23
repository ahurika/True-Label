---
name: implement-verdict-engine
description: Guides the implementation of TrueLabel's deterministic, prioritized verdict selection engine. Use when coding, updating, or testing the core business logic that determines the verification verdict from confirmed inputs, registry records, and public alerts.
---

# Implement Verdict Engine Skill

## 1. Purpose
Defines the authoritative engineering workflow for implementing the deterministic verdict engine according to PRD v3.1 Section 5 and Section 10.4. Ensures that verdicts are computed strictly by pure TypeScript logic without any AI involvement.

## 2. When to Use
- Implementing or modifying `src/domain/verdict/engine.ts`.
- Updating registration number normalization or comparison algorithms.
- Adding or refining public alert matching rules.
- Writing unit test suites for verdict branches, edge cases, and golden fixtures.

## 3. Prerequisites
- Familiarity with the 4 prioritized verdict states and their triggers.
- Understanding of the positive verdict evidence gate (PRD Section 5.1).
- Understanding of registry coverage semantics (`complete`, `partial`, `none`).

## 4. Required Context
- Absolute Invariant: **AI never selects or overrides a verdict.** The engine is pure, synchronous, deterministic code.
- Precedence order:
  1. `Matches a NAFDAC alert`
  2. `Number problem`
  3. `Could not confirm`
  4. `Registered and matches`
- Partial source coverage can NEVER support an absence-based `Number problem`.
- Household products can NEVER receive `Registered and matches`.

## 5. Step-by-Step Workflow
1. **Define Input Data Contract**: Create typed Zod schemas for `VerdictInputs`, containing confirmed pack fields, candidate registry record, source metadata, alert matches, and user confirmations.
2. **Implement Normalization Library**:
   - Create field-specific normalizers (`normalizeRegistrationNumber`, `normalizeBrandName`, `normalizeDate`).
   - Store normalized values separately while preserving raw printed strings.
3. **Evaluate Rule 1 (Matches a NAFDAC Alert)**:
   - Check if confirmed batch number exactly matches an active alert batch number, OR
   - Check if confirmed product name matches an affected-pack name explicitly listed in an alert.
   - If match found, record `alertId`, `matchedField`, `matchedValue`, and `matcherRule`, then return `Verdict.ALERT`.
   - If brand-only matches, append informational flag `Alert on this brand` and continue.
4. **Evaluate Rule 2 (Number Problem)**:
   - Check if registration number format is invalid for category.
   - Check if matched registry record has conflicting brand/product/manufacturer details.
   - Check if record status is explicitly expired or inactive.
   - If registry source coverage is `complete` and record is not found, return `Verdict.NUMBER_PROBLEM`.
   - *Guard*: If source coverage is `partial` or `none`, DO NOT return `Number problem` for absence.
5. **Evaluate Rule 3 (Could Not Confirm)**:
   - Check if critical identity fields (registration number, brand, product name) are unconfirmed or unreadable.
   - Check if category has no approved registry source (`coverage: none`) or source lookup timed out.
   - Check if product category is `household` (household cannot receive positive match).
   - If any condition met, return `Verdict.COULD_NOT_CONFIRM`.
6. **Evaluate Rule 4 (Registered and Matches Gate)**:
   - Validate all 7 conditions of PRD Section 5.1:
     1. Verified active source record exists with provenance and checked date.
     2. Registration number confirmed by user and matches record exactly.
     3. Brand, product name, and manufacturer confirmed and match record.
     4. Record status is active and not expired.
     5. Category/source approved for positive match.
     6. Zero active alerts on pack.
     7. Attach mandatory copied-number disclaimer.
   - If all pass, return `Verdict.REGISTERED_MATCHES`. Otherwise, fall back to `Verdict.COULD_NOT_CONFIRM`.

## 6. Decision Points
- *Can a high Levenshtein similarity to an alert trigger an Alert verdict?* No. Alert verdicts require an exact batch match or an exact/approved affected-pack name match. Similarity alone produces a warning flag, not an alert verdict.
- *What if the expiry date has passed?* Expiry sets the `Expired` flag and warning notice; it does not change the registration verdict state.

## 7. Safety Checks
- Verify that `Verdict.REGISTERED_MATCHES` cannot be emitted if registration number is unconfirmed.
- Verify that `Verdict.REGISTERED_MATCHES` cannot be emitted for household products.
- Ensure that the returned verdict object includes `engineVersion`, `sourceDataAsOf`, `reasonCodes`, and `flags`.

## 8. Testing Requirements
- 100% branch test coverage across all 4 verdict paths.
- Negative tests verifying that partial registry absence returns `Could not confirm`.
- Golden test fixtures for every seeded NAFDAC alert and test product.

## 9. Expected Deliverables
- `src/domain/verdict/engine.ts` with pure function `evaluateVerdict(inputs: VerdictInputs): VerdictResult`.
- Comprehensive Vitest test suite (`tests/domain/verdict.test.ts`).

## 10. Definition of Done
- Engine passes all 80 evaluation set fixture scenarios.
- Zero AI model dependencies in the verdict domain package.
- All edge cases (stale dates, partial sources, brand-only alerts) handled deterministically.

## 11. Common Mistakes to Avoid
- Calling an LLM or AI model to "reason" about the verdict.
- Emitting `Number problem` when a partial seed dataset lacks a record.
- Failing to include the non-authentication caveat on positive verdicts.
