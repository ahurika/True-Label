---
trigger: glob
description: "Design system rules: 8-point grid, one font family, tokens only, Apple and Google UI standards. Applies to CSS and UI components."
globs: "**/*.css, **/*.tsx, design-system/**"
---

# Design system rules (v2)

Authority: `design-system/UI_STANDARDS.md`, `tokens.css`, `typography.css`. Read UI_STANDARDS.md before building or changing any screen.

## Grid
- Every margin, padding, gap, width, height and radius is a multiple of 8 px, written as a token: `--space-N` (N x 8 px), `--size-*`, `--radius-*`.
- `--space-half` (4 px) is allowed only for icon-to-label gaps and chip padding.
- Allowed literals: 0, 1px, 2px, 3px (borders and focus ring), percentages, and tokens.
- Line-heights are multiples of 4 px and come from `--lh-*`.
- Never write 12px, 20px or any off-grid value. Round to the nearest 8 (or 4 for type).

## One font family
- Only `var(--font-sans)` (Inter). No second family. No monospace. No icon font.
- Registration numbers, batch codes, dates and strengths use `.tl-code` or `.tl-numeric` (same family, tabular figures, slashed zero).
- Type comes from roles: `--text-caption|label|body|title-3|title-2|title-1|display|code` with matching `--lh-*`. Never write a raw font-size.

## Tokens only
- No hardcoded colours, sizes, radii, durations or easings. If a token is missing, add it to `tokens.css`, then run both scripts.
- After any edit: `node design-system/scripts/check-grid.mjs src design-system` and `node design-system/scripts/check-contrast.mjs` must pass.

## Platform standards
- Targets 48 px or more, 8 px apart. Primary action 64 px. Inputs 56 px, font size 18 px or more.
- Bottom navigation with three labelled items (Scan, History, Help). Sheets for secondary tasks. Back chevron top-left. No hamburger.
- Safe areas on header, bottom nav and sticky bars. `100dvh`, never `100vh`.
- Light and dark from tokens. Check 360, 390, 412, 768, 1440 px and 200% text.

## Result surfaces
- Verdict icons: ledger, magnifier-question, flag, bell. Never a tick, cross, thumb, shield, green or red.
- Icon plus text on every state. Colour is never the only signal.

## Never
- Never use `!important` outside utilities and the reduced-motion rule.
- Never disable zoom. Never remove a focus outline without replacing it.
- Never weaken a check script to make it pass.
