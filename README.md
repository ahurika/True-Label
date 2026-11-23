# TrueLabel: Production Application & Engineering Foundation

> **Authoritative Specification**: **TrueLabel PRD v3.1 (Post-Audit Revision, 17 November 2026)** (`docs/product/TrueLabel_PRD_v3.1_Post_Audit_Revision.docx` / `PRD .md`).

---

## 1. Product Identity & Purpose

**TrueLabel** is a mobile-first web application designed for Nigerian consumers, shoppers, and family caregivers. It provides an evidence-based packaging reading workflow that extracts printed packaging details (brand, product name, registration number, manufacturer, batch, expiry dates) and compares them against official NAFDAC reference records, curated registry entries, and verified public NAFDAC alerts.

It renders exactly one evidence-based verdict in **English (`en`)** or **Nigerian Pidgin (`pcm`)**, accompanied by clear evidence context and practical next steps.

### The Non-Authentication Boundary
- TrueLabel checks **available documentary evidence** regarding a product's registration and public warning notices.
- **It does not authenticate physical contents**: Illicit or counterfeit manufacturers frequently print authentic registration numbers on fake packs. A positive registry match never proves that the contents are genuine, pure, or safe.
- **Prohibited Terminology**: TrueLabel never claims a product is "genuine", "authentic", "fake", "original", "verified safe", or "approved".
- **The Mandatory Copied-Number Caveat**: Every positive verdict (`Registered and matches`) permanently and non-dismissibly displays:
  > *"A registered number can appear on a copied or counterfeit pack. This check compares available records and does not authenticate the physical contents or prove safety."*

---

## 2. Technical Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js App Router | 15.5+ | Hybrid React Server Components & Client UI |
| **Runtime** | Node.js / React | 24+ / 19.0 | Modern React server rendering & client hydration |
| **Language** | TypeScript (Strict) | 5.7+ | 100% strict type safety (`noImplicitAny`, zero `any`) |
| **Domain Layer** | Pure TypeScript | — | 100% deterministic verdict engine (`src/domain/`) |
| **Styling** | Evidence-First Design Tokens + Tailwind | 3.4+ | System typography, neutral palette, 44px touch targets |
| **Localization** | `next-intl` | 3.26+ | Bilingual routing & strings in English (`en`) and Pidgin (`pcm`) |
| **Database & ORM** | PostgreSQL (Neon) + Prisma ORM | 6.4+ | Scoped unique constraints, relations, and connection pooling |
| **Caching & State** | Upstash Redis (REST) | 1.34+ | Ephemeral 30m scan state and sliding-window rate limiting |
| **Validation** | Zod | 3.24+ | Boundary schema validation on all inputs and API payloads |
| **Unit Testing** | Vitest | 3.2+ | Blazing fast unit tests on pure domain logic |
| **E2E Testing** | Playwright | 1.50+ | Mobile browser journeys (Pixel 7 / iPhone 13 emulation) |

---

## 3. Quickstart & Developer Commands

### Prerequisites
- Node.js `v20+` or `v24+`
- `pnpm` `v10+` or `v12+`

### Installation
```bash
pnpm install
```

### Development Server
```bash
pnpm run dev
# Open http://localhost:3000 in your browser
```

### Type Checking & Linting
```bash
# Strict TypeScript compilation check (0 errors required)
pnpm run typecheck

# ESLint audit (0 errors, 0 warnings required)
pnpm run lint
```

### Running Test Suites
```bash
# Run Vitest pure domain & service unit tests
pnpm test

# Run Vitest in interactive watch mode
pnpm run test:watch

# Run Playwright mobile end-to-end tests
pnpm run test:e2e
```

### Production Build
```bash
# Compile optimized production Next.js build
pnpm run build

# Start production server
pnpm start
```

---

## 4. Architecture & Directory Tree

