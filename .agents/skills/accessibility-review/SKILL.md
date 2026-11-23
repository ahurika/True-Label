---
name: accessibility-review
description: Guides the auditing, testing, and remediation of TrueLabel UI components and user journeys against WCAG 2.2 AA accessibility standards. Use when reviewing components, forms, dialogs, focus traps, or screen reader interactions.
---

# Accessibility (WCAG 2.2 AA) Audit & Review Skill

## 1. Purpose
Establishes the audit procedure and compliance standards required to ensure TrueLabel satisfies **WCAG 2.2 AA** across all user interfaces, as specified in PRD v3.1 Section 13 and Section 14.1.

## 2. When to Use
- Auditing new or modified UI components, layouts, or forms.
- Reviewing modal dialogs, drawer overlays, or toast notifications for focus traps and ARIA compliance.
- Testing keyboard navigation across the scan and verdict review flows.
- Verifying non-color status indicators for all verdict cards and status badges.

## 3. Prerequisites
- Automated accessibility linter (`eslint-plugin-jsx-a11y`).
- Automated testing library `@axe-core/playwright`.
- Screen readers: VoiceOver (macOS/iOS), TalkBack (Android), or NVDA (Windows).

## 4. Required Context
- Target Standard: WCAG 2.2 AA.
- High-Evidence Invariant: TrueLabel serves everyday shoppers and caregivers on diverse mobile hardware under varying lighting conditions. High legibility and contrast are safety requirements, not mere aesthetic preferences.
- Key Touchpoint: Minimum 44px by 44px tap target size for all interactive controls.
- Non-Color Rule: Color must **never** be the sole indicator of verdict, status, or error.

## 5. Step-by-Step Workflow
1. **Automated Axe-Core Sweep**:
   - Run Playwright test with `@axe-core/playwright` across all primary routes (`/`, `/scan`, `/scan/confirm`, `/scan/result`, `/share/[token]`).
   - Flag any critical, serious, or moderate violations.
2. **Contrast Ratio Verification**:
   - Body copy (`--color-text-primary`, `--color-text-secondary`) must achieve at least **4.5:1** contrast against backgrounds.
   - Large text (headings $\ge 18\text{pt}$ or bold $\ge 14\text{pt}$) and UI components/borders must achieve at least **3:0:1** contrast.
   - Test alert badges and verdict cards in both high-light and dimmed environments.
3. **Keyboard Navigation & Focus Trapping**:
   - Tab through the entire scan journey using keyboard only.
   - Ensure a visible focus indicator (`:focus-visible` with 2px solid ring) is displayed on every active element.
   - Verify that modal dialogs trap focus and release focus back to the trigger button upon dismissal.
   - Support Escape key dismissal for all overlays.
4. **Form Controls & Error Announcement**:
   - Ensure all input fields have explicit, associated `<label>` elements via `htmlFor`/`id`.
   - Connect error messages to inputs using `aria-describedby` and set `aria-invalid="true"` on invalid fields.
   - Mark required confirmation fields with `aria-required="true"`.
5. **Screen Reader Semantic Verification**:
   - Use landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`.
   - Ensure verdict cards declare `role="region"` with `aria-labelledby` pointing to the explicit verdict headline.
   - Use `aria-live="polite"` for loading state updates during AI extraction.
6. **Reduced-Motion Verification**:
   - Toggle system reduced motion setting (`prefers-reduced-motion: reduce`).
   - Confirm all transitions and progress spinner animations are halted or replaced with static text indicators.

## 6. Decision Points
- *Can we use an icon without a text label for the language toggle?* No. All icon-only buttons must provide an accessible name via `aria-label` or visually hidden text (`.sr-only`).
- *How do we communicate alert severity to screen readers?* Render an explicit text prefix: e.g., *"Warning: Matches a NAFDAC alert"*, rather than relying on red styling.

## 7. Safety Checks
- Verify that touch targets for camera upload, confirm checkboxes, and share buttons measure $\ge 44\text{px} \times 44\text{px}$.
- Verify that text scaling up to 200% does not truncate critical product information or overlap buttons.
- Confirm zero decorative checkmarks implying product authenticity.

## 8. Testing Requirements
- Automated `@axe-core/playwright` CI test passing with 0 violations.
- Manual screen-reader journey test on at least one mobile device (VoiceOver or TalkBack).
- Full keyboard walkthrough with zero mouse interactions.

## 9. Expected Deliverables
- Accessibility audit report in `docs/design/ACCESSIBILITY_GUIDELINES.md`.
- Automated Playwright accessibility spec (`tests/e2e/a11y.spec.ts`).
- Fully accessible React component implementations.

## 10. Definition of Done
- 100% compliance with WCAG 2.2 AA criteria.
- Zero critical or serious Axe violations in CI.
- Verified keyboard-navigable and screen-reader announced scan workflow.

## 11. Common Mistakes to Avoid
- Removing outline styles with `outline: none` without providing an accessible `:focus-visible` alternative.
- Using placeholder attributes as a replacement for visible `<label>` elements.
- Relying on red or green background tints to distinguish verdicts without accompanying text and icons.
