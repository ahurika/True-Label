---
trigger: glob
globs: ["src/**/medicine/**/*.ts", "src/**/medicine/**/*.tsx", "src/domain/medicine/**/*.ts", "src/app/**/medicine/**/*.tsx"]
description: Governs the medicine category: strict label-only mode, zero dosing, and pharmacist notices
---

# Medicine Category & Label-Only Rules

## 1. Locked Scope: Faithful Label Display
The medicine module is strictly restricted to faithful, literal presentation of printed pack directions (PRD Section 10.7). It is an aid for reading physical labels, **not a clinical decision or medication-use tool**.

## 2. Strictly Prohibited Medicine Functionality
Under no circumstances may any engineer or agent introduce:
- Dosing calculations or dosage recommendations based on age, weight, or symptoms.
- Medication schedules, timetables, reminder notifications, or calendar exports.
- Frequency conversions or interpretations of clinical shorthand (e.g., converting "TDS" to "take three times daily at 8am, 2pm, 8pm"). Shorthand must remain printed as-is with a note that it is unclear.
- "Who is taking this?" intake funnels or pediatric/pregnancy advice branching.
- Drug-drug or drug-food interaction checks.
- Adherence tracking.

## 3. Mandatory Explicit Confirmation
- Medicine **active ingredients and strength** (e.g. "Paracetamol 500mg") must be explicitly confirmed by the user before running the verdict comparison.
- If strength is missing or ambiguous, `Registered and matches` is prohibited.

## 4. Plain-Language Restatement Invariant (PRD Section 10.7)
If an optional AI text restatement is enabled:
- It must only restate printed instructions in simpler language without altering meaning.
- It must preserve every number, unit, medicine name, route, frequency, and duration.
- Code-level validation must compare input and output tokens. If any number or medical unit differs, the system must immediately fail closed and display the exact verbatim printed text.
- Pharmacist sign-off is mandatory before any restatement feature can be released to users.

## 5. Required Disclaimers
Every medicine UI surface must display the permanent, prominent disclaimer:
> *"For questions about how to use this medicine, ask a pharmacist. Do not rely on this app to change the directions on the pack."*
