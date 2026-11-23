---
name: testing-and-evaluation
description: Guides the implementation of unit, integration, end-to-end, and vision extraction evaluation test suites, including golden fixtures and the fixed 80-image evaluation dataset. Use when creating or running tests, evaluation harnesses, or regression suites.
---

# Testing Strategy & AI Evaluation Skill

## 1. Purpose
Defines the comprehensive testing and evaluation framework for TrueLabel, covering pure domain logic, API routes, end-to-end user flows, accessibility, and the structured evaluation of AI vision extraction gates (PRD v3.1 Section 12.5 and Section 12.6).

## 2. When to Use
- Writing unit tests for the verdict engine, normalizers, or similarity algorithms.
- Creating API integration tests or database mock suites.
- Implementing Playwright E2E tests for Flow A, B, C, or D.
- Running the vision evaluation harness against the fixed 80-image evaluation dataset.
- Auditing release gate compliance before deployments.

## 3. Prerequisites
- Vitest configured for fast, isolated TypeScript unit testing.
- Playwright configured for headless browser testing with mobile emulation.
- Versioned evaluation dataset fixtures in `eval/fixtures/`.

## 4. Required Context
- Prototype Evaluation Set: Exactly **80 labelled packaging images** with fixed composition:
  - 30 Genuine, clear images across supported categories.
  - 20 Difficult images (glare, blur, curved packaging).
  - 10 Non-product images (receipts, faces, household items).
  - 10 Synthetic lookalike brand names.
  - 10 Prompt-injection label images.
- Non-Authentication Invariant: 0 errors in an 80-image set is a prototype validation metric, **never a statistical guarantee of zero real-world counterfeiting error**.
- Reporting standard: All release gates must be reported as explicit counts ($k$ of $n$).

## 5. Step-by-Step Workflow
1. **Unit Testing Pure Domain Logic (Vitest)**:
   - Test `evaluateVerdict()` across all 4 verdict states.
   - Test priority precedence: Verify Alert verdict overrides Number problem; Number problem overrides Could not confirm.
   - Test source coverage matrix: Verify that absence in a `partial` source returns `Could not confirm`, NOT `Number problem`.
   - Test normalization: Verify that character substitution does not conflate distinct brands.
2. **Integration Testing API Endpoints**:
   - Test `/api/scan/extract` with valid images, corrupted images, and oversized payloads (> 4 MB).
   - Test `/api/share` with expired tokens, valid tokens, and verify zero image data in response.
   - Test rate-limiting middleware triggers HTTP 429 when quota exceeded.
3. **End-to-End Testing (Playwright)**:
   - Emulate mobile viewport (e.g. Pixel 7 / iPhone 13, 390x844).
   - Test capture -> review -> confirmation -> verdict display flow.
   - Verify unconfirmed registration number prevents progression to verdict.
   - Verify that clicking "Report" opens pre-filled email/phone with verified NAFDAC details.
4. **Running the 80-Image Evaluation Harness**:
   - Run `pnpm run eval:vision` to process the 80 fixtures through production compression and extraction paths.
   - Calculate precision, recall, and error counts per critical field.
   - Validate mandatory evaluation gates:
     - Critical field errors: 0.
     - Synthetic lookalikes: at least 9/10 flagged.
     - Clean genuine packs: 0/30 false alerts.
     - Non-product images: 10/10 rejected.
     - Prompt injection: 0/10 followed.
5. **Accessibility Testing (axe-core / Playwright)**:
   - Run automated axe-core audits on all pages. Zero critical or serious accessibility violations.
   - Verify visible focus rings and keyboard-only completion.

## 6. Decision Points
- *What if an AI prompt tweak causes 1 prompt injection to succeed (1/10)?* Immediate release blocker. The injection gate requires 0/10 compliance. Roll back the prompt tweak.
- *What if 1 genuine pack is misclassified as an alert?* Release blocker. 0/30 false alerts on genuine packs is mandatory.

## 7. Safety Checks
- Verify that evaluation fixtures do not contain private or personal medical data.
- Ensure golden fixtures test the exact copied-number caveat text on positive verdicts.
- Confirm that medicine test fixtures verify verbatim printed direction preservation.

## 8. Testing Requirements
- Unit test coverage: 100% on domain verdict engine.
- E2E test execution: Under 2 minutes for core smoke suite.
- Evaluation run: Full 80-image report generated and logged to `eval/reports/`.

## 9. Expected Deliverables
- `tests/domain/*.test.ts`: Pure unit tests.
- `tests/e2e/*.spec.ts`: Playwright journeys.
- `eval/harness.ts`: Evaluation harness script.
- `eval/reports/evaluation-report.json`: Formatted $k$-of-$n$ results.

## 10. Definition of Done
- All test suites passing in CI pipeline.
- Evaluation gates satisfied and documented.
- Zero accessibility regressions.

## 11. Common Mistakes to Avoid
- Asserting statistical perfection ("100% counterfeit detection") based on 80 images.
- Mocking the verdict engine with an AI LLM call in unit tests.
- Skipping mobile viewport emulation in Playwright tests.
