import { describe, it, expect } from 'vitest';
import prisma from '../db';

describe('Neon PostgreSQL Database Client (Prisma ORM)', () => {
  it('instantiates the Prisma client', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe('object');
  });

  it('exposes the approved PRD Section 16 models', () => {
    expect(prisma.registrySource).toBeDefined();
    expect(prisma.registryRecord).toBeDefined();
    expect(prisma.referenceProduct).toBeDefined();
    expect(prisma.alert).toBeDefined();
    expect(prisma.shareRecord).toBeDefined();
    expect(prisma.whatsAppSession).toBeDefined();
    expect(prisma.whatsAppMessage).toBeDefined();
    expect(prisma.extractionLog).toBeDefined();
    expect(prisma.event).toBeDefined();
  });
});
