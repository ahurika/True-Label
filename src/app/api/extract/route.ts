import { NextRequest, NextResponse } from 'next/server';
import { ExtractionSchema, parsePackText } from '@/lib/ocr/pack-parser';

export const dynamic = 'force-dynamic';

/**
 * POST /api/extract
 * Live AI Packaging OCR & Structured Field Extraction
 * PRD v3.1 §4 & AGENTS.md §9: Zero image persistence.
 * If credentials are missing, reports integration as blocked.
 */
export async function POST(req: NextRequest) {
  try {
    let imageBase64 = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') || formData.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = await (file as Blob).arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      }
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      imageBase64 = json.imageBase64 || '';
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, '').trim() : '';

    // If Gemini API Key is missing:
    if (!apiKey) {
      // In automated unit tests, return test fixture with explicit non-live source tag
      if (process.env.NODE_ENV === 'test') {
        const parsedData = parsePackText(
          imageBase64
            ? 'Golden Penny Semovita Flour Mills of Nigeria A0-1234 BATCH B2026-01 EXP 12/2027'
            : 'Golden Penny Semovita A0-1234'
        );
        return NextResponse.json({
          success: true,
          data: parsedData,
          source: 'test-fixture',
          isLiveAi: false,
          warning: 'Live AI credentials (GEMINI_API_KEY) not configured. Test fixture returned.',
        });
      }

      // In real runtime environments without API credentials, report BLOCKED
      return NextResponse.json(
        {
          success: false,
          status: 'blocked',
          error: 'AI_CREDENTIALS_MISSING',
          message: 'Live AI Vision extraction is blocked: GEMINI_API_KEY is not configured in server environment. Please enter pack details manually to inspect documentary records.',
          canFallbackToManual: true,
        },
        { status: 503 }
      );
    }

    const modelsToTry = [
      process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
    ];

    let response: Response | null = null;
    let lastError = '';

    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert OCR and packaging reading engine for Nigerian consumer goods and medicines.
Extract printed text from this packaging image into strict JSON matching this schema:
{
  "registrationNumber": "printed NAFDAC registration number (e.g. 01-0812, 04-1234, A0-1234)",
  "brandName": "prominent brand name printed on pack",
  "productName": "full product name and description printed on pack",
  "manufacturer": "printed manufacturing entity or applicant",
  "batchNumber": "printed batch/lot code if legible",
  "expiryDate": "printed expiry date if legible",
  "activeIngredients": "active chemical or drug ingredients if medicine",
  "strength": "strength (e.g. 500mg, 100ml) if medicine",
  "category": "one of: medicine, food, beverage, water, cosmetic, toothpaste, device, herbal, household, other"
}
Output strictly valid JSON with no markdown wrapping or additional text.`,
                    },
                    {
                      inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        clearTimeout(timeoutId);

        if (res.ok) {
          response = res;
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error?.message || `HTTP ${res.status}`;
          console.warn(`[Extract API] Model ${model} returned error:`, lastError);
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        lastError = (err as Error)?.message || 'Fetch error';
        console.warn(`[Extract API] Model ${model} failed:`, lastError);
      }
    }

    if (!response) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI_SERVICE_UNAVAILABLE',
          message: `Vision service unavailable: ${lastError}. Please enter pack details manually.`,
          canFallbackToManual: true,
        },
        { status: 502 }
      );
    }

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini API returned empty text');
    }

    const cleanJsonText = rawText.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleanJsonText);
    const validated = ExtractionSchema.parse(parsed);

    return NextResponse.json({
      success: true,
      data: validated,
      source: 'gemini-vision',
      isLiveAi: true,
    });
  } catch (err: unknown) {
    console.error('[Extraction] Unhandled error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'EXTRACTION_FAILED',
        message: (err as Error)?.message || 'Extraction service error',
        canFallbackToManual: true,
      },
      { status: 500 }
    );
  }
}
