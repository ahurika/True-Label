import { NextRequest, NextResponse } from 'next/server';
import { findRegistryRecord, findAlertMatch } from '@/lib/db/repository';
import { ProductCategory } from '@/domain/verdict/verdict-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lookup?regNo=01-0812&category=food
 * Look up official registry record and relevant public alerts.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const regNo = searchParams.get('regNo');
  const category = (searchParams.get('category') as ProductCategory) || undefined;
  const batchNumber = searchParams.get('batchNumber') || undefined;
  const productName = searchParams.get('productName') || undefined;

  if (!regNo) {
    return NextResponse.json(
      { success: false, error: 'regNo parameter is required' },
      { status: 400 }
    );
  }

  try {
    const [record, alert] = await Promise.all([
      findRegistryRecord(regNo, category),
      findAlertMatch(batchNumber, productName),
    ]);

    return NextResponse.json({
      success: true,
      found: Boolean(record),
      record,
      alert,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('[Lookup API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to query registry',
        message: (err as Error)?.message || 'Database error',
      },
      { status: 500 }
    );
  }
}
