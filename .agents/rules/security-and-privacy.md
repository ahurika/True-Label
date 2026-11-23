---
trigger: glob
globs: ["src/app/api/**/*.ts", "src/lib/security/**/*.ts", "src/middleware.ts", "src/lib/rate-limit/**/*.ts", "src/lib/privacy/**/*.ts"]
description: Governs API security, PII minimization, zero image persistence, rate limiting, and retention
---

# Application Security & Privacy Architecture Rules

## 1. Zero Image Persistence (PRD Section 11.3)
- TrueLabel **never intentionally persists** uploaded user product photographs to persistent database storage, local disks, object storage (S3/Vercel Blob), or application log streams.
- Images are processed in server memory for vision model inference and immediately discarded.
- In-flight client images must not be stored in IndexedDB by default; clear scan data actions must be accessible.

## 2. AI Provider Privacy Blocker (PRD Section 11.2 - B-01)
- Never route product photographs to an external vision model until the provider's contractual terms for data retention, model training opt-out, and subprocessor compliance have been reviewed, documented, and formally approved.

## 3. Strict Data Retention Windows
- **Intermediate Scan Results**: Redis TTL of exactly **30 minutes**.
- **ShareRecord**: Database TTL of exactly **30 days**. Must contain only confirmed text fields, verdict, flags, and engine version (zero images, zero personal data).
- **Audio Cache**: Approved fixed-phrase TTS output only.

## 4. Pseudonymous Identifiers (Never Raw PII)
- Never store raw telephone numbers, device IMEI/MAC addresses, or cleartext user identifiers.
- WhatsApp sender numbers must be hashed immediately upon webhook entry using `HMAC-SHA256(phone_number + SERVER_SECRET)`.
- Always describe these identifiers as "pseudonymous", never as "anonymous".

## 5. API Boundary Security & Rate Limiting
- Enforce strict Zod validation on every API endpoint. Request bodies exceeding 4 MB must be rejected with HTTP 413.
- Rate limiting powered by Upstash Redis must guard all scan and extraction endpoints to mitigate automated scraping and denial-of-wallet attacks.
- Enforce standard security headers: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (DENY), and X-Content-Type-Options (nosniff).

## 6. Webhook Signature Verification
- Inbound webhooks (e.g. Meta WhatsApp Cloud API) must verify the cryptographic payload signature (`X-Hub-Signature-256`) against the raw request body before processing.
