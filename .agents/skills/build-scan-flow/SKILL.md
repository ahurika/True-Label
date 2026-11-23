---
name: build-scan-flow
description: Guides the implementation of the primary product scanning experience, from browser camera capture, client-side image compression, and extraction review to user confirmation and verdict rendering. Use when building or updating Flow A in the web application.
---

# Build Scan Flow Skill

## 1. Purpose
Defines the end-to-end implementation workflow for TrueLabel's primary web scan journey (Flow A, PRD Section 6.1), adhering strictly to latency targets, client-side compression rules, explicit user confirmation gates, and non-authentication result presentation.

## 2. When to Use
- Implementing or modifying the camera capture and image upload interface.
- Creating the client-side image compression and quality validation pipeline.
- Developing the extraction review screen where users inspect and confirm critical fields.
- Integrating the scan workflow with the deterministic verdict engine.

## 3. Prerequisites
- `design-system/` components for buttons, upload areas, badges, and review cards.
- Server-side extraction API endpoint (`/api/scan/extract`) returning PRD Section 12.4 schema.
- Deterministic verdict engine in `src/domain/verdict/`.

## 4. Required Context
- Camera input: HTML `<input type="file" accept="image/*" capture="environment">` with rear camera preference. Up to 3 images: front, back, batch area.
- Client compression target: Max long edge 1600px, target size < 500 KB (max 800 KB). Server request body limit: 4 MB.
- Performance SLA: Photo submission to confirm screen: median < 8s, p95 < 12s. Confirm action to rendered verdict: p95 < 3s. End-to-end scan journey under 60 seconds.
- Invariant: Registration number and medicine strength **must always be explicitly confirmed** by the user.

## 5. Step-by-Step Workflow
1. **Camera Capture**: Implement file input with drag-and-drop fallback and rear camera trigger.
2. **Client-Side Validation & Compression**:
   - Check image dimensions, basic brightness, and blur heuristic.
   - Resize image in an offscreen canvas to 1600px long edge, converting to JPEG (< 500 KB).
   - If compression fails, block upload and prompt retake.
3. **Dispatch Extraction**: Send compressed image payload to `/api/scan/extract`. Display animated loading state with progress indicator.
4. **Render Confirm Screen**:
   - Display extracted category, brand, product name, registration number, manufacturer, batch, and expiry dates.
   - Monospace display for registration and batch numbers.
   - For medicine category, render active ingredients and strength in high-visibility review cards.
   - Flag uncertain or low-confidence fields with `.badge-status--unconfirmed`.
5. **Enforce Confirmation Interaction**:
   - Require explicit toggle/checkbox confirmation for registration number.
   - If medicine, require explicit confirmation of strength.
   - Allow inline correction of any misread text fields.
6. **Execute Verdict Engine**: Upon user confirmation, call deterministic verdict engine with confirmed data.
7. **Render Verdict Screen**: Display verdict card (one of four states) with source coverage, checked date, alert index status, and non-authentication disclaimer.

## 6. Decision Points
- *Did extraction fail schema validation?* Allow at most one automatic retry with the provider. If retry fails, gracefully route the user to manual number entry.
- *Is the product a household item?* Proceed with alert check only; disable positive registration matching.

## 7. Safety Checks
- Verify that no verdict is rendered prior to user confirmation of the registration number.
- Ensure original image files are cleared from client state upon scan completion and not stored in IndexedDB.
- Confirm that `Registered and matches` renders the copied-number warning banner.

## 8. Testing Requirements
- Unit tests for client-side image compression logic.
- Mock API integration tests for extraction failure, retry, and timeout states.
- Playwright E2E test verifying that unconfirmed fields block verdict progression.

## 9. Expected Deliverables
- Front-end scan component hierarchy (`ScanCapture`, `ExtractionReview`, `ConfirmForm`, `VerdictView`).
- Client-side image processing utility (`src/lib/image/compress.ts`).
- End-to-end Playwright test suite for Flow A.

## 10. Definition of Done
- Complete scan journey finishes under 60 seconds on standard mobile profiles.
- Zero image persistence in client-side storage.
- All 4 verdict states render cleanly with correct evidence and disclaimers.

## 11. Common Mistakes to Avoid
- Skipping explicit user confirmation for registration number when model confidence is high.
- Persisting uncompressed multi-megabyte raw photos in client state.
- Displaying a verdict while extraction or confirmation is still pending.
