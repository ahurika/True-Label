# TrueLabel Missing Design System Screens & Extension Guide

> **Authoritative Baseline**: Approved Figma Design System in `True Label Design System` & TrueLabel PRD v3.1.

This document identifies product screens required by the PRD or end-to-end user journeys that did not exist as standalone frames in the Figma master file, and documents how they were constructed as faithful extensions of approved design tokens and component patterns.

---

## 1. Extension Principles
Whenever a required user flow requires a screen not explicitly present in the Figma PDF exports:
1. **Zero New Visual Direction**: No new colors, shadows, borders, or typography are introduced.
2. **Direct Component Reuse**: Build exclusively using approved components (`AppShell`, `Button`, `Surface`, `NumberPlate`, `StatusLabel`, `SpecRow`, `ConfirmButton`, `VerdictSlip`, `Caveat`).
3. **Dual Theme Conformance**: Every state is tested and verified in both Light and Dark themes.
4. **Touch-Target Compliance**: Minimum 48px touch targets; 64px filled primary actions.
5. **Responsive Continuity**: Strict support across 360px, 390px, 430px, 768px, and 1440px viewports.

---

## 2. Extended Screens & Flow Documentation

### Screen 1: Medicine Label-Only Review (`/review/medicine`)
- **Figma Reference Mapping**: Extends frames `C13` (*Review the medicine label*), `C14` (*Confirm the medicine identity*), `C15` (*Medicine fixture ready*), and `F01` (*Read the printed directions*).
- **PRD Justification**: PRD Section 10.7 mandates a strict label-only mode for medicines. Users must review verbatim printed directions, confirm medicine strength, and view the prominent pharmacist notice before proceeding to comparison.
- **Components Reused**:
  - `AppShell` with standard back navigation
  - `MedicineLabelIllustration` (from approved schematic illustrations)
  - `NumberPlate` displaying NAFDAC registration number
  - `Surface` containing active ingredient and strength rows
  - `ConfirmButton` enforcing explicit strength confirmation
  - `Surface` displaying verbatim directions with disclaimer
  - Pharmacist Notice callout banner with `--color-primary` border
- **Safety Boundary**: Zero dosing calculations, zero schedules, zero frequency shorthand conversion.

### Screen 2: Direct Manual Entry (`/review/enter`)
- **Figma Reference Mapping**: Extends frames `C04` (*Type the pack details*), `C05` (*Enter the printed characters*), and `C06` (*Check the number again*).
- **PRD Justification**: PRD Section 10.3 requires an accessible fallback path for consumers in low-light environments, with scratched packaging, or with degraded cameras. Users can type printed details directly.
- **Components Reused**:
  - `RegistrationNumberInput` (64px height, monospace code styling, auto-capitalization)
  - `FormField` with semantic labels, hints, and error announcements
  - `TextInput` (56px height) for brand and product name
  - Primary button submit action navigating into `/review`

### Screen 3: Local Check History (`/history`)
- **Figma Reference Mapping**: Extends frame `I06` (*Simulated scan state cleared*).
- **PRD Justification**: PRD Section 10.9 specifies an optional on-device receipt history that is strictly off by default and never retains photos. A dedicated history screen is required for the bottom navigation bar and desktop header.
- **Components Reused**:
  - `EmptyHistoryIllustration` (minimal archive tray SVG)
  - Centered typographic layout with explanation of zero photo retention
  - Primary action button navigating into `/scan`

### Screen 4: Forensic Analysis of C12 Omission
- **Audit Finding**: In the Figma source directory `True Label Design System`, frames jump from `C11 · Ready to compare the fixture` directly to `C13 · Review the medicine label`.
- **Resolution**: No artificial "C12" state was invented. The application architecture cleanly bridges C11 into the comparison engine and result states (`D01`–`D04`), preserving the authentic 84-state design system inventory.
