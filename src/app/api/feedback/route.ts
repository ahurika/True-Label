import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const FeedbackSchema = z.object({
  category: z.string().max(50),
  issueType: z.enum([
    'packaging_discrepancy',
    'unreadable_ocr',
    'suspected_fake',
    'wrong_match',
    'general_feedback',
  ]),
  registrationNumber: z.string().max(30).optional(),
  brand: z.string().max(100).optional(),
  productName: z.string().max(100).optional(),
  purchaseLocation: z.string().max(120).optional(),
  details: z.string().max(1000).optional(),
  scanId: z.string().max(60).optional(),
});

/**
 * POST /api/feedback (PRD v4.0 §16.4 & §11)
 * Records a controlled feedback or report event without storing unnecessary free-form PII.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = FeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Invalid report data.',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const report = validation.data;
    console.info('[Report/Feedback] User submitted feedback:', {
      issueType: report.issueType,
      category: report.category,
      hasRegistrationNumber: Boolean(report.registrationNumber),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback received. Thank you for contributing to packaging transparency.',
      referenceId: 'rep_' + Date.now().toString(36),
    });
  } catch (error) {
    console.error('[POST /api/feedback] Error recording report:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Could not record feedback.',
      },
      { status: 500 }
    );
  }
}
