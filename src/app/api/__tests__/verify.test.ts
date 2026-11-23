import { describe, it, expect } from 'vitest';
import { POST as verifyRoute } from '../verify/route';
import { NextRequest } from 'next/server';

describe('/api/verify Route', () => {
  it('returns Verdict 1 with mandatory caveat for valid confirmed pack', async () => {
    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: 'A0-1234',
        isNumberConfirmedByUser: true,
        brand: 'Golden Penny',
        productName: 'Semovita (Fortified Wheat Flour)',
        manufacturer: 'Flour Mills of Nigeria Plc',
        isIdentityConfirmedByUser: true,
        category: 'food',
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result.verdictNumber).toBe(1);
    expect(data.result.verdictDefinition.title).toBe('Registered and matches');
    expect(data.result.mandatoryCaveat).toBe(true);
  });

  it('rejects missing registrationNumber with 400 validation error', async () => {
    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Sample Product',
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
  });
});