```text
TrueLabel/
├── AGENTS.md                          # Single authoritative agent directive file
├── README.md                          # This engineering overview
├── KIT_MANIFEST.json                  # Inventory of engineering foundation assets
│
├── prisma/
│   └── schema.prisma                  # Authoritative PostgreSQL schema matching PRD Section 16
│
├── design-system/                     # Evidence-First Clarity CSS Design System
│   ├── tokens.css                     # Spacing, typography, neutral palette, feedback colors
│   ├── reset.css                      # Accessible browser normalization
│   ├── typography.css                 # System font stack, monospace data font
│   ├── layout.css                     # Mobile-first stacks, grids, containers
│   ├── components.css                 # Buttons (min 44px), cards, badges, modal dialogs
│   ├── forms.css                      # Inputs, review controls, confirmation toggles
│   ├── feedback.css                   # The 4 distinct verdict visual states
│   ├── utilities.css                  # Token-bound utility classes
│   └── global.css                     # Master stylesheet entrypoint
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── [locale]/                  # Locale-scoped routes (en, pcm)
│   │   │   ├── layout.tsx             # Root layout with Header, Footer, and next-intl
│   │   │   ├── page.tsx               # Landing page with manual pack verification
│   │   │   ├── manual/page.tsx        # Dedicated manual verification page
│   │   │   ├── error.tsx              # Accessible fail-closed error boundary
│   │   │   ├── loading.tsx            # Accessible loading spinner
│   │   │   └── not-found.tsx          # 404 page
│   │   ├── api/                       # API routes
│   │   │   └── verify/manual/route.ts # Manual verification endpoint (Zod validated)
│   │   └── globals.css                # Global CSS importing design-system/global.css
│   │
│   ├── components/                    # UI Components
│   │   ├── common/                    # Header, Footer, LanguageSwitcher
│   │   ├── verdict/                   # VerdictCard (Priority 1-4 with mandatory caveats)
│   │   └── manual/                    # ManualEntryForm (Accessible form with 44px targets)
│   │
│   ├── domain/                        # Pure TypeScript Domain Core (Zero framework dependencies)
│   │   ├── types.ts                   # Enums (Verdict, Category, ReasonCode, Flag) and contracts
│   │   ├── normalization/             # Registration numbers, brand names, and server dates
│   │   ├── matching/                  # Damerau-Levenshtein lookalike and identity matchers
│   │   ├── alerts/                    # Official public recall alert matching logic
│   │   ├── verdict/                   # Positive Gate (7 conditions) and Prioritized Verdict Engine
│   │   └── index.ts                   # Public domain exports
│   │
│   ├── services/                      # Application Services
│   │   ├── verification/              # Pack verification service & curated seed records
│   │   └── ai/                        # VisionExtractor interface, Zod schemas, mock extractor
│   │
│   ├── lib/                           # Shared infrastructure libraries
│   │   ├── db.ts                      # Neon PostgreSQL Prisma client singleton
│   │   ├── redis.ts                   # Upstash Redis client with in-memory fallback
│   │   └── security/                  # HMAC-SHA256 WhatsApp sender pseudonymization
│   │
│   └── i18n/                          # Localization Infrastructure
│       ├── routing.ts                 # next-intl navigation helpers
│       └── request.ts                 # next-intl request server config
│
├── messages/                          # Translation Dictionaries
│   ├── en.json                        # English locale strings
│   └── pcm.json                       # Nigerian Pidgin locale strings
│
├── tests/                             # Multi-tier Automated Test Suites
│   ├── domain/                        # Pure domain verdict & normalization tests
│   ├── services/                      # Verification service integration tests
│   └── e2e/                           # Playwright mobile end-to-end smoke tests
│
├── docs/                              # Engineering & Product Governance Documentation
│   ├── product/                       # PRD v3.1 authoritative document
│   ├── architecture/                  # System, frontend, backend, data, and security specs
│   ├── design/                        # Design system tokens, inventory, accessibility
│   ├── engineering/                   # Audit, scaffolding report, workflow, runbooks
│   └── product-governance/            # Safety limits, blockers register, traceability
│
└── .agents/                           # Antigravity Modular Agent System
    ├── rules/                         # 11 glob-scoped and always-on engineering rules
    └── skills/                        # 12 executable engineering workflows
```

---

## 5. Architectural Separation: AI vs. Deterministic Code

| Responsibility | Handled By | Prohibited Actors |
|---|---|---|
| Image OCR & Structured Field Extraction | Multimodal Vision Model (Schema JSON) | Regex (as sole extractor) |
| Field Normalization & Sanitization | Pure TypeScript Domain (`src/domain/`) | AI Model |
| Registry Lookup & Record Comparison | Pure TypeScript Domain (`src/domain/`) | AI Model |
| Public Alert Matching | Pure TypeScript Domain (`src/domain/`) | AI Model |
| **Verdict Selection** | **Pure Deterministic Code (Priority 1 to 4)** | **AI Model (STRICTLY FORBIDDEN)** |
| Result Explanation | Fixed Structured Templates | Generative Free-form LLM |

---

## 6. Active Governance Blockers

As documented in `docs/product-governance/DECISION_REGISTER.md` and `docs/engineering/PRE_IMPLEMENTATION_READINESS_AUDIT.md`, the codebase operates with strict safeguards around 5 active blockers:

1. **Blocker B-01 (Third-Party AI Vision Privacy)**: Direct photo upload is gated. The application provides manual number verification (`/manual`) running the full deterministic verdict engine, and mock vision extractors for CI/CD.
2. **Blocker B-02 (NAFDAC Scraping Authorization)**: Zero unsanctioned scraping. All data is populated from curated, verified reference seeds with field-level provenance.
3. **Blocker B-05 (Medicine Plain-Language Restatement)**: Locked. Medicines display printed packaging text verbatim with mandatory pharmacist disclaimer.
4. **Blocker B-08 (Reporting Fake Packs to NAFDAC)**: In-app reporting is restricted to official external portal links.
5. **Blocker B-13 (Nigerian Pidgin Audio)**: Disabled until 2 independent native speakers sign off on all 20 test recordings. Text localization in Pidgin is fully operational.
