---
trigger: always_on
description: Architecture standards, technical stack, and code organization conventions
---

# Architecture and Stack Standards Rule

## 1. Approved Technical Stack (PRD Section 14)
- **Framework**: Next.js App Router (React Server Components by default; Client Components only when browser APIs or interaction state are required).
- **Language**: TypeScript in strict mode (`"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`).
- **Validation**: Zod for all external boundaries (API request bodies, query params, server environment variables, AI vision JSON responses).
- **Database & ORM**: PostgreSQL (Neon Serverless) accessed via Prisma ORM with pooled connection adapters.
- **Cache & Ephemeral Storage**: Upstash Redis for distributed rate limiting, 30-minute intermediate scan results, and queue deduplication.
- **Hosting & Runtime**: Vercel Serverless/Edge functions with configured maximum duration aligned with evaluated p95 latency.
- **Testing**: Vitest for unit and integration domain logic; Playwright for end-to-end user flows.

## 2. Server/Client Separation & Data Leaks
- Never expose server-side environment variables or AI provider API keys to the client (`NEXT_PUBLIC_` prefixes are forbidden for secrets).
- Vision model prompts, registry credentials, and Redis connections must remain exclusively on the server.
- Intermediate scan payloads must never leak raw image buffers or full OCR texts in client-facing API responses.

## 3. Pure TypeScript Domain Library
- All core business rules—including normalization, registration number validation, similarity calculation, alert matching, and the verdict engine—must reside in a decoupled, pure TypeScript domain module (e.g. `src/domain/`).
- The domain module must have **zero dependencies** on React, Next.js request contexts, or external HTTP clients.
- It must be 100% deterministic and unit-tested in isolation.

## 4. Error Handling and Resilience
- Follow "Fail Closed" design: If an external dependency (AI model, Redis, Postgres, NAFDAC external link) fails or times out, the system must return a clean, user-friendly fallback (`Could not confirm` where evidence is missing), never a 500 error or a false positive.
- Use explicit result types (e.g. `Result<T, E>`) or structured exceptions with error codes.
