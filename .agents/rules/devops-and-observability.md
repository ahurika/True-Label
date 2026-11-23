---
trigger: glob
globs: [".github/**/*.yml", "vercel.json", "src/lib/observability/**/*.ts", "src/lib/logger/**/*.ts", "scripts/**/*.sh", "scripts/**/*.ts"]
description: Governs CI/CD pipelines, Vercel deployments, logging hygiene, and operational spend caps
---

# DevOps, CI/CD & Observability Rules

## 1. CI Quality Gates (.github/workflows)
Every pull request and merge commit must pass the following automated quality checks:
1. `pnpm run typecheck` (TypeScript strict mode, 0 errors).
2. `pnpm run lint` (ESLint and style linting, 0 warnings).
3. `pnpm run test` (Vitest unit and domain test suite, 100% pass).
4. `pnpm run test:e2e` (Playwright smoke tests for critical user journeys).
5. Evaluation smoke check verifying zero regressions on golden alert fixtures.

## 2. Safe Deployment and Rollback Procedures
- Use Vercel preview environments for staging verification before production deployment.
- Database migrations must run prior to code deployment via Prisma migrate deploy and be strictly backward-compatible.
- Maintain an immediate rollback playbook: Vercel instant deployment rollback and Prisma down-migration or compensation scripts.

## 3. Observability & Logging Hygiene (PRD Section 11.3 & 13)
- **Zero Sensitive Data in Logs**: Application logs and telemetry streams must be rigorously redacted. Never log:
  - Raw image bytes, base64 strings, or thumbnail URLs.
  - Complete OCR output buffers.
  - User telephone numbers or raw IP addresses.
  - Personal health information or medicine usage inquiries.
- Sentry integration must have PII scraping disabled, headers scrubbed, and request body logging deactivated.

## 4. Spend Caps and Cost Controls (PRD Section 13)
- Monitor AI provider, Neon Postgres, and Upstash Redis usage.
- Configure daily spend caps on vision extraction APIs.
- If the daily spend cap is reached, the application must gracefully fail closed: display a clear "Daily service limit reached, please try again tomorrow" notice rather than returning broken results or fabricated verdicts.
