import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * TrueLabel Database Access Client (Neon PostgreSQL via Prisma)
 * In accordance with PRD v3.1 Section 14 & 16:
 * Serverless pooled connection adapter via @prisma/adapter-neon.
 */

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Checks whether a live, reachable Neon PostgreSQL database is configured.
 */
export function isDatabaseConfigured(): boolean {
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_LIVE_DB) {
    return false;
  }
  const connectionString = process.env.DATABASE_URL;
  return Boolean(
    connectionString &&
      !connectionString.includes('ep-sample') &&
      !connectionString.includes('sample') &&
      connectionString.startsWith('postgresql://')
  );
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (isDatabaseConfigured() && connectionString) {
    // Configure neon connection pooling adapter with connectionString
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  // Fallback for build time and local offline development before credentials are provided
  return new PrismaClient({
    log: ['error'],
  });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
