# TrueLabel Application Architecture & Technical Specification

> **Authority Statement**: Built strictly in accordance with **TrueLabel PRD v3.1** and the approved **TrueLabel Figma Design System**.

---

## 1. Architectural Philosophy: Evidence-First Clarity

TrueLabel is a mobile-first web application designed for Nigerian consumers to evaluate printed packaging details against available official records, curated NAFDAC registries, and public recall alerts.

The system is architected around three foundational laws:
1. **The Non-Authentication Boundary**: TrueLabel compares documentary packaging evidence. It **never authenticates physical or chemical contents**, does not certify safety, and never uses prohibited terminology ("genuine", "original", "safe", "fake").
2. **The Zero-AI Verdict Law**: Multimodal vision AI reads text and estimates extraction confidence. **Under no circumstances may an AI model select, adjust, or override a verdict.** Verdict selection is 100% deterministic TypeScript domain code.
3. **Zero Image Retention**: Product packaging photos are processed in ephemeral memory and discarded immediately. No images are saved to persistent disks, cloud buckets, databases, or application telemetry.

---

## 2. Directory Structure & Layer Responsibilities

```text
True Label/
├── .env                              # Environment configuration (Neon DB, Upstash Redis, SEO)
├── .env.example                      # Template with connection string documentation
├── prisma/
│   └── schema.prisma                 # PRD Section 16 data model for Neon PostgreSQL
├── public/
│   ├── fonts/                        # 8 self-hosted WOFF2 files for DM Sans (400, 500, 600, 700)
│   ├── images/                       # Static public assets
│   └── icons/                        # PWA web manifest icons
├── design-system/
│   ├── tokens.css                    # Primitives, semantic tokens, Light/Dark themes, touch targets
│   ├── reset.css                     # Accessible reset, focus-visible ring, prefers-reduced-motion
│   ├── typography.css                # DM Sans type scale, code/numeric styling (no fake tnum/zero)
│   ├── layout.css                    # Breakpoint containers (360, 390, 430, 768, 1440), stacks, clusters
│   ├── components.css                # Buttons, icon buttons, desktop/mobile navigation, verdict slips
│   ├── forms.css                     # 56px inputs, 64px registration number fields, labels, error states
│   ├── feedback.css                  # Bottom sheets, modal scrims, toasts, stage progress, caveats
│   ├── utilities.css                 # Spatial and typographic helper utilities
│   ├── global.css                    # Master design system entrypoint
│   └── scripts/                      # Automated CI verification scripts (check-grid, check-contrast)
├── src/
│   ├── app/                          # Next.js App Router (RSC by default)
│   │   ├── (public)/                 # Public indexable routes: /, /help, /offline, /unavailable
│   │   ├── (application)/            # Private user flows: /scan/**, /review/**, /result/**, /history
│   │   ├── layout.tsx                # Master root layout with SEO metadata and theme script
│   │   ├── globals.css               # Imports design system global.css
│   │   ├── sitemap.ts                # Dynamic XML sitemap generator
│   │   └── robots.ts                 # Dynamic robots.txt with strict private route disallow rules
│   ├── components/                   # Reusable UI & presentation layer
│   │   ├── ui/                       # Button, Surface, NumberPlate, StatusLabel, SpecRow, CheckRow
│   │   ├── layout/                   # AppShell, Header, BottomNav, Stack, Section, ThemeToggle
│   │   ├── forms/                    # FormField, TextInput, RegistrationNumberInput, ConfirmButton
│   │   ├── feedback/                 # BottomSheet, Toast, StageProgress, LoadingIndicator, Caveat
│   │   ├── verdict/                  # VerdictSlip, VerdictIcon, InkStamp
│   │   ├── icons/                    # 16 native SVG icons (Ledger, Bell, Flag, MagnifierQuestion, etc.)
│   │   └── illustrations/            # 8 pack-type + 5 schematic SVG React components
│   ├── config/                       # Application configuration
│   │   ├── navigation.ts             # Central dynamic navigation model & active route matcher
│   │   └── site.ts                   # Site SEO metadata, URLs, keywords, OpenGraph
│   ├── domain/                       # Pure TypeScript Domain Core (Zero HTTP / React dependencies)
│   │   ├── verdict-types.ts          # Authoritative Verdict 1–4 enum definitions & mapping
│   │   └── verdict/                  # Deterministic verdict engine & format normalization
│   ├── features/                     # Feature-specific state and service logic
│   │   ├── scanning/                 # Camera simulation, file picker, scenario selection
│   │   ├── verification/             # Verdict evaluation service adapter
│   │   ├── medicine/                 # Strict PRD §10.7 label-only review logic
│   │   └── history/                  # Local check receipts (off by default)
│   ├── lib/                          # Data access & infrastructure adapters
│   │   ├── db/                       # Neon Serverless PostgreSQL connection pooling via Prisma
│   │   ├── db.ts                     # Prisma client export
│   │   └── seo/                      # Schema.org structured data generators
│   └── messages/                     # Bilingual localization dictionaries
│       ├── en.json                   # English UI strings and legal disclaimers
│       └── pcm.json                  # Nigerian Pidgin translations (verdicts remain statutory English)
└── docs/                             # Engineering governance and acceptance documentation
    ├── architecture/                 # Application architecture and SEO strategy
    ├── implementation/               # Design system inventory & missing screens guide
    ├── journeys/                     # End-to-end user journeys mapping
    └── testing/                      # Test specifications and evaluation methodology
```

---

## 3. Database Architecture (Neon Serverless PostgreSQL)

TrueLabel uses PostgreSQL on **Neon Serverless** accessed via **Prisma ORM** with the `@prisma/adapter-neon` serverless driver adapter.

### Connection Architecture
- **Connection Pooling**: Neon provides an integrated connection pooler (PgBouncer) for high-concurrency serverless function environments. Configured via `DATABASE_URL` with `?sslmode=require`.
- **Direct Connection**: Migrations (`prisma migrate dev / deploy`) connect directly to Neon compute via `DIRECT_URL`.
- **Fail-Closed Strategy**: External database connection timeouts or query errors gracefully fall closed to **Verdict 4 (`Could not confirm`)** rather than surfacing 500 crashes or false match claims.

### Core Data Models (PRD Section 16)
1. **`RegistrySource`**: Documents official data provenance (`name`, `category`, `coverage`: `complete`/`partial`/`none`, `sourceUrl`, `lastCheckedAt`).
2. **`RegistryRecord`**: Authorized records with composite uniqueness on `[sourceId, category, registrationNumber]`.
3. **`ReferenceProduct`**: Pack visual details, physical checklist items, and label directions.
4. **`Alert`**: Official public NAFDAC alerts indexed by batch numbers and affected-pack names.
5. **`ShareRecord`**: Ephemeral 30-day read-only share receipts containing confirmed text only (zero images, zero PII).

---

## 4. State Management & Privacy Guarantees

### Client-Side State
- **Form & Scan Flow**: Managed through React state and Next.js route transitions (`/scan` -> `/review` -> `/result`).
- **Theme Preference**: Stored strictly as a `'light'` or `'dark'` string in `localStorage.getItem('tl-theme')`.
- **Scan History**: Retained in client `localStorage` only when explicitly toggled on by user (PRD §10.9). Off by default.

### Memory & Network Hygiene
- Zero packaging images are written to cookies, `sessionStorage`, or `IndexedDB`.
- No image blobs are leaked via `URL.createObjectURL` without immediate garbage collection.
- Server logs, Sentry traces, and analytics scrub all OCR payloads and base64 image strings.
