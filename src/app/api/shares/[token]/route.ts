import { NextRequest, NextResponse } from 'next/server';
import { getShareRecordByToken } from '@/lib/server/share-store';

export const runtime = 'nodejs';

/**
 * GET /api/shares/:token
 * Retrieves a read-only share record by its token if unexpired.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const share = getShareRecordByToken(token);

  if (!share) {
    return NextResponse.json(
      {
        code: 'SHARE_EXPIRED',
        message: 'This shared verification result has expired or is unavailable. Shared results expire after 30 days.',
        retryable: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: share,
  });
}
