import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getScanRecord, setScanConfirmedData, setScanVerdictResult } from '@/lib/server/scan-store';
import { findRegistryRecord, findAlertMatch } from '@/lib/db/repository';
import { evaluateVerdict } from '@/domain/verdict-engine';
import { ProductCategory } from '@/domain/types';

export const runtime = 'nodejs';

const ConfirmRequestSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  isNumberConfirmedByUser: z.boolean(),
  brand: z.string().min(1, 'Brand is required'),
  productName: z.string().min(1, 'Product name is required'),
  manufacturer: z.string().optional(),
  isIdentityConfirmedByUser: z.boolean(),
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
  ]),
  medicineStrength: z.string().optional(),
  dosageForm: z.string().optional(),
  activeIngredients: z.string().optional(),
  printedDirections: z.string().optional(),
  isStrengthConfirmedByUser: z.boolean().optional(),
  batchNumber: z.string().optional(),
  manufactureDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isManuallyEntered: z.boolean().optional(),
});

/**
 * PATCH /api/scans/:id/confirm (PRD v4.0 §16.4)
 * Accepts user-reviewed fields and explicit confirmation states.
 * Executes the deterministic comparison and records the final verdict.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scan = getScanRecord(id);

    if (!scan) {
      return NextResponse.json(
        {
          code: 'SCAN_EXPIRED',
          message: 'This scan session has expired. Please initiate a new scan.',
          retryable: false,
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = ConfirmRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Missing or invalid confirmation fields.',
          errors: validation.error.format(),
          retryable: false,
        },
        { status: 400 }
      );
    }

    const confirmedInput = validation.data;
    setScanConfirmedData(id, confirmedInput);

    // 1. Check official public recall notices
    const alertMatch = await findAlertMatch(
      confirmedInput.batchNumber,
      confirmedInput.productName,
      confirmedInput.brand
    );

    // 2. Query curated statutory reference record
    const registryRecord = await findRegistryRecord(
      confirmedInput.registrationNumber,
      confirmedInput.category as ProductCategory
    );

    // 3. Evaluate pure deterministic verdict engine (Zero AI)
    const verdictResult = evaluateVerdict(
      confirmedInput,
      alertMatch,
      registryRecord
    );

    setScanVerdictResult(id, verdictResult);

    return NextResponse.json({
      success: true,
      scanId: id,
      status: 'verified',
      result: verdictResult,
    });
  } catch (error) {
    console.error('[PATCH /api/scans/:id/confirm] Evaluation error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Could not complete documentary comparison.',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
