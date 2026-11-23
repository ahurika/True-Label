import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handlePostScans } from '../scans/route';
import { GET as handleGetScan, DELETE as handleDeleteScan } from '../scans/[id]/route';
import { PATCH as handlePatchConfirm } from '../scans/[id]/confirm/route';
import { GET as handleGetScanResult } from '../scans/[id]/result/route';
import { POST as handlePostShare } from '../shares/route';
import { GET as handleGetShare } from '../shares/[token]/route';
import { POST as handlePostFeedback } from '../feedback/route';

describe('PRD v4.0 RESTful API Contracts', () => {
  let createdScanId = '';
  let shareToken = '';

  it('POST /api/scans creates an ephemeral scan for manual entry', async () => {
    const req = new NextRequest('http://localhost:3000/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isManualOnly: true, consentGranted: true }),
    });

    const res = await handlePostScans(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.scanId).toBeDefined();
    expect(data.status).toBe('pending');
    createdScanId = data.scanId;
  });

  it('GET /api/scans/:id retrieves active scan state', async () => {
    const req = new NextRequest(`http://localhost:3000/api/scans/${createdScanId}`);
    const res = await handleGetScan(req, { params: Promise.resolve({ id: createdScanId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.scanId).toBe(createdScanId);
    expect(data.hasVerdict).toBe(false);
  });

  it('PATCH /api/scans/:id/confirm evaluates deterministic comparison', async () => {
    const req = new NextRequest(`http://localhost:3000/api/scans/${createdScanId}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: '04-1234',
        isNumberConfirmedByUser: true,
        brand: 'Emzor',
        productName: 'Paracetamol 500mg Tablets',
        manufacturer: 'Emzor Pharmaceutical Industries Ltd',
        isIdentityConfirmedByUser: true,
        category: 'medicine',
        medicineStrength: '500mg',
        isStrengthConfirmedByUser: true,
        batchNumber: 'B999',
      }),
    });

    const res = await handlePatchConfirm(req, { params: Promise.resolve({ id: createdScanId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('verified');
    expect(data.result).toBeDefined();
    expect(data.result.verdict).toBe('registry_match');
    expect(data.result.mandatoryCaveat).toBe(true);
  });

  it('GET /api/scans/:id/result returns validated result', async () => {
    const req = new NextRequest(`http://localhost:3000/api/scans/${createdScanId}/result`);
    const res = await handleGetScanResult(req, { params: Promise.resolve({ id: createdScanId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result.verdict).toBe('registry_match');
  });

  it('POST /api/shares generates read-only share token', async () => {
    const req = new NextRequest('http://localhost:3000/api/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: createdScanId }),
    });

    const res = await handlePostShare(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.shareUrl).toContain(data.token);
    shareToken = data.token;
  });

  it('GET /api/shares/:token retrieves read-only share data without photos', async () => {
    const req = new NextRequest(`http://localhost:3000/api/shares/${shareToken}`);
    const res = await handleGetShare(req, { params: Promise.resolve({ token: shareToken }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.confirmedPack.brand).toBe('Emzor');
    expect(data.data.verdictResult.verdict).toBe('registry_match');
    expect(data.data.capturedPreviewUrl).toBeUndefined(); // Zero photo retention
  });

  it('DELETE /api/scans/:id purges transient scan', async () => {
    const req = new NextRequest(`http://localhost:3000/api/scans/${createdScanId}`, { method: 'DELETE' });
    const res = await handleDeleteScan(req, { params: Promise.resolve({ id: createdScanId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.deleted).toBe(true);
  });

  it('POST /api/feedback records feedback without PII', async () => {
    const req = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'medicine',
        issueType: 'suspected_fake',
        registrationNumber: '04-0123',
        details: 'Packaging has spelling error on manufacturer address.',
      }),
    });

    const res = await handlePostFeedback(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.referenceId).toBeDefined();
  });
});
