---
trigger: glob
globs: ["src/domain/verdict/**/*.ts", "src/domain/matching/**/*.ts", "src/domain/normalization/**/*.ts", "src/domain/alerts/**/*.ts", "tests/domain/**/*.ts"]
description: Governs deterministic verdict selection, registry matching, and alert rules
---

# Verdict Domain & Matching Logic Rule

## 1. Zero AI Verdict Selection
The verdict engine is 100% deterministic code. An AI model must never select, alter, or weigh in on the verdict outcome.

## 2. Strict Precedence Order
The engine evaluates rules in strict sequence. The first rule satisfied produces the verdict:
1. **Priority 1: Matches a NAFDAC alert**
   - Requires exact match to batch number OR exact/approved close match to an *affected-pack name* explicitly cited in a verified NAFDAC alert.
   - Brand-only matches produce an informational flag (`Alert on this brand`), NEVER an Alert verdict.
   - Match evidence (`alertId`, `matchedField`, `matchedValue`, `matcherRule`) must be preserved in the verdict payload.
2. **Priority 2: Number problem**
   - Triggered when registration number is missing/malformed, points to a conflicting product in official records, or the record is explicitly inactive/expired.
   - **Crucial**: Absence of a number in a registry source can ONLY trigger `Number problem` if that source has `coverage: complete` for that category. Partial source coverage must NEVER yield an absence-based `Number problem`.
3. **Priority 3: Could not confirm**
   - Triggered when data is unreadable, lookup fails, source coverage is partial or none for absence checks, or required identity fields are missing/unconfirmed.
4. **Priority 4: Registered and matches**
   - Permitted ONLY when all 7 gates from PRD Section 5.1 are met (active record, exact normalized number match, confirmed identity fields, active status, approved category/source, zero active alerts, copied-number disclaimer attached).

## 3. String Normalization & Lookalike Matcher
- Preserve raw printed strings alongside normalized values.
- Normalization rules must be field-specific (e.g. registration number formatting vs brand name tokenization). Broad character replacements that could conflate distinct brands are prohibited.
- Lookalike brand similarity alone never drives an Alert verdict or a Number problem. It generates an informational flag only.
- Exact matches to genuine registered brands must never be flagged as lookalikes.

## 4. Testing Mandate
Every verdict branch, source coverage state (`complete`, `partial`, `none`), and edge condition must be covered by deterministic unit tests with golden test fixtures.
