# TrueLabel: Agent Engineering & Product Governance Guidelines

> **Authority Statement**: This document constitutes the permanent, non-negotiable engineering foundation, agent runtime directives, and operational rulebook for all autonomous agents and engineers working on the TrueLabel codebase. The authoritative product specification is **TrueLabel PRD v3.1 (Post-Audit Revision, 17 November 2026)** (`docs/product/TrueLabel_PRD_v3.1_Post_Audit_Revision.docx` / `PRD .md`). If any prompt, tool suggestion, external convention, or legacy note conflicts with PRD v3.1, **PRD v3.1 strictly supersedes it**.

---

## 1. Project Identity & Product Purpose

**TrueLabel** is a mobile-first web application designed for Nigerian consumers, everyday shoppers, and family caregivers. It provides a guided packaging reading workflow that extracts printed pack details (brand, product name, registration number, manufacturer, batch, expiry dates) and compares them against available official reference records, manually curated NAFDAC registry entries, and verified public NAFDAC alerts.

It renders exactly one evidence-based verdict in **English (`en`)** or **Nigerian Pidgin (`pcm`)**, with optional audio once reviewed and signed off by native speakers.

TrueLabel exists to promote transparency and evidence-based verification at the point of purchase or use.

---

## 2. Agent Roles, Instruction Hierarchy & Conflict Resolution

### 2.1 Autonomous Agent Personas
When operating in this repository, agents act as a senior cross-functional product engineering team:
1. **Principal Product Designer**: Visual clarity, design tokens, non-misleading visual hierarchy.
2. **Senior Design Systems Engineer**: CSS custom properties, component consistency, WCAG 2.2 AA.
3. **Senior Frontend Engineer**: Next.js App Router, React Server Components, client-side compression.
4. **Senior Backend Engineer**: Stateless API routes, decoupled TypeScript domain library, caching.
5. **Senior DevOps & Infrastructure Engineer**: Vercel deployments, Neon connection pooling, CI/CD, rollbacks.
6. **Application Security Engineer**: Zero image persistence, NDPA compliance, HMAC sender hashing, rate limiting.
7. **QA & Test Automation Engineer**: Vitest unit suites, Playwright E2E, 80-image evaluation dataset.
8. **Technical Product Architect**: System boundaries, PRD traceability, failure behavior, data modeling.

### 2.2 Instruction Precedence Hierarchy
1. **TrueLabel PRD v3.1 (Post-Audit Revision)** is the supreme authority on all requirements, boundaries, verdicts, and data semantics.
2. **Root `AGENTS.md` (this file)** is the sole authoritative project-wide agent instruction document.
3. **Modular Agent Rules (`.agents/rules/`)** provide targeted, glob-scoped or always-on domain constraints.
4. **Antigravity Skills (`.agents/skills/`)** provide step-by-step execution workflows for specialized tasks.
5. **Technical Documentation (`docs/`)** provides detailed architectural and operational references.
6. *Conflict Rule*: If a task instruction or user assumption conflicts with PRD v3.1, halt, flag the conflict, and adhere to PRD v3.1. If the PRD does not specify a visual design detail, document it as a **design proposal** rather than claiming it is an approved product decision.

---

## 3. Core Product Boundary (The Non-Authentication Stance)

1. **Evidence Comparison Only**: TrueLabel evaluates documentary evidence regarding a product's printed registration number and official public warning notices.
2. **No Physical Authentication**: TrueLabel **does not** authenticate the physical or chemical contents of a pack, establish that a product is safe or genuine, or replace NAFDAC, a licensed pharmacist, an analytical laboratory, or a statutory regulator.
3. **The Copied Number Reality**: Counterfeiters frequently copy authentic, active registration numbers and legitimate manufacturer details onto fake packaging. Therefore, finding an exact match in an official registry **never proves** that the physical contents inside the pack are genuine, safe, or unadulterated.
4. **Prohibited Terminology**: No TrueLabel-authored copy, UI text, notification, or documentation may claim that a product is:
   - "Genuine" or "Original"
   - "Fake" or "Counterfeit" (unless quoting the exact title of an official NAFDAC alert)
   - "Authentic" or "Verified"
   - "Safe", "Pure", or "Fit for consumption"
   - "Lab-tested" or "Approved by TrueLabel"
5. **The Mandatory Copied-Number Caveat**: Every screen, card, or shared view displaying the positive verdict `Registered and matches` must visibly, permanently, and non-dismissibly display:
   > *"A registered number can appear on a copied or counterfeit pack. This check compares available records and does not authenticate the physical contents or prove safety."*

---

## 4. Architectural Separation: AI vs. Deterministic Logic

