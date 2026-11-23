# TrueLabel Design System — Evidence-First Clarity

## Visual Direction: The Register / Label-Ledger

A quiet visual language for a careful comparison. The pack comes first. Sources remain visible. Uncertainty is never dressed as approval.

### Three Principles
1. **The Plate** — Double rule frames a printed number. Not a seal or certificate.
2. **The Register** — Editorial hierarchy separates evidence, source and limitation.
3. **The Annotation** — Precise margin notes explain what could not be established.

## Architecture

| File | Purpose |
|------|---------|
| `tokens.css` | CSS custom properties: primitives (slate, ink, ochre), semantic colours (light/dark), typography, spacing, radii, elevation, focus |
| `reset.css` | Modern accessible reset, focus-visible defaults, reduced-motion |
| `typography.css` | Type roles (display → caption), code/numeric styles, heading hierarchy |
| `layout.css` | Page container, app shell, stacks, clusters, dividers, double-rule |
| `components.css` | Header, bottom nav, buttons, surfaces, number plates, verdict slips, check rows, status labels |
| `forms.css` | Text inputs, registration number input, search, textarea, validation states |
| `feedback.css` | State blocks, errors, loading, skeletons, toasts, bottom sheets, dialogs, caveat |
| `utilities.css` | Token-aligned atomic helpers |
| `global.css` | Master import layer |

## Font
**DM Sans** — the exclusive typeface. Essential text never below 14px.

## Grid
8px base spacing. `--space-half` (4px) only for icon-to-label micro gaps.

## Focus
3px ring with 3px clear offset. Visible keyboard focus on all interactive elements.

## Tailwind Integration
All tokens are exposed as CSS custom properties referenced by `tailwind.config.ts`. Use Tailwind utility classes backed by design tokens. Never hardcode colour or spacing values.

## Verdict Colours
- **Status 1** (Registered and matches) → Ink/blue family
- **Status 2** (Could not confirm) → Slate family
- **Status 3** (Number problem) → Ochre family
- **Status 4** (Matches a NAFDAC alert) → Ochre family (stronger)

Colour alone never conveys a verdict. Each needs icon + text + explanation.
