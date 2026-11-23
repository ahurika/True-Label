import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as extractRoute } from '../extract/route';
import { parsePackText } from '@/lib/ocr/pack-parser';
import { NextRequest } from 'next/server';

describe('/api/extract Route', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('extracts structured packaging fields in test environment with test-fixture source', async () => {
    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'mock_base64_payload',
      }),
    });

    const res = await extractRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.source).toBe('test-fixture');
    expect(data.isLiveAi).toBe(false);
    expect(data.data).toBeDefined();
    expect(data.data.registrationNumber).toBeDefined();
    expect(data.data.brandName).toBeDefined();
    expect(data.data.productName).toBeDefined();
    expect(data.data.category).toBeDefined();
  });

  it('reports status 503 blocked when GEMINI_API_KEY is missing outside test environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.GEMINI_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'mock_base64_payload',
      }),
    });

    const res = await extractRoute(req);
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.status).toBe('blocked');
    expect(data.error).toBe('AI_CREDENTIALS_MISSING');
    expect(data.canFallbackToManual).toBe(true);
  });

  it('parsePackText correctly parses medicine packaging text', () => {
    const ocrText = `
      Emzor Pharmaceutical Industries Ltd
      Paracetamol 500mg Tablets
      NAFDAC REG NO: 04-1234
      BATCH: B2026-X1
      EXP: 12/2028
    `;
    const result = parsePackText(ocrText);
    expect(result.category).toBe('medicine');
    expect(result.brandName).toBe('Emzor');
    expect(result.registrationNumber).toBe('04-1234');
    expect(result.strength).toBe('500mg');
  });

  it('parsePackText correctly parses food packaging text', () => {
    const ocrText = `
      Flour Mills of Nigeria Plc
      Golden Penny Semovita
      NAFDAC REG NO: 01-0812
      BATCH: S2026-09
    `;
    const result = parsePackText(ocrText);
    expect(result.category).toBe('food');
    expect(result.brandName).toBe('Golden Penny');
    expect(result.registrationNumber).toBe('01-0812');
  });
});
