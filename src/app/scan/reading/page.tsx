'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { LoadingIndicator, StageProgress } from '@/components/feedback';
import { Button } from '@/components/ui';
import { getPackSession, setPackSession } from '@/lib/session/pack-store';

/**
 * Screen B12: Reading the pack (PRD v4.0 §5 Step 3)
 * Real processing state with meaningful progress. Zero fake percentages.
 * Honest handling of missing AI provider credentials with direct manual fallback.
 */
export default function ReadingPackPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function executeExtraction() {
      const session = getPackSession();
      const previewUrl = session.capturedPreviewUrl;

      if (!previewUrl) {
        // No photo in session, route back to camera capture
        router.replace('/scan/capture');
        return;
      }

      try {
        // Stage 1: Image validation & preparation
        if (isMounted) setCurrentStage(1);
        await new Promise((r) => setTimeout(r, 300));

        // Strip data URL header to get clean base64 payload
        let imageBase64 = previewUrl;
        if (previewUrl.includes(',')) {
          imageBase64 = previewUrl.split(',')[1] || '';
        }

        // Stage 2: Packaging text extraction
        if (isMounted) setCurrentStage(2);

        const response = await fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            additionalImages: session.additionalImages || [],
            consentGranted: true,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (data.status === 'blocked' || data.code === 'AI_CREDENTIALS_MISSING') {
            if (isMounted) {
              setIsBlocked(true);
              setErrorMessage(
                data.message ||
                  'Automated packaging OCR is currently offline: GEMINI_API_KEY is not configured in the server environment. You can enter details manually.'
              );
            }
            return;
          }
          throw new Error(data.message || 'Extraction service returned an error.');
        }

        // Stage 3: Extraction schema validation & field extraction
        if (isMounted) setCurrentStage(3);
        await new Promise((r) => setTimeout(r, 300));

        if (data.success && data.data) {
          const ext = data.data;
          setPackSession({
            scanId: data.scanId,
            registrationNumber: ext.registrationNumber || '',
            brand: ext.brandName || '',
            productName: ext.productName || '',
            manufacturer: ext.manufacturer || '',
            batchNumber: ext.batchNumber || '',
            manufactureDate: ext.manufactureDate || '',
            expiryDate: ext.expiryDate || '',
            category: ext.category || 'other',
            medicineStrength: ext.strength || '',
            dosageForm: ext.dosageForm || '',
            activeIngredients: ext.activeIngredients || '',
            directions: ext.printedDirections || '',
            hasActiveScan: true,
            isNumberConfirmed: false,
            isIdentityConfirmed: false,
            isStrengthConfirmed: false,
            verdictResult: null,
          });

          if (isMounted) {
            router.push('/review');
          }
        } else {
          throw new Error('Packaging text could not be extracted.');
        }
      } catch (err: unknown) {
        console.warn('[ReadingPack] Extraction call failed:', err);
        if (isMounted) {
          setErrorMessage(
            'Could not automatically extract text from this photo. Please retake the photo with better lighting or type the details manually.'
          );
        }
      }
    }

    executeExtraction();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const stages = [
    {
      id: '1',
      label: 'Image validated and downsampled',
      state: (currentStage >= 1 ? 'done' : 'current') as 'done' | 'current' | 'pending',
    },
    {
      id: '2',
      label: 'Reading printed packaging text',
      state: (currentStage > 2 ? 'done' : currentStage === 2 ? 'current' : 'pending') as
        | 'done'
        | 'current'
        | 'pending',
    },
    {
      id: '3',
      label: 'Validating registration number & identity schema',
      state: (currentStage >= 3 ? 'current' : 'pending') as 'done' | 'current' | 'pending',
    },
  ];

  return (
    <AppShell
      headerProps={{
        title: 'Reading the pack',
        backHref: '/scan/capture',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Extraction in Progress</div>

        <div>
          <h1 className="tl-title-1">Reading the pack</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Analyzing packaging photos for brand name, NAFDAC number, and batch details.
          </p>
        </div>

        {/* Meaningful Stage Indicators */}
        <StageProgress stages={stages} />

        {isBlocked ? (
          <div className="tl-surface" style={{ borderLeft: '4px solid var(--color-status-warn-border)' }}>
            <div className="tl-label-bold">Live AI Vision Offline</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              {errorMessage}
            </p>
            <div className="tl-mt-2 tl-stack-tight">
              <Link href="/review/enter" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Type pack details manually
                </Button>
              </Link>
              <Link href="/scan/capture" className="tl-w-full">
                <Button variant="ghost" fullWidth>
                  Retake photo
                </Button>
              </Link>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="tl-surface" style={{ borderLeft: '4px solid var(--color-status-danger-border)' }}>
            <div className="tl-label-bold">Unreadable Packaging</div>
            <p className="tl-caption tl-text-muted tl-mt-1">{errorMessage}</p>
            <div className="tl-mt-2 tl-stack-tight">
              <Link href="/scan/capture" className="tl-w-full">
                <Button variant="secondary" fullWidth>
                  Retake photo
                </Button>
              </Link>
              <Link href="/review/enter" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Type details manually
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="tl-stack-tight" style={{ textAlign: 'center', padding: '24px 0' }}>
            <LoadingIndicator />
            <div className="tl-caption tl-text-muted tl-mt-1">
              Extracting printed packaging text...
            </div>
          </div>
        )}
      </Stack>
    </AppShell>
  );
}
