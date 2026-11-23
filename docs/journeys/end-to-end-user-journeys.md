# TrueLabel End-to-End User Journeys Mapping

> **Authoritative Baseline**: TrueLabel PRD v3.1 and approved Figma Design System.

This document details all 14 end-to-end user journeys supported by the TrueLabel application, documenting data requirements, state transitions, validation rules, loading states, and operational realities.

---

## Journey Matrix Summary

| # | Journey Name | Operational Reality | Primary Route(s) | Primary User Outcome |
|:---:|---|:---:|---|---|
| **1** | Clean Pack Scan to Verdict 1 | Fixture-based Simulation | `/` → `/scan` → `/scan/capture` → `/review` → `/result` | Registered and matches (with caveat) |
| **2** | Public Alert Detection (Verdict 2) | Fixture-based Simulation | `/scan/reading` → `/result/alert` | Matches a NAFDAC alert (P1) |
| **3** | Conflicting Pack Identity (Verdict 3)| Fixture-based Simulation | `/review` → `/result/number-problem` | Number problem (P2) |
| **4** | Ambiguous / Unreadable (Verdict 4) | Working Client-side | `/scan/capture` → `/result/unconfirmed` | Could not confirm (P3 fallback) |
| **5** | Direct Manual Entry | Working Client-side | `/` → `/review/enter` → `/review` | Bypasses camera with keyboard |
| **6** | Medicine Pack Review | Working Client-side | `/review` → `/review/medicine` → `/result` | Strict label-only + pharmacist notice |
| **7** | Household Product Enforcement | Static Demonstration | `/scan` → `/result/evidence` | Household extraction-only notice |
| **8** | Bilingual Language Switching | Fixture-based Simulation | Header / Menu → Language Toggle | English (`en`) ↔ Nigerian Pidgin (`pcm`) |
| **9** | Offline Detection & Recovery | Working Client-side | Network offline → `/offline` | Connection severed recovery |
| **10**| Service Unavailable Handling | Static Demonstration | HTTP 503 → `/unavailable` | Degraded service explanation |
| **11**| Ephemeral Share Link Generation | Fixture-based Simulation | `/result` → BottomSheet (`O1`) → Toast | 30-day read-only share receipt |
| **12**| Check History Inspection & Clear | Working Client-side | BottomNav → `/history` | On-device local receipt list |
| **13**| Light/Dark Theme Switching | Working Client-side | Header `ThemeToggle` | Instant CSS custom property switch |
| **14**| Help & Evidence Methodology | Working Client-side | `/help` → `/result/evidence` | 4 verdicts & coverage education |

---

## Detailed Journey Specifications

### Journey 1: Clean Pack Scan to Verdict 1 (`Registered and matches`)
- **Entry Point**: Home page `/`.
- **User Action**: Clicks "Scan a pack", reviews privacy disclosure on `/scan`, frames pack on `/scan/capture`, clicks "Capture fixture".
- **Application Response**: Displays 3-stage loading animation on `/scan/reading` (2.4s), then redirects to `/review`.
- **Data Required**: Front pack image, OCR candidate fields (Reg No, Brand, Product, Manufacturer).
- **Validation Rules**: Registration number must match regex pattern; user must explicitly click "Confirm number" and "Confirm brand, product and maker".
- **Loading State**: `StageProgress` showing "Frame captured", "Reading printed text", "Locating registration number".
- **Success State**: Arrives at `/result` with `VerdictSlip` in Ink/Blue, displaying `LedgerIcon`, title `Registered and matches`, and the mandatory copied-number caveat.
- **Failure State**: If unreadable, redirects to `/result/unconfirmed`.
- **Navigation Destination**: `/result`.
- **Persistence**: Intermediate scan state held in memory (Redis 30-min TTL in production). Zero image retention.
- **Backend Dependency**: Multimodal vision AI API (Blocker B-01) & Neon PostgreSQL registry.
- **Status**: **Fixture-based Simulation**.

### Journey 2: Public Alert Detection (Verdict 2)
- **Entry Point**: Scanned pack or direct verdict navigation.
- **User Action**: Pack scanned matching active public alert notice.
- **Application Response**: Deterministic engine evaluates Priority 1 rule (`matchedAlert != null`).
- **Data Required**: Batch number or affected-pack name matching alert record in `Alert` table.
- **Validation Rules**: Brand-only match triggers informational badge, never an alert verdict.
- **Loading State**: `LoadingIndicator` with text "Checking public alert index".
- **Success State**: `/result/alert` displays `BellIcon` in Ochre Strong, alert notice number (e.g. Notice 2026/088), recall details, and evidence link.
- **Failure State**: None. Alert precedence is definitive.
- **Navigation Destination**: `/result/alert`.
- **Persistence**: Ephemeral scan state.
- **Backend Dependency**: NAFDAC public alert ingestion pipeline.
- **Status**: **Fixture-based Simulation**.

### Journey 3: Conflicting Pack Identity / Expired Number (Verdict 3)
- **Entry Point**: Scanned pack review.
- **User Action**: Scanned registration number belongs to a different product or is marked inactive.
- **Application Response**: Priority 2 evaluation triggers `Number problem`.
- **Data Required**: Legible confirmed pack details + sufficiently complete source record.
- **Validation Rules**: Source must have `complete` coverage to assert absence. Mismatched brand/product name triggers conflict.
- **Loading State**: Standard comparison loading.
- **Success State**: `/result/number-problem` displays `FlagIcon`, details discrepancy ("Registered to Refined Sugar, not Semovita"), and offers manual correction link.
- **Failure State**: None.
- **Navigation Destination**: `/result/number-problem`.
- **Persistence**: Ephemeral scan state.
- **Backend Dependency**: Neon PostgreSQL `RegistryRecord`.
- **Status**: **Fixture-based Simulation**.

