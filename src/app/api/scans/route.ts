import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createScanRecord, setScanExtractedData } from '@/lib/server/scan-store';
import { parsePackText } from '@/lib/ocr/pack-parser';

export const runtime = 'nodejs';

const ScanRequestSchema = z.object({
  imageBase64: z.string().optional(),
  additionalImages: z.array(z.string()).max(2).optional(),
  consentGranted: z.boolean().default(true),
  isManualOnly: z.boolean().optional(),
});

/**
 * POST /api/scans (PRD v4.0 §16.4)
 * Accepts packaging images and processing consent.
 * Returns a temporary scan identifier and extraction state.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 4 MB request size limit check (PRD §5)
    if (Buffer.byteLength(rawBody, 'utf8') > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          code: 'FILE_TOO_LARGE',
          message: 'Upload payload exceeds the 4 MB limit.',
          retryable: false,
          requestId: req.headers.get('x-request-id') || 'req_err',
        },
        { status: 413 }
      );
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Malformed JSON payload.',
          retryable: false,
          requestId: req.headers.get('x-request-id') || 'req_err',
        },
        { status: 400 }
      );
    }

    const validation = ScanRequestSchema.safeParse(parsedBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Invalid scan request schema.',
          errors: validation.error.format(),
          retryable: false,
          requestId: req.headers.get('x-request-id') || 'req_err',
        },
        { status: 400 }
      );
    }

    const { imageBase64, consentGranted, isManualOnly } = validation.data;
    const scan = createScanRecord(consentGranted);

    // If manual entry route requested, return scanId immediately
    if (isManualOnly || !imageBase64) {
      return NextResponse.json({
        success: true,
        scanId: scan.id,
        status: 'pending',
        expiresAt: new Date(scan.expiresAt).toISOString(),
        message: 'Scan session created for manual entry.',
      });
    }

    // Vision extraction check
    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, '').trim() : '';
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          status: 'blocked',
          scanId: scan.id,
          code: 'AI_CREDENTIALS_MISSING',
          message:
            'Live multimodal vision extraction is blocked because GEMINI_API_KEY is not configured in the server environment. Please enter pack details manually.',
          retryable: false,
          requestId: req.headers.get('x-request-id') || scan.id,
        },
        { status: 503 }
      );
    }

    // Real AI Vision Extraction Call
    const prompt = `You are a packaging inspection assistant for TrueLabel Nigeria.
Extract printed pack text accurately and output strictly valid JSON matching the schema:
{
  "category": "medicine" | "food" | "beverage" | "water" | "cosmetic" | "toothpaste" | "device" | "herbal" | "household" | "other",
  "brandName": "Brand name printed on pack",
  "productName": "Product title printed on pack",
  "registrationNumber": "Official NAFDAC number e.g. 04-0123, A1-1234",
  "manufacturer": "Manufacturer name",
  "batchNumber": "Batch or lot code",
  "manufactureDate": "MFG date string",
  "expiryDate": "EXP date string",
  "strength": "Active strength e.g. 500mg (medicines only)",
  "dosageForm": "e.g. Tablets, Syrup, Capsules",
  "activeIngredients": "Active pharmaceutical ingredients",
  "printedDirections": "Verbatim printed instructions",
  "confidenceScore": 0.0 to 1.0
}`;

    const modelsToTry = [
      process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
    ];

    let aiRes: Response | null = null;
    let lastErrorMsg = '';

    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: imageBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          aiRes = res;
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrorMsg = errData.error?.message || `HTTP ${res.status}`;
          console.warn(`[Scans API] Gemini model ${model} failed (${res.status}):`, lastErrorMsg);
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const isAbort = (err as Error)?.name === 'AbortError';
        lastErrorMsg = isAbort
          ? 'Request timed out after 15 seconds'
          : ((err as Error)?.message || 'Fetch failed');
        console.warn(`[Scans API] Gemini model ${model} request error:`, lastErrorMsg);
      }
    }

    if (!aiRes) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          scanId: scan.id,
          message: `Vision extraction service unavailable: ${lastErrorMsg}. Please enter pack details manually.`,
          canFallbackToManual: true,
        },
        { status: 502 }
      );
    }

    const aiData = await aiRes.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const extracted = parsePackText(rawContent || '{}');

    if (!extracted) {
      return NextResponse.json(
        {
          code: 'IMAGE_UNREADABLE',
          message: 'Text on packaging could not be read clearly. Please retake photo or enter details manually.',
          retryable: true,
          scanId: scan.id,
          requestId: scan.id,
        },
        { status: 422 }
      );
    }

    setScanExtractedData(scan.id, extracted);

    return NextResponse.json({
      success: true,
      scanId: scan.id,
      status: 'extracted',
      data: extracted,
      expiresAt: new Date(scan.expiresAt).toISOString(),
    });
  } catch (error) {
    console.error('[POST /api/scans] Unexpected error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error while processing scan.',
        retryable: true,
        requestId: 'err_' + Date.now(),
      },
      { status: 500 }
    );
  }
}