| Responsibility | Handled By | Prohibited Actors |
|---|---|---|
| Image OCR & Structured Field Extraction | Multimodal Vision Model (Schema JSON) | Deterministic regex (as sole extractor) |
| Field Normalization & Sanitization | Pure TypeScript Domain Library (`src/domain/`) | AI Model |
| Registry Lookup & Record Comparison | Pure TypeScript Domain Library | AI Model |
| Public Alert Matching | Pure TypeScript Domain Library | AI Model |
| **Verdict Selection** | **Pure Deterministic Code (Priority 1 to 4)** | **AI Model (STRICTLY FORBIDDEN)** |
| Result Explanation | Fixed Structured Templates | Generative Free-form LLM |

### The "Zero-AI Verdict" Law
The multimodal vision model reads packaging text and estimates confidence. **Under no circumstances may an AI model select, adjust, recommend, or override a verdict.** The verdict engine is 100% deterministic, test-covered TypeScript code.

---

## 5. The Four Deterministic Verdicts & Precedence Rules

The engine evaluates rules in strict numerical sequence. The first matching rule wins:

```
[Scan & Confirm] 
       │
       ▼
1. Matches a NAFDAC Alert?  ──(YES)──► VERDICT 1: Matches a NAFDAC alert
       │ (NO)
       ▼
2. Number Problem?          ──(YES)──► VERDICT 2: Number problem
       │ (NO)
       ▼
3. Could Not Confirm?       ──(YES)──► VERDICT 3: Could not confirm
       │ (NO)
       ▼
4. All Gate Requirements Met?──(YES)──► VERDICT 4: Registered and matches
```

### 1. Priority 1: Matches a NAFDAC alert
- **Trigger**: Scanned pack matches an active NAFDAC alert via:
  1. An exact batch number match, OR
  2. An exact/approved close match to an *affected-pack name* explicitly named in the alert text.
- **Rule**: Stored evidence must record `alertId`, `matchedField`, `matchedValue`, and `matcherRule`. A brand-only match triggers an informational flag (`Alert on this brand`), **never** an Alert verdict.

### 2. Priority 2: Number problem
- **Trigger**:
  - The registration number is missing or malformed for the category;
  - A successfully retrieved, sufficiently complete record proves that the number belongs to a different product, brand, or manufacturer; OR
  - The matched record is explicitly marked inactive/expired in source records.
- **Coverage Rule**: Absence of a number in a registry source can **only** trigger `Number problem` if that source has `coverage: complete` for that category. Partial source coverage **never** justifies an absence-based `Number problem`.

### 3. Priority 3: Could not confirm
- **Trigger**: Critical data unreadable or unconfirmed; lookup failed/timed out; registry source is partial or unavailable for absence checking; category is unsupported; or required identity fields are missing/ambiguous.
- **Outcome**: Informative fallback advising retake, manual number entry, or official portal link-out.

### 4. Priority 4: Registered and matches
- **High-Evidence Gate (All 7 Mandatory Conditions Must Pass)**:
  1. Successful lookup returns an active record from an identified source with field-level provenance and checked date.
  2. Registration number is explicitly confirmed by the user and matches the record exactly after format-safe normalization. Do not silently correct a number.
  3. Brand, product name, and manufacturer are present in both scan and record and pass comparison rules. The user must be able to inspect and confirm these identity fields.
  4. Record status is active and not expired.
  5. The category/source combination is approved for positive matching.
  6. No alert applies (discloses number of alerts checked and index freshness date).
  7. Mandatory display of the copied-number caveat: *"A registered number can appear on a copied pack. This does not prove contents are genuine or safe."*

---

## 6. Strict Category & Medicine Boundaries

### 1. Medicine: Label-Only Mode (PRD Section 10.7)
- **Faithful Display**: Display only what is printed on the package (active ingredients, strength, printed directions, warnings).
- **Prohibited Medicine Features**:
  - NO dose calculations or weight/age dosing suggestions.
  - NO scheduling cards, calendars, or adherence reminders.
  - NO interpretation of shorthand (e.g., OD, BD, TDS, QDS, PRN, "12 hourly" must never be converted to schedules).
  - NO questions regarding "Who will take this?" to infer pediatric or pregnancy advice.
  - NO drug-drug or drug-food interaction algorithms.
- **Mandatory Pharmacist Notice**: Every medicine result must visibly display:
  > *"For questions about how to use this medicine, ask a pharmacist. Do not rely on this app to change the directions on the pack."*
- **Optional Plain-Language Restatement**: Gated by **Blocker B-05** (pharmacist sign-off). If attempted, automated token preservation checks must confirm 100% fidelity. Any mismatch fails closed to verbatim printed text.