### Journey 4: Ambiguous / Unreadable Pack (Verdict 4)
- **Entry Point**: `/scan/capture` or `/result`.
- **User Action**: Blurred photo, corrupted label, or partial dataset absence.
- **Application Response**: Fail-closed architecture defaults cleanly to Verdict 4.
- **Data Required**: Partial or missing scan details.
- **Validation Rules**: Missing evidence is never converted to a positive claim.
- **Loading State**: Normal loading.
- **Success State**: `/result/unconfirmed` displays `MagnifierQuestionIcon`, details insufficient evidence, and provides recovery CTAs ("Try a clearer photo" or "Type printed details").
- **Failure State**: N/A (this is the safe fallback).
- **Navigation Destination**: `/result/unconfirmed`.
- **Persistence**: None.
- **Backend Dependency**: None.
- **Status**: **Working Client-side Functionality**.

### Journey 5: Direct Manual Entry Flow
- **Entry Point**: Home page `/` or `/scan`.
- **User Action**: Clicks "Type the number", inputs characters into `RegistrationNumberInput`, brand, product name into `TextInput`.
- **Application Response**: Real-time uppercase formatting, monospace code font, form submission routes into `/review`.
- **Data Required**: Typed characters.
- **Validation Rules**: Registration number required ($\ge 4$ characters).
- **Loading State**: Instantaneous form transition.
- **Success State**: Arrives at `/review` with confirmed typed fields.
- **Failure State**: Inline validation error with `role="alert"`.
- **Navigation Destination**: `/review`.
- **Persistence**: Component state.
- **Backend Dependency**: None.
- **Status**: **Working Client-side Functionality**.

### Journey 6: Medicine Pack Review (Strict Label-Only Mode)
- **Entry Point**: Review screen `/review`.
- **User Action**: User clicks "Review medicine label (PRD §10.7)".
- **Application Response**: Navigates to `/review/medicine` (Screen C13).
- **Data Required**: Active ingredient, confirmed strength (e.g. 500mg), verbatim printed directions.
- **Validation Rules**: User must click `ConfirmButton` for strength before comparison CTA unlocks. Zero dosing, zero scheduling.
- **Loading State**: N/A.
- **Success State**: Strength confirmed; verbatim directions displayed; prominent non-dismissible Pharmacist Notice rendered.
- **Failure State**: Strength unconfirmed keeps proceed CTA disabled.
- **Navigation Destination**: `/result`.
- **Persistence**: None.
- **Backend Dependency**: None.
- **Status**: **Working Client-side Functionality**.

### Journey 7: Household Product Scan Boundary
- **Entry Point**: `/scan` or `/result/evidence`.
- **User Action**: Scans bleach, cleaning chemical, or insecticide.
- **Application Response**: Identifies household category; documents that household products have no approved registry in v1 and cannot receive Verdict 1.
- **Data Required**: Pack category = `household`.
- **Validation Rules**: PRD §1.1 & §8.2 absolute boundary.
- **Success State**: Clear extraction and alert check only; no positive match issued.
- **Navigation Destination**: `/result/evidence`.
- **Status**: **Static Demonstration**.

### Journey 8: Bilingual Language Switching
- **Entry Point**: Header or menu.
- **User Action**: Selects Nigerian Pidgin (`pcm`).
- **Application Response**: UI copy switches to approved Pidgin dictionary (`src/messages/pcm.json`). The 4 verdict titles remain statutory English.
- **Data Required**: Locale code.
- **Validation Rules**: PRD §13 terminology consistency.
- **Success State**: Copy updated; audio playback gated by Blocker B-06.
- **Status**: **Fixture-based Simulation**.

### Journey 9: Offline Detection and Recovery
- **Entry Point**: Any route during network loss.
- **User Action**: Browser disconnects from internet.
- **Application Response**: Routes to `/offline` (Screen A03), displays `OfflineIllustration` and "Try again" action.
- **Status**: **Working Client-side Functionality**.

### Journey 10: Service Unavailable Handling
- **Entry Point**: HTTP 503 or scheduled maintenance.
- **User Action**: Application service down.
- **Application Response**: Displays `/unavailable` (Screen A02) with clear status explanation.
- **Status**: **Static Demonstration**.

### Journey 11: Ephemeral Share Link Generation
- **Entry Point**: Result screens (`/result`).
- **User Action**: Clicks share action.
- **Application Response**: Displays bottom sheet (`O1`), generates read-only share URL, copies to clipboard via `Toast` (H09).
- **Data Required**: Confirmed text fields, verdict, engine version. Zero images. Zero PII.
- **Persistence**: 30-day TTL in Redis / PostgreSQL.
- **Status**: **Fixture-based Simulation**.

### Journey 12: Check History Inspection and Clear
- **Entry Point**: BottomNav or Desktop Nav.
- **User Action**: Clicks "History".
- **Application Response**: Displays `/history` with `EmptyHistoryIllustration`, explains zero photo retention, links to scan flow.
- **Persistence**: Optional local `localStorage` only when enabled.
- **Status**: **Working Client-side Functionality**.

### Journey 13: Light/Dark Theme Switching
- **Entry Point**: Header `ThemeToggle`.
- **User Action**: Clicks toggle button.
- **Application Response**: Toggles `data-theme` on `<html>`, persists preference to `localStorage.setItem('tl-theme')`.
- **Status**: **Working Client-side Functionality**.

### Journey 14: Help & Evidence Methodology Inspection
- **Entry Point**: BottomNav or Desktop Nav "Help".
- **User Action**: Browses `/help` and `/result/evidence`.
- **Application Response**: Renders help topics, explains the 4 verdicts, source coverage, freshness policy, and pharmacist notice.
- **Status**: **Working Client-side Functionality**.
