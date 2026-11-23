---
trigger: always_on
description: Core product safety and non-authentication boundaries for TrueLabel
---

# Product Safety and Non-Authentication Boundary Rule

## 1. Absolute Product Boundary
TrueLabel evaluates documentary evidence about product registration and official NAFDAC alerts. It **never** verifies the chemical or physical contents of a product, does not detect counterfeit formulation or adulteration, and does not certify that a product is safe or approved for consumption.

## 2. Prohibited Terminology
Never generate, suggest, or include copy (in English or Nigerian Pidgin) claiming that a product is:
- "Genuine" or "Original"
- "Fake" or "Counterfeit" (unless directly quoting an official NAFDAC alert)
- "Authentic"
- "Safe" or "Pure"
- "Lab-tested"
- "Approved by TrueLabel"

## 3. The Copied Number Invariant
Every user interface displaying `Registered and matches` must visibly state the copied-number limitation:
> *"A registered number can appear on a copied or counterfeit pack. This check compares available records and does not authenticate the physical contents or prove safety."*

## 4. Medicine Label-Only Constraint
- The medicine module is strictly restricted to faithful reproduction of printed label directions.
- **Never** compute or suggest dosages.
- **Never** convert frequency shorthand (e.g. BD, TDS, QDS, PRN) into dosing schedules.
- **Never** create calendar reminders or medication schedules.
- **Never** ask demographic questions (e.g. child, pregnancy) to alter medical advice.
- Always append the pharmacist disclaimer: *"For questions about how to use this medicine, ask a pharmacist. Do not rely on this app to change the directions on the pack."*

## 5. Household Products Restriction
- Products classified as `household` (e.g. bleach, insecticides, detergents) have **no approved registry source** in v1.
- Household products may receive extraction and alert matching only.
- Under no circumstances may a household product be assigned the verdict `Registered and matches`.

## 6. Mandatory Confirmation Gate
- Registration number **must** be explicitly confirmed by the user before running the verdict engine.
- Medicine strength **must** be explicitly confirmed by the user.
- If critical identity fields are unreadable or unconfirmed, the engine must fall back to `Could not confirm`.
