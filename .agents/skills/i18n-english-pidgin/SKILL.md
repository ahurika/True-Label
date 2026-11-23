---
name: i18n-english-pidgin
description: Governs bilingual localization in English and Nigerian Pidgin (en and pcm), culturally nuanced translations, terminology consistency, and audio sign-off gates. Use when modifying translation dictionaries, language pickers, copy templates, or audio assets.
---

# Internationalization: English & Nigerian Pidgin Skill

## 1. Purpose
Establishes the standard workflow for maintaining TrueLabel's bilingual experience in English (`en`) and Nigerian Pidgin (`pcm`), ensuring culturally resonant, non-misleading terminology and rigorous native-speaker quality gates as mandated by PRD v3.1 Section 1.1, Section 10.8, and Appendix A.

## 2. When to Use
- Adding or editing localized copy in `messages/en.json` or `messages/pcm.json`.
- Implementing or modifying language switcher components.
- Reviewing medical disclaimers or verdict explanations for linguistic clarity.
- Evaluating Text-to-Speech (TTS) audio assets against native-speaker sign-off gates.

## 3. Prerequisites
- `next-intl` configuration in Next.js App Router (`src/i18n/`).
- Standardized terminology dictionary (PRD Section 1.1 and rule `i18n-and-content.md`).
- Access to two independent native Nigerian Pidgin speakers for translation review.

## 4. Required Context
- Supported Locales: `en` (English) and `pcm` (Nigerian Pidgin). Other languages (Yoruba, Hausa, Igbo) are non-goals for v1.
- No Literal Machine Translation: Medical terms and disclaimers must never be translated word-for-word using generic translation tools.
- Audio Sign-Off Gate: Pidgin audio requires **two independent native speakers** to review all 20 standardized test sentences. 100% must be rated clear and accurate before audio is enabled. If this gate fails, ship reviewed Pidgin text only with audio disabled.

## 5. Step-by-Step Workflow
1. **Define Structured Translation Keys**:
   - Organize keys hierarchically in `messages/en.json` and `messages/pcm.json`:
     - `verdicts.*` (explicit titles, subtitles, explanations, caveats).
     - `scan.*` (camera instructions, image quality tips, confirm fields).
     - `medicine.*` (pharmacist disclaimers, directions labels).
     - `actions.*` (buttons, links, retake).
     - `errors.*` (network timeout, image blur, daily limit).
2. **Translate into Nigerian Pidgin with Native Nuance**:
   - Translate for conversational West African clarity, avoiding stilted or hyper-formal phrasings.
   - Example Approved Pairings:
     - `en`: *"Check pack details"* -> `pcm`: *"Check wetin dey body"*
     - `en`: *"Registered and matches"* -> `pcm`: *"E register and e match"*
     - `en`: *"Number problem"* -> `pcm`: *"Wahala dey the number"*
     - `en`: *"Could not confirm"* -> `pcm`: *"We no fit confirm am"*
     - `en`: *"Matches a NAFDAC alert"* -> `pcm`: *"NAFDAC alert dey on top am"*
     - `en`: *"A registered number can appear on a copied pack. This does not prove contents are genuine or safe."* -> `pcm`: *"Number fit correct make packaging be copy. Dis check no mean say wetin dey inside pure or safe."*
3. **Format Dates and Numbers**:
   - Format dates consistently (`DD MMMM YYYY`, e.g. "17 November 2026").
   - Display interpretation for month-only expiry dates ("End of November 2026").
4. **Implement Smooth Language Switching**:
   - Persist locale preference in client cookie or route segment (`/[locale]/...`).
   - Allow instant switching at any step in the scan flow without losing in-flight state.
5. **Execute Audio Review Gate (if TTS enabled)**:
   - Generate audio assets for the 20 approved fixed test sentences.
   - Have two native Pidgin speakers independently rate clarity, accent authenticity, and accuracy.
   - If either reviewer flags hesitation or unnatural cadence, keep audio disabled and display text only.

## 6. Decision Points
- *Can we use an external cloud translation API on the fly?* Never. All copy must be pre-approved static strings in versioned JSON dictionaries.
- *What if the audio vendor sounds like British English attempting Pidgin?* Reject immediately. Retain Pidgin text only.

## 7. Safety Checks
- Verify that both `en` and `pcm` translations include the identical legal and non-authentication limitations.
- Ensure that the pharmacist notice is present in both locales for medicine packs.
- Check that no prohibited terms ("genuine", "authentic", "safe") appear in either language.

## 8. Testing Requirements
- Unit tests verifying key parity between `messages/en.json` and `messages/pcm.json` (zero missing keys).
- Formative usability check with native Pidgin speakers (minimum 4 of 5 correctly understand verdict meanings).
- Wording audit test scanning 100 sample outputs for prohibited claims.

## 9. Expected Deliverables
- `messages/en.json`: Comprehensive English dictionary.
- `messages/pcm.json`: Verified Nigerian Pidgin dictionary.
- Language switcher component (`src/components/common/LanguageSwitcher.tsx`).
- Native-speaker audio audit sign-off sheet in `docs/product-governance/`.

## 10. Definition of Done
- Complete UI navigability in both English and Pidgin.
- 100% key parity across translation dictionaries.
- Zero machine-translated medical gibberish.

## 11. Common Mistakes to Avoid
- Translating "Registered and matches" to mean "NAFDAC approves this product".
- Dropping the copied-number caveat in the Pidgin translation.
- Blocking the UI if audio files fail to load.