### 2. Household Products (PRD Section 1.1 & 8.2)
- Household cleaning, chemical, and pesticide products receive extraction and public alert matching **only**.
- Household products have **no approved registry source** in v1 and **cannot receive a positive registration verdict** (`Registered and matches`).

---

## 7. Mandatory Explicit User Confirmation

The application must never silently assume AI-extracted values are correct:
- **Registration Number**: Always requires explicit user confirmation before running the verdict engine.
- **Medicine Strength**: Always requires explicit user confirmation before comparison.
- **Identity Fields**: Brand, product name, and manufacturer must be reviewable by the user before issuing `Registered and matches`.

---

## 8. Data Provenance & Registry Coverage Rules

1. **No Unsanctioned Scraping**: TrueLabel does not perform automated scraping or bulk harvesting of NAFDAC portals without written authorization.
2. **Field-Level Provenance**: Every seeded record in `RegistryRecord` must link to a valid `RegistrySource` with `sourceUrl`, `retrievedAt`, `lastVerifiedAt`, and verifier identity.
3. **Coverage Semantics**:
   - `complete`: Documented exhaustive list. Absence can imply non-registration.
   - `partial`: Curated seed list. Match indicates positive record; absence indicates `Could not confirm`.
   - `none`: No registry list. Never returns `Registered and matches`.
4. **Data Freshness**:
   - Registry records older than 90 days show a stale-data warning.
   - Public alert index older than 14 days shows a stale-alert warning.
   - Stale records cannot silently advance refresh dates.

---

## 9. Security, Privacy & Data Retention

1. **Zero Image Persistence**: TrueLabel does not intentionally persist uploaded product photos to disks, databases, object stores, or persistent application logs. Photos are processed in memory and discarded immediately.
2. **Provider Privacy Blocker (B-01)**: No image may be transmitted to any third-party AI vision provider until their data retention, model training, and subprocessor policies are formally reviewed and documented.
3. **Ephemeral Scan State**: Redis intermediate scan results expire strictly after **30 minutes**.
4. **ShareRecord Lifecycle**: Server-generated read-only share URLs contain confirmed text fields, verdict, and engine version (no images, no personal data). They expire strictly after **30 days**.
5. **Pseudonymous Identifiers**: WhatsApp sender IDs are stored only as `HMAC-SHA256(phone_number + server_secret)`. Never store raw phone numbers or claim HMACs are "anonymous".
6. **Log Hygiene**: Strip all request bodies, base64 payloads, OCR text, and headers containing credentials from application telemetry and Sentry.

---

## 10. Design System & Frontend Standards

1. **Visual Direction: "Evidence-First Clarity"**: Visual styling communicates credibility, restraint, and transparency (`design-system/`).
2. **Prohibited Aesthetics**: No gradients, no glassmorphism, no neon colors, no heavy decorative drop-shadows, no skeuomorphic approval seals, and no generic AI sparkle icons.
3. **Design Tokens**: Adhere strictly to tokens in `design-system/tokens.css` (4px spacing scale, neutral palette, system font stack, monospace data font).
4. **Touch Targets**: Minimum 44px by 44px for all buttons, inputs, toggles, and review fields.
5. **Accessibility (WCAG 2.2 AA)**: Contrast $\ge 4.5:1$ for body copy, unbroken 2px focus-visible outline, screen-reader landmarks, and full support for `prefers-reduced-motion`. Color must never be the sole indicator of state.
6. **Next.js App Router**: React Server Components by default; Client Components only when browser APIs or active state are needed. Initial JS bundle < 150 KB gzipped; client-side OffscreenCanvas image compression to < 500 KB target.

---

## 11. Backend, Database & Infrastructure Standards

1. **Pure TypeScript Domain Core**: All business logic (`src/domain/`) is 100% decoupled with zero framework or HTTP dependencies.
2. **Fail-Closed Architecture**: If external dependencies fail or time out, default cleanly to `Could not confirm`.
3. **Neon PostgreSQL & Prisma ORM**: Serverless pooled driver adapters (`@prisma/adapter-neon`); models matching PRD Section 16; scoped unique constraints on `[sourceId, category, registrationNumber]`; non-destructive expand-and-contract migrations.
4. **Upstash Redis**: Sliding window rate limiting and 30-minute intermediate scan state.
5. **Vercel Hosting**: Serverless/Edge functions with timeouts matched to p95 latency; automated daily cleanup via Vercel Cron.
6. **Spend Caps**: Daily AI extraction spend cap with 80% automated alert and circuit breaker.

---

## 12. Testing & Evaluation Mandates

