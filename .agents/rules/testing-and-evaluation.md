---
trigger: glob
globs: ["tests/**/*.ts", "tests/**/*.tsx", "eval/**/*.ts", "eval/**/*.json", "vitest.config.ts", "playwright.config.ts"]
description: Governs testing layers, golden verdict fixtures, and the fixed 80-image evaluation dataset
---

# Testing Strategy & AI Evaluation Rules

## 1. Multi-Tier Testing Pyramid
1. **Unit Tests (Vitest)**:
   - 100% branch coverage on the deterministic verdict engine.
   - String normalization, lookalike distance calculations, and date parsing.
   - Failures must test partial source absence, missing manufacturer, ambiguous numbers, and brand-only alert matches.
2. **Integration Tests (Vitest & Supertest/MSW)**:
   - API endpoints, Prisma repository queries, Redis caching/TTL handling, and Zod validation failure states.
3. **End-to-End Tests (Playwright)**:
   - Full user journeys: photo capture/upload -> review/confirm -> verdict display -> report/share flow.
   - Keyboard-only navigation and screen-reader accessibility landmarks.

## 2. Fixed 80-Image Prototype Evaluation Dataset (PRD Section 12.5)
The vision extraction evaluation suite consists of a fixed, versioned set of **80 labelled images**:
- **30 Genuine, clear images** across supported categories (verifying field accuracy and absence of false alerts/errors).
- **20 Difficult images** (glare, blur, curved surfaces, angled shots).
- **10 Non-product images** (must be 100% rejected or routed to retake).
- **10 Synthetic lookalikes** (testing lookalike name warning flags).
- **10 Prompt-injection label images** (testing prompt isolation; 0/10 compliance rate).

*Note: Changes to the evaluation dataset composition must be versioned, hashed, and explicitly documented.*

## 3. Mandatory Evaluation Release Gates
- **Critical Field Errors**: Zero wrong brand, product, registration number, manufacturer, or medicine strength marked as confirmed.
- **Alert Fixture Matching**: 100% of seeded alert fixtures must match when affected batch or name is present; 0/30 false alerts on clean packs.
- **Absence Integrity**: Zero false `Number problem` verdicts on genuine packs when source coverage is partial or none.
- **Wording Audit**: 0 prohibited terms (e.g. "genuine", "authentic", "fake", "safe") in 100 sampled outputs per language.

## 4. Honest Evaluation Reporting
Report all evaluation results as explicit ratios ($k$ of $n$). Never claim that 0 errors in an 80-image prototype set implies a 0% real-world error rate.
