import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createShareRecord } from '@/lib/server/share-store';
import { getScanRecord } from '@/lib/server/scan-store';
import { ConfirmedPackInput } from '@/domain/types';
import { CombinedVerdictResult } from '@/domain/verdict-engine';

export const runtime = 'nodejs';

const ShareRequestSchema = z.object({
  scanId: z.string().optional(),
  confirmedPack: z
    .object({
      registrationNumber: z.string(),
      brand: z.string(),
      productName: z.string(),
      manufacturer: z.string().optional(),
      category: z.string(),
      medicineStrength: z.string().optional(),
      dosageForm: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      isManuallyEntered: z.boolean().optional(),
      isNumberConfirmedByUser: z.boolean().default(true),
      isIdentityConfirmedByUser: z.boolean().default(true),
    })
    .optional(),
  verdictResult: z.any().optional(),
});

/**
 * POST /api/shares (PRD v4.0 §16.4 & §11)
 * Creates a server-held read-only share record from validated scan data.
 * Zero photographs and zero personal data are persisted.
 * High-entropy token with 30-day expiry.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ShareRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Invalid share creation request.',
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { scanId, confirmedPack, verdictResult } = validation.data;

    let packData = confirmedPack;
    let verdictData = verdictResult;

    if (scanId) {
      const scan = getScanRecord(scanId);
      if (scan && scan.confirmedInput && scan.verdictResult) {
        packData = scan.confirmedInput;
        verdictData = scan.verdictResult;
      }
    }

    if (!packData || !verdictData) {
      return NextResponse.json(
        {
          code: 'CONFIRMATION_REQUIRED',
          message: 'A validated verdict and confirmed pack details are required to generate a share record.',
          retryable: false,
        },
        { status: 400 }
      );
    }

    const share = createShareRecord(
      packData as unknown as ConfirmedPackInput,
      verdictData as unknown as CombinedVerdictResult
    );

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const shareUrl = `${origin}/shares/${share.token}`;

    return NextResponse.json({
      success: true,
      token: share.token,
      shareUrl,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error('[POST /api/shares] Share generation error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Could not generate share link.',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