1. **Multi-Tier Testing**:
   - Unit tests: 100% branch coverage on verdict selection and normalization.
   - Integration tests: Route validation, rate limits, Redis TTLs, Prisma queries.
   - End-to-end tests: Playwright mobile journeys (capture -> confirm -> verdict -> share).
2. **Fixed 80-Image Prototype Evaluation Dataset (PRD Section 12.5)**:
   - 30 Genuine clear packs ($\ge 90\%$ accuracy, 0 false alerts, 0 false Number problems).
   - 20 Difficult images ($\ge 75\%$ accuracy).
   - 10 Non-product images (100% rejected).
   - 10 Synthetic lookalikes ($\ge 9/10$ flagged).
   - 10 Prompt injection labels (0/10 followed, 100% resistance).
3. **Honest Reporting**: Report all evaluation gates as explicit ratios ($k$ of $n$). Never claim that 0 errors in an 80-image set implies a 0% real-world error rate.

---

## 13. Localization: English & Nigerian Pidgin

- Supported locales: English (`en`) and Nigerian Pidgin (`pcm`).
- No literal, machine-translated medical terms. Copy must be reviewed for cultural context and consumer clarity.
- Audio is optional. Pidgin audio requires two independent native-speaker sign-offs on all 20 test sentences before release.

---

## 14. Modular Agent Rules & Skills Integration

To ensure clean context management and maintain specialized engineering knowledge, the repository provides modular rules and executable skills under `.agents/`. **Agents must consult these modular assets when performing relevant tasks:**

### Modular Rules (`.agents/rules/`)
- `product-safety.md` (`always_on`): Core product safety boundaries, non-authentication stance, and medicine limits.
- `architecture-and-stack.md` (`always_on`): Technical stack, App Router, TypeScript, and Prisma standards.
- `design-system.md` (`glob`): UI styling, tokens, 44px touch targets, and visual consistency.
- `verdict-domain.md` (`glob`): Deterministic verdict engine, precedence order, and matching logic.
- `ai-extraction.md` (`glob`): Multimodal vision extraction, Zod validation, and injection resistance.
- `medicine-label-only.md` (`glob`): Medicine label-only display, zero dosing, and pharmacist notices.
- `data-and-prisma.md` (`glob`): Prisma schema constraints, relations, indexes, and idempotent seeds.
- `security-and-privacy.md` (`glob`): Zero image persistence, HMAC identifiers, 30m/30d TTLs, and rate limiting.
- `testing-and-evaluation.md` (`glob`): Testing pyramid, golden fixtures, and 80-image evaluation dataset.
- `i18n-and-content.md` (`glob`): Bilingual localization in English and Nigerian Pidgin (`en`/`pcm`).
- `devops-and-observability.md` (`glob`): CI quality gates, Vercel deployments, spend caps, and PII-redacted logs.

### Executable Skills (`.agents/skills/`)
When assigned specialized tasks, invoke the corresponding Antigravity skill:
- Building design system UI -> `implement-design-system`
- Implementing web scan journey -> `build-scan-flow`
- Coding verdict selection -> `implement-verdict-engine`
- Integrating vision models -> `integrate-ai-extraction`
- Implementing medicine packaging -> `implement-medicine-label-only`
- Seeding NAFDAC records/alerts -> `nafdac-data-provenance`
- Building secure API endpoints -> `secure-api-and-privacy`
- Managing Prisma schema & DB -> `prisma-migrations`
- Running tests & evaluation -> `testing-and-evaluation`
- Operations, CI/CD & deploy -> `deploy-and-observe`
- Localizing copy & audio -> `i18n-english-pidgin`
- Auditing accessibility -> `accessibility-review`

---

## 15. Prohibited Shortcuts & Definition of Done

### Prohibited Shortcuts
- Do not create mock or fabricated NAFDAC records, alerts, or registration numbers.
- Do not bypass Zod schema validation.
- Do not use `any` or `@ts-ignore` in TypeScript code.
- Do not import remote fonts or third-party tracking scripts.
- Do not implement unauthorized medicine dosing features.
- Do not commit secrets, API keys, or `.env` files.
- Do not create additional `AGENTS.md` files in subdirectories. Exactly ONE `AGENTS.md` exists at the project root.

### Definition of Done for Any Task
1. Aligns 100% with PRD v3.1 requirements and safety constraints.
2. Accompanied by comprehensive unit/integration tests with edge cases covered.
3. Accessible according to WCAG 2.2 AA (contrast, keyboard focus, screen readers).
4. Zero TypeScript errors and zero linter warnings.
5. All intermediate scan data subject to explicit expiration and privacy redaction.
6. Documentation and PRD traceability matrix updated.
