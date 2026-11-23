import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyConfirmedPack } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

const VerifyRequestSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  isNumberConfirmedByUser: z.boolean().default(false),
  brand: z.string().default(''),
  productName: z.string().min(1, 'Product name is required'),
  manufacturer: z.string().optional(),
  isIdentityConfirmedByUser: z.boolean().default(false),
  category: z.enum([
    'medicine',
    'food',
    'beverage',
    'water',
    'cosmetic',
    'toothpaste',
    'device',
    'herbal',
    'household',
    'other',
  ]).default('food'),
  medicineStrength: z.string().optional(),
  isStrengthConfirmedByUser: z.boolean().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});

/**
 * POST /api/verify
 * Executes TrueLabel PRD v3.1 deterministic verdict evaluation.
 * Compares confirmed pack inputs against Neon PostgreSQL registry records and public alerts.
 * Pure deterministic selection (Zero-AI Verdict Law).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = VerifyRequestSchema.parse(body);

    const verdictResult = await verifyConfirmedPack(validatedInput);

    return NextResponse.json({
      success: true,
      result: verdictResult,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: err.errors,
        },
        { status: 400 }
      );
    }

    console.error('[Verify API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Verification evaluation failed',
        message: (err as Error)?.message || 'Internal evaluation error',
      },
      { status: 500 }
    );
  }
}
