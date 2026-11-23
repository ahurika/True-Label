---
name: deploy-and-observe
description: Manages CI/CD pipelines, Vercel deployments, Neon database migrations, health monitoring, PII-redacted logging, and incident rollback procedures. Use when deploying code, configuring infrastructure, setting spend caps, or investigating incidents.
---

# Deployment, Operations & Observability Skill

## 1. Purpose
Defines the standard operational procedures for deploying TrueLabel to Vercel and Neon Serverless, executing zero-downtime database migrations, managing daily AI spend caps, monitoring application health, and executing rollbacks.

## 2. When to Use
- Preparing a production or staging release.
- Running CI quality gate checks before merging pull requests.
- Configuring environment variables and secrets on Vercel or Neon.
- Setting up or tuning Sentry error tracking, alerts, and log redactions.
- Triaging production incidents and executing emergency rollbacks.

## 3. Prerequisites
- Vercel CLI and access permissions.
- Neon Serverless PostgreSQL project credentials with connection pooling.
- GitHub repository secrets configured for CI/CD.

## 4. Required Context
- Hosting: Next.js App Router deployed on Vercel Serverless/Edge.
- Database: Neon PostgreSQL via Prisma with pooled connections.
- Cache: Upstash Redis for rate limiting and 30-minute intermediate scan results.
- Sensitive Data Rule: Never log raw image bytes, user phone numbers, or unredacted OCR dumps to Sentry or Vercel logs.
- Daily Spend Cap: System must fail closed gracefully if the AI provider budget limit is reached.

## 5. Step-by-Step Workflow
1. **Pre-Deployment CI Quality Gates**:
   - Ensure GitHub Actions workflow runs:
     1. `pnpm run typecheck` (strict TypeScript, 0 errors).
     2. `pnpm run lint` (ESLint, 0 warnings).
     3. `pnpm run test` (Vitest unit and domain tests).
     4. `pnpm run test:e2e` (Playwright smoke journeys).
     5. `pnpm run eval:smoke` (Smoke test of 10 golden fixtures).
2. **Database Migration Deployment**:
   - Run `npx prisma migrate deploy` in the deployment pipeline against the direct database URL.
   - Verify that all migrations applied cleanly before traffic shifts to the new container/function.
3. **Vercel Production Deployment**:
   - Deploy build artifact: `vercel deploy --prod`.
   - Verify environment variable parity across production (database URL, Redis REST credentials, server secret).
4. **Post-Deployment Health Checks**:
   - Hit `/api/health` to verify database connection, Redis connectivity, and engine version hash.
   - Run a synthetic test scan using a pre-approved test image fixture.
5. **Observability & Cost Monitoring**:
   - Monitor p95 latency: Photo submission to confirm (< 12s), confirm to verdict (< 3s).
   - Track daily AI extraction invocation counts. If spend exceeds 80% of daily threshold, trigger an alert. If spend cap is reached, trip circuit breaker to show: *"Service limit reached for today. Please try again tomorrow."*
6. **Incident Rollback Procedure**:
   - If critical bugs, false alert verdicts, or PII leakage occur:
     1. Instant rollback via Vercel dashboard or `vercel rollback <deployment-url>`.
     2. If database schema was altered, apply backward-compatible compensation script.
     3. Clear Redis intermediate cache if corruption is suspected.

## 6. Decision Points
- *Should we deploy if 1 unit test in the domain package fails?* Never. All domain and verdict engine tests must pass with 100% success.
- *What if the AI provider latency spikes to 20 seconds?* Log circuit breaker warning; prompt the user to retry or switch to manual number entry.

## 7. Safety Checks
- Verify Sentry configuration: Confirm `sendDefaultPii: false` and test payload scrubbing for base64 images and phone numbers.
- Confirm all production secrets are set via Vercel project settings and never checked into Git.
- Verify that Vercel Cron jobs are active for daily cleanup of expired `ShareRecord` entries.

## 8. Testing Requirements
- Automated smoke verification in deployment pipeline.
- Periodic drill of the Vercel instant rollback procedure on a staging preview URL.

## 9. Expected Deliverables
- `.github/workflows/ci.yml`: Automated quality pipeline.
- `src/app/api/health/route.ts`: Operational health check endpoint.
- `docs/engineering/DEPLOYMENT_RUNBOOK.md`: Comprehensive operational guide.

## 10. Definition of Done
- Clean CI pipeline pass on every production push.
- Zero PII in production log streams.
- Functional automated rollbacks and spend cap tripwires.

## 11. Common Mistakes to Avoid
- Running destructive `prisma migrate reset` in production.
- Forgetting to configure pooled Neon connection strings, causing serverless connection exhaustion.
- Logging full incoming HTTP request bodies in production error reporting.
