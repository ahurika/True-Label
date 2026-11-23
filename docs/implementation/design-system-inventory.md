# TrueLabel Design System Implementation Inventory

> **Authoritative Baseline**: Approved Figma Design System in `True Label Design System` & TrueLabel PRD v3.1.

This document inventories all visual, structural, and component assets extracted from the Figma Design System and maps them directly to the application codebase.

---

## 1. Design System Elements & Asset Mapping

| Design System Element | Source Figma Asset / Reference | Application Implementation | Status | Verification Evidence |
|---|---|---|:---:|---|
| **Primitive Palette** | `Primitive palette/source values.pdf` | `design-system/tokens.css` (lines 14–120) | **Implemented & Tested** | Ink, Slate, Ochre, Amber, Emerald primitives match hex values |
| **Semantic Colour (Light)** | `Semantic colour/Light.pdf` | `design-system/tokens.css` (lines 190–320) | **Implemented & Tested** | 16/16 contrast checks pass WCAG 2.2 AA ($\ge 4.5:1$) |
| **Semantic Colour (Dark)** | `Semantic colour/Dark.pdf` | `design-system/tokens.css` (lines 330–480) | **Implemented & Tested** | All dark mode surfaces and text pass WCAG 2.2 AA |
| **Typography (DM Sans)** | `Typography/DM Sans.pdf` | `@fontsource/dm-sans` & `public/fonts/` | **Implemented & Tested** | 8 local WOFF2 files (400, 500, 600, 700); 0 remote font calls |
| **OpenType Features** | `Typography/DM Sans.pdf` | `design-system/typography.css` | **Implemented & Tested** | Binary font scan confirms no `tnum`/`zero`; no fake simulation |
| **Spacing & Measurement**| `Spacing, radius & interaction foundations.pdf`| `design-system/tokens.css` (8pt base) | **Implemented & Tested** | `check-grid.mjs` verifies zero non-grid values |
| **Touch Targets** | `Spacing, radius & interaction foundations.pdf`| `--size-target: 48px`, `--size-target-lg: 64px` | **Implemented & Tested** | All interactive controls $\ge 48$px; primary actions $64$px |
| **Border Radii** | `Spacing, radius & interaction foundations.pdf`| `--radius-card: 8px`, `--radius-control: 6px` | **Implemented & Tested** | Standardized in tokens; no pill buttons |
| **Elevation & Shadows** | `Spacing, radius & interaction foundations.pdf`| `--shadow-raised`, `--shadow-float`, `--shadow-sheet`| **Implemented & Tested** | Soft, restrained CSS box shadows |
| **Buttons** | `Controls and form inputs.pdf` | `src/components/ui/Button.tsx` | **Implemented & Tested** | Primary (64px), Secondary (48px), Ghost (48px) |
| **Icon Buttons** | `Controls and form inputs.pdf` | `.tl-icon-btn` (`ThemeToggle.tsx`, back) | **Implemented & Tested** | $48\text{px} \times 48\text{px}$ touch targets |
| **Confirm Button** | `Controls and form inputs.pdf` | `src/components/forms/ConfirmButton.tsx` | **Implemented & Tested** | Interactive toggle gate before verdict comparison |
| **Registration Number Field**| `Controls and form inputs.pdf` | `src/components/forms/RegistrationNumberInput.tsx`| **Implemented & Tested** | 64px height, monospace code styling, auto-capitalization |
| **Text Inputs** | `Controls and form inputs.pdf` | `src/components/forms/TextInput.tsx` | **Implemented & Tested** | 56px height, accessible labels, focus-visible ring |
| **Form Fields & Validation**| `Controls and form inputs.pdf` | `src/components/forms/FormField.tsx` | **Implemented & Tested** | Semantic `<label>`, hint text, error `role="alert"` |
| **Surfaces & Cards** | `Evidence and record objects.pdf` | `src/components/ui/Surface.tsx` | **Implemented & Tested** | Neutral card container with subtle border |
| **Number Plates** | `Evidence and record objects.pdf` | `src/components/ui/NumberPlate.tsx` | **Implemented & Tested** | Prominent NAFDAC registration badge |
| **Status Labels** | `Evidence and record objects.pdf` | `src/components/ui/StatusLabel.tsx` | **Implemented & Tested** | Confirmed, pending, error, and stale statuses |
| **Verdict Slips** | `Evidence and record objects.pdf` | `src/components/verdict/VerdictSlip.tsx` | **Implemented & Tested** | Renders exactly 1 of 4 approved verdicts |
| **Ink Stamp** | `Evidence and record objects.pdf` | `src/components/verdict/InkStamp.tsx` | **Implemented & Tested** | 64px physical evidence stamp motif |
| **Mandatory Caveat** | `PRD Section 3 & Rule 3` | `src/components/feedback/Caveat.tsx` | **Implemented & Tested** | Permanent non-dismissible copied-number caveat |
| **Dialogs & Bottom Sheets**| `States, feedback and overlays.pdf` | `src/components/feedback/BottomSheet.tsx` | **Implemented & Tested** | `role="dialog"`, `aria-modal="true"`, Escape key dismiss |
| **Toasts** | `States, feedback and overlays.pdf` | `src/components/feedback/Toast.tsx` | **Implemented & Tested** | `role="status"`, `aria-live="polite"`, auto-dismiss |
| **Progress Indicators** | `States, feedback and overlays.pdf` | `src/components/feedback/StageProgress.tsx` | **Implemented & Tested** | 3-stage reading progress pipeline |
| **Loading Indicators** | `States, feedback and overlays.pdf` | `src/components/feedback/LoadingIndicator.tsx`| **Implemented & Tested** | Accessible spinner and loading text |
| **Error Messages** | `States, feedback and overlays.pdf` | `src/components/feedback/ErrorMessage.tsx` | **Implemented & Tested** | `role="alert"` with actionable recovery guidance |
| **Audio Notice** | `PRD Blocker B-06` | `src/components/feedback/AudioNotice.tsx` | **Implemented & Tested** | Explains audio disabled pending native sign-off |
| **Native SVG Icons (16)** | `Icons/neutral evidence language.pdf` | `src/components/icons/` | **Implemented & Tested** | 16 native SVG icons; 0 font icons; 0 emojis |
| **Product Illustrations (8)**| `Product illustration kit.pdf` | `src/components/illustrations/` | **Implemented & Tested** | 8 pack-type SVG React components |
| **Supporting Illustrations (5)**| `Illustrations/pack-reading schematics.pdf`| `src/components/illustrations/` | **Implemented & Tested** | 5 operational schematic SVG React components |
| **Mobile Bottom Navigation** | `Navigation, capture and structure.pdf` | `src/components/layout/BottomNav.tsx` | **Implemented & Tested** | 64px height, dynamic active route matching |
| **Desktop Header Navigation**| `Navigation, capture and structure.pdf` | `src/components/layout/Header.tsx` | **Implemented & Tested** | Dynamic inline desktop nav on wide viewports ($\ge 768$px) |
| **App Shell & Layout** | `Navigation, capture and structure.pdf` | `src/components/layout/AppShell.tsx` | **Implemented & Tested** | Fluid mobile and desktop layout containers |

