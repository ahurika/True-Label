---
name: secure-api-and-privacy
description: Implements API security, rate limiting, request validation, zero image retention, webhook verification, and PII minimization across all endpoints. Use when building or auditing API routes, privacy controls, middleware, or data retention jobs.
---

# Secure API & Privacy Engineering Skill

## 1. Purpose
Guides the implementation of application security controls and strict privacy protections as mandated by PRD v3.1 Section 11, Section 13, and the Nigeria Data Protection Act (NDPA).

## 2. When to Use
- Implementing or updating API routes (`/api/scan/*`, `/api/share/*`, `/api/report/*`, `/api/webhooks/*`).
- Configuring Upstash Redis rate limiting or session TTLs.
- Writing data retention and automated cleanup jobs.
- Auditing logs and error reporting pipelines to eliminate sensitive data leakage.

## 3. Prerequisites
- Upstash Redis client configured in `src/lib/redis.ts`.
- Server-side environment variables (`SERVER_SECRET`, `UPSTASH_REDIS_REST_URL`, `AI_PROVIDER_KEY`).
- Next.js middleware architecture.

## 4. Required Context
- Zero Image Persistence: User product photos must **never be written to persistent storage** (database, S3, Vercel Blob, local disk, or persistent logs).
- Retention Windows:
  - Intermediate scan state: **30 minutes** in Redis.
  - ShareRecord: **30 days** in Postgres (read-only, confirmed text only).
  - WhatsApp session state: **30 minutes**.
- Pseudonymous Identifiers: WhatsApp phone numbers must immediately be transformed via `HMAC-SHA256(phone + SERVER_SECRET)`. Raw phone numbers must never touch the database or logs.

## 5. Step-by-Step Workflow
1. **Enforce Request Boundary Protections**:
   - Limit incoming request bodies to 4 MB max (reject larger with HTTP 413).
   - Validate content-type headers (`application/json`, `multipart/form-data`).
2. **Implement Rate Limiting**:
   - Guard endpoints with Upstash Redis token bucket or sliding window algorithm.
   - Separate limits for scan initiation (e.g. 10 scans/hour per client/IP) and general read requests.
3. **Parse and Validate Payloads with Zod**:
   - Pass every incoming payload through strict Zod schemas (`.strict()` to strip unexpected fields).
4. **Enforce Zero Photo Persistence**:
   - Process image buffers strictly in server function RAM.
   - After vision extraction finishes or errors, immediately release image buffer references.
5. **Implement Webhook Cryptographic Verification**:
   - In `/api/webhooks/whatsapp`, verify `X-Hub-Signature-256` against the raw byte body using HMAC-SHA256 with Meta app secret before parsing JSON.
6. **Implement 30-Day ShareRecord Generation**:
   - When generating a share link, store only confirmed text fields, verdict, flags, and engine version.
   - Generate a high-entropy random token (`crypto.randomBytes(32).toString('hex')`) and store its SHA-256 hash in `ShareRecord.tokenHash`.
   - Set `expiresAt = now + 30 days`.
7. **Configure Sanitized Telemetry & Error Logging**:
   - Strip `headers['authorization']`, `headers['cookie']`, `body`, and query parameters containing phone numbers or OCR text.
   - Configure Sentry with `beforeSend` sanitization.

## 6. Decision Points
- *Can we save the user's uploaded image to troubleshoot an extraction bug?* Absolutely not. PRD Section 11.3 forbids intentional persistence of product photos. Debug using synthetic or consented evaluation fixtures only.
- *How should expired ShareRecords be handled?* Expired records must return HTTP 404/410 and be purged by daily scheduled cron tasks.

## 7. Safety Checks
- Verify that no raw telephone numbers, OCR text dumps, or image base64 strings appear in Sentry or server logs.
- Confirm that Redis intermediate keys declare an explicit `EX 1800` (30 minutes).
- Ensure all public share pages are marked with HTTP header `X-Robots-Tag: noindex, nofollow`.

## 8. Testing Requirements
- Unit tests for HMAC hashing functions and webhook signature verification.
- Rate-limiting integration tests checking HTTP 429 response upon exceeding quota.
- Security scan ensuring no `NEXT_PUBLIC_` environment variables expose backend secrets.

## 9. Expected Deliverables
- `src/lib/security/hmac.ts`: Cryptographic hashing utilities.
- `src/lib/rate-limit/limiter.ts`: Upstash Redis rate limiter.
- `src/middleware.ts`: Security headers and global protections.
- `src/app/api/share/route.ts`: Ephemeral, photo-free share link generator.

## 10. Definition of Done
- All API routes strictly validated and rate-limited.
- Zero image persistence across the full stack.
- Passing security automated test suite.

## 11. Common Mistakes to Avoid
- Describing HMAC identifiers as "anonymous" rather than "pseudonymous".
- Saving images to Vercel Blob or local `/tmp` folders.
- Trusting client-calculated verdicts in share link creation.
