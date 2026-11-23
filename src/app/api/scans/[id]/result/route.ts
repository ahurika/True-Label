import { NextRequest, NextResponse } from 'next/server';
import { getScanRecord } from '@/lib/server/scan-store';

export const runtime = 'nodejs';

/**
 * GET /api/scans/:id/result
 * Returns the evaluated verdict and evidence references for an active scan.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = getScanRecord(id);

  if (!scan) {
    return NextResponse.json(
      {
        code: 'SCAN_EXPIRED',
        message: 'Scan session expired or not found.',
        retryable: false,
      },
      { status: 404 }
    );
  }

  if (!scan.verdictResult) {
    return NextResponse.json(
      {
        code: 'CONFIRMATION_REQUIRED',
        message: 'This scan has not yet been confirmed and evaluated.',
        retryable: false,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    scanId: scan.id,
    status: scan.status,
    result: scan.verdictResult,
    confirmedPack: scan.confirmedInput,
    expiresAt: new Date(scan.expiresAt).toISOString(),
  });
}
