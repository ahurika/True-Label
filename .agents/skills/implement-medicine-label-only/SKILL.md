---
name: implement-medicine-label-only
description: Guides the implementation of the medicine module in strict label-only mode, faithful direction display, strength confirmation, and pharmacist escalation notices. Use when implementing or modifying medicine-related UI, domain, or API logic.
---

# Implement Medicine Label-Only Skill

## 1. Purpose
Governs the implementation of TrueLabel's medicine category features, strictly enforcing the "label-only" boundary established in PRD v3.1 Section 1.1, Section 10.7, and Appendix A. Prevents the accidental introduction of dangerous clinical or dosing features.

## 2. When to Use
- Implementing medicine card views, extraction displays, or confirmation flows.
- Developing or testing medicine active ingredient and strength confirmation logic.
- Implementing plain-language label restatements (if formally approved by a licensed pharmacist).
- Auditing medicine UI copy for regulatory and medical disclaimers.

## 3. Prerequisites
- Familiarity with PRD Section 10.7.
- `medicine-info-panel` component styles in `design-system/components.css`.
- Pharmacist approval gate status (Blocker B-05).

## 4. Required Context
- Absolute Boundary: TrueLabel is an aid to read printed packaging, **never a medication management, dosing, or clinical decision tool**.
- Prohibited Features:
  - NO dose calculations or weight/age dosing suggestions.
  - NO medication schedule cards, timetables, or calendars.
  - NO frequency interpretation (e.g., shorthand like BD, TDS, QDS, PRN, or "12 hourly" must never be converted to schedules).
  - NO intake funnels asking "Who will take this?".
  - NO interaction checks or symptom checkers.

## 5. Step-by-Step Workflow
1. **Extract Printed Information**: Capture `activeIngredients` (name and strength) and `printedDirections` verbatim from the packaging.
2. **Require Explicit Strength Confirmation**:
   - Present active ingredients and strength (e.g. "Artemether 20mg / Lumefantrine 120mg") to the user.
   - User must explicitly confirm that the extracted strength matches their physical packaging.
   - If strength is missing or unreadable, positive match (`Registered and matches`) is blocked.
3. **Render Verbatim Directions**:
   - Render the raw printed text in `.medicine-info-panel__printed-text`.
   - Preserve all original numbers, units, frequency terms, routes, and warnings exactly as printed.
4. **Handle Ambiguous Directions**:
   - If printed directions are torn, faded, or shorthand, display: *"Directions on the pack are unclear. Do not guess. Ask a pharmacist."*
5. **Attach Mandatory Pharmacist Escalation Notice**:
   - Render the permanent notice:
     > *"For questions about how to use this medicine, ask a pharmacist. Do not rely on this app to change the directions on the pack."*
6. **Guard Optional Plain-Language Restatement (B-05 Gate)**:
   - If a restatement is attempted, run an automated token preservation check comparing input and output.
   - If any number, dosage unit, active ingredient name, or duration changes, abort restatement and display verbatim printed text.

## 6. Decision Points
- *Has a licensed pharmacist signed off on the restatement feature?* If NO (B-05 open), lock the interface strictly to verbatim label display. Do not render any generated restatement.
- *What if the user asks in chat/support for advice on child dosage?* Fail closed with immediate pharmacist escalation message.

## 7. Safety Checks
- Verify that no schedule cards, reminder buttons, or dosage calculators exist in code.
- Verify that `Registered and matches` requires explicit strength confirmation.
- Check that the pharmacist disclaimer is visible without requiring user expansion.

## 8. Testing Requirements
- Unit tests for token preservation in any medicine label processing.
- UI tests verifying that clinical shorthand is preserved verbatim and never translated to clock times.
- Visual inspection ensuring prominent rendering of the pharmacist disclaimer.

## 9. Expected Deliverables
- `MedicineInfoPanel` component (`src/components/medicine/MedicineInfoPanel.tsx`).
- Medicine confirmation step in `ConfirmForm`.
- Vitest test suite (`tests/domain/medicine.test.ts`).

## 10. Definition of Done
- 100% faithful reproduction of printed medicine packaging text.
- Zero dosing or scheduling features in the codebase.
- Verified presence of the mandatory pharmacist escalation disclaimer.

## 11. Common Mistakes to Avoid
- Interpreting "TDS" as "take 3 times a day at 8am, 2pm, 8pm".
- Adding a "Add to Calendar" or "Set Reminder" button for medicines.
- Inferring strength from brand name when strength is unreadable on the pack.
