---
trigger: glob
globs: ["messages/**/*.json", "src/i18n/**/*.ts", "src/locales/**/*.json", "src/app/[locale]/**/*.tsx"]
description: Governs localization in English and Nigerian Pidgin, translation safety, and audio quality gates
---

# Internationalization & Content Governance Rules

## 1. Supported Locales (PRD Section 1.1 & 10.8)
- **English (`en`)**: Primary baseline locale.
- **Nigerian Pidgin (`pcm`)**: Primary localization locale for West African consumer accessibility.
- *Deferred*: Hausa, Yoruba, and Igbo are non-goals for v1 and must not be introduced until formally scoped and validated.

## 2. Translation Integrity and Medical Safety
- Never perform automated word-for-word machine translation of clinical terms, medical label text, or legal disclaimers.
- Pidgin translations must be reviewed by native speakers to ensure cultural nuance, clarity, and avoidance of misleading colloquialisms.
- The meaning of disclaimers (e.g. copied number caveat, pharmacist escalation) must remain mathematically and semantically identical across languages.

## 3. Approved Terminology Matrix
| Concept | English (`en`) | Nigerian Pidgin (`pcm`) | Notes |
|---|---|---|---|
| Product check | "Check pack details" | "Check wetin dey body" | Avoid words meaning "authenticate" |
| Registered and matches | "Registered and matches" | "E register and e match" | High evidence; not proof of physical contents |
| Number problem | "Number problem" | "Wahala dey the number" | Indicates conflict with official record |
| Could not confirm | "Could not confirm" | "We no fit confirm am" | Honest disclosure of missing data |
| Matches a NAFDAC alert | "Matches a NAFDAC alert" | "NAFDAC alert dey on top am" | Points to specific recall or seizure |
| Pharmacist escalation | "Ask a pharmacist" | "Go ask pharmacist" | Mandatory on all medicine labels |

## 4. Voice & Audio Quality Gates
- Text-to-speech (TTS) audio is non-blocking and optional.
- **Pidgin Audio Gate**: Pidgin audio may only be enabled if **two independent native speakers** review all 20 test audio sentences and rate 100% of them as clear and accurate. If this gate fails, ship reviewed Pidgin text only with audio disabled.
