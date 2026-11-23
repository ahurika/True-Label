import { NextRequest, NextResponse } from 'next/server';
import { getScanRecord, deleteScanRecord } from '@/lib/server/scan-store';

export const runtime = 'nodejs';

/**
 * GET /api/scans/:id
 * Returns current processing state and extracted details if available.
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
        message: 'This scan has expired or does not exist. Scan sessions expire after 30 minutes.',
        retryable: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    scanId: scan.id,
    status: scan.status,
    consentGranted: scan.consentGranted,
    extractedData: scan.extractedData,
    confirmedInput: scan.confirmedInput,
    hasVerdict: Boolean(scan.verdictResult),
    expiresAt: new Date(scan.expiresAt).toISOString(),
  });
}

/**
 * DELETE /api/scans/:id
 * Immediately purges transient scan state on user request.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteScanRecord(id);

  return NextResponse.json({
    success: true,
    deleted,
    message: deleted ? 'Scan state purged.' : 'Scan not found or already expired.',
  });
}