---

## 2. Product-Pack Illustrations Inventory (8 Components)

All 8 product-pack illustrations defined in `Product illustration kit.pdf` are implemented as editable, reusable SVG React components in `src/components/illustrations/`:

1. `SachetWaterIllustration.tsx`: Sealed water sachet with ribbed heat-seal bands and printed NAFDAC badge.
2. `TomatoPasteTinIllustration.tsx`: Cylindrical canned food tin with top rim, pull tab, and label band.
3. `BottleIllustration.tsx`: Glass/plastic beverage bottle with screw cap, neck taper, and central label.
4. `CartonIllustration.tsx`: Folding pharmaceutical/food carton with tuck-in flap lines and barcode area.
5. `ToothpasteTubeIllustration.tsx`: Flexible toothpaste tube with crimped bottom seal and threaded nozzle cap.
6. `CreamJarIllustration.tsx`: Cosmetic jar with domed screw lid and wide cylindrical body.
7. `NoodlePackIllustration.tsx`: Pillow-pouch instant noodle wrapper with crimped end seals and seasoning pouch outline.
8. `BlisterStripIllustration.tsx`: 10-cavity pharmaceutical push-through blister foil packaging.

---

## 3. Supporting Illustrations Inventory (5 Components)

All 5 operational illustrations from `Illustrations/pack-reading schematics.pdf` are implemented in `src/components/illustrations/`:

1. `PackCaptureIllustration.tsx`: Pack framing schematic with viewfinder boundary marks.
2. `EmptyHistoryIllustration.tsx`: Minimal archive tray indicating zero stored history.
3. `OfflineIllustration.tsx`: Restrained severed connection schematic.
4. `ReadingIllustration.tsx`: Pack schematic under neutral linear scanning beam.
5. `MedicineLabelIllustration.tsx`: Medicine bottle schematic highlighting printed direction panel.
