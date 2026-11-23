# TrueLabel Technical SEO Strategy & Indexing Architecture

> **Authoritative Baseline**: Next.js App Router Native Metadata APIs & PRD v3.1 Privacy Boundaries.

This document details the search discoverability, route classification, technical SEO implementation, and privacy-first indexing strategy for TrueLabel.

---

## 1. Route Classification Matrix

To protect user confidentiality, ephemeral scan sessions, OCR data, and local receipts are strictly excluded from search engine indexing:

| Route Pattern | Category | Indexing Directive | Canonical URL | Justification |
|---|---|---|---|---|
| `/` | Public Marketing / Entry | `index, follow` | `https://truelabel.ng/` | Main landing page and educational overview |
| `/help` | Public Educational | `index, follow` | `https://truelabel.ng/help` | Public methodology, verdict definitions, and packaging guide |
| `/unavailable` | System Degraded | `noindex, follow` | `https://truelabel.ng/unavailable` | Transient error / outage page |
| `/offline` | System Offline | `noindex, follow` | `https://truelabel.ng/offline` | Transient offline fallback |
| `/scan/**` | Application Flow | `noindex, nofollow` | N/A | Ephemeral capture & image reading session |
| `/review/**` | User Confirmation | `noindex, nofollow` | N/A | Intermediate transcription review & user inputs |
| `/result/**` | Verification Results | `noindex, nofollow` | N/A | User scan results (private documentary evaluation) |
| `/history` | User Account / Receipts | `noindex, nofollow` | N/A | On-device personal verification receipts |
| `/api/**` | Backend Endpoints | `noindex, nofollow` | N/A | Programmatic endpoints |

---

## 2. Technical SEO Implementation Details

### 2.1 Dynamic Metadata & OpenGraph (`src/app/layout.tsx` & `src/config/site.ts`)
- **Metadata Base**: Dynamically configured via `siteConfig.url` (defaults to `https://truelabel.ng` or configurable through `NEXT_PUBLIC_SITE_URL`).
- **Title Template**: `%s · TrueLabel` with default `TrueLabel — Before you buy, read the label.`
- **OpenGraph & Twitter Cards**:
  - `og:type`: `website`
  - `og:locale`: `en_NG`
  - `og:site_name`: `TrueLabel`
  - `twitter:card`: `summary_large_image`
- **Canonical URLs**: Every indexable page defines an explicit canonical URL to prevent duplicate content penalties.

### 2.2 Dynamic XML Sitemap (`src/app/sitemap.ts`)
Generated dynamically by Next.js App Router at `/sitemap.xml`:
- Includes `/` (priority: `1.0`, frequency: `weekly`)
- Includes `/help` (priority: `0.8`, frequency: `weekly`)
- Includes `/offline` and `/unavailable` (priority: `0.2`, frequency: `monthly`)
- Strictly excludes all private scan, review, and result routes.

### 2.3 Dynamic Robots Directives (`src/app/robots.ts`)
Generated dynamically by Next.js App Router at `/robots.txt`:
```text
User-Agent: *
Allow: /
Allow: /help
Allow: /offline
Allow: /unavailable
Disallow: /scan/
Disallow: /scan
Disallow: /review/
Disallow: /review
Disallow: /result/
Disallow: /result
Disallow: /history/
Disallow: /history
Disallow: /api/

Sitemap: https://truelabel.ng/sitemap.xml
```

---

## 3. Schema.org Structured Data (JSON-LD)

Implemented on `src/app/page.tsx` via valid JSON-LD graph:
- **`Organization`**:
  - Name: `TrueLabel`
  - Description: Packaging evidence verification tool for Nigerian consumers
  - URL: Canonical site URL
- **`SoftwareApplication`**:
  - Application Category: `UtilitiesApplication`
  - Operating System: `All modern web browsers (Mobile-first)`
  - Price: `0 NGN` (Free consumer public tool)
- **`WebPage` / `WebSite`**:
  - Search engine discoverable entity graph without fake review or endorsement schemas.

---

## 4. Privacy & Anti-Leak Safeguards
1. **No URL Parameter Leakage**: Sensitive pack details or batch numbers are never passed in public query strings indexed by search crawlers.
2. **Robots Meta Tag Redundancy**: Private pages include explicit `robots: { index: false, follow: false }` metadata in addition to `robots.txt` disallows.
3. **HTTP Header Security**: Production deployment enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict referrer policy.
