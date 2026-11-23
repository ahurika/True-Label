---
trigger: glob
globs: ["design-system/**/*.css", "src/**/*.tsx", "src/**/*.jsx", "src/**/*.css", "src/**/*.scss", "components/**/*.tsx"]
description: Enforces Design System v2 rules: 8-point grid, single font family (Inter), Apple and Google standards, and tokens-only enforcement.
---

# Design System & UI Implementation Rule (v2)

Authority: `design-system/UI_STANDARDS.md`, `tokens.css`, `typography.css`, `.agents/rules/06-design-system.md`.

## 1. Direction: Evidence-First Clarity
TrueLabel's visual design communicates credibility, transparency, restraint, and facts.
- **Prohibited Aesthetics**: No gradients, no glassmorphism/backdrop blur gimmicks, no neon accent colors, no heavy decorative drop-shadows, no skeuomorphic approval seals, and no generic AI sparkle icons.
- **Color Discipline**: Base styling relies on clean neutral surfaces. Semantic colors are restrained, non-jarring, and strictly paired with text descriptions. On result surfaces: never use ticks, crosses, thumbs, shields, green or red.

## 2. 8-Point Grid & Token Usage
- Every margin, padding, gap, width, height, and radius is a multiple of 8px, written as a token: `--space-N` (N x 8px), `--size-*`, `--radius-*`.
- `--space-half` (4px) is allowed only for icon-to-label micro gaps and chip padding.
- Allowed literals: 0, 1px, 2px, 3px (borders and focus ring), percentages, and tokens.
- Line-heights are multiples of 4px and come from `--lh-*`. Never write arbitrary or off-grid pixel values (e.g. 12px, 20px).

## 3. Single Font Family: Inter
- Only `var(--font-sans)` (Inter). No second family. No monospace font family. No icon font.
- Registration numbers, batch codes, dates, and strengths use `.tl-code` or `.tl-numeric` (same family, tabular figures, slashed zero).
- Typography comes from roles: `--text-caption|label|body|title-3|title-2|title-1|display|code` with matching `--lh-*`.

## 4. Platform Standards & Touch Targets (WCAG 2.2 AA / Apple HIG / Material 3)
- Interactive targets must be **48px** or more, separated by at least 8px. Primary actions are **64px**.
- Text inputs are **56px** high, label above field, with font size $\ge 18\text{px}$ (prevents iOS auto-zoom).
- Bottom navigation with 3 labelled items: **Scan**, **History**, **Help**. Scan is centered and prominent. No hamburger menus.
- Contrast ratios must meet or exceed **4.5:1** for regular text and **3:1** for large text / UI components against backgrounds (validated by `check-contrast.mjs`).
- Provide visible keyboard focus indicators (`:focus-visible` with 2px or 3px solid ring).
- Respect `prefers-reduced-motion`.

## 5. Verdict UI Invariants
- Color alone must never convey a verdict state. Each of the 4 verdicts must feature a distinctive neutral geometric icon, an explicit text title, and an explanation.
- **Verdict icons permitted**: ledger, magnifier-question, flag, bell. Never a tick, cross, thumb, shield, green or red.
- The copied-number notice must be rendered as an integrated, non-dismissible element on every `Registered and matches` screen.
