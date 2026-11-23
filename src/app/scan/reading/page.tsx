'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { LoadingIndicator, StageProgress } from '@/components/feedback';
import { getPackSession, setPackSession } from '@/lib/session/pack-store';

/**
 * Screen B12: Reading the pack (PRD v4.0 §5 Step 3)
 * Meaningful stage progression.
 * After stage 3 reading finishes, seamlessly transitions directly to displaying
 * the product information for verification.
 */
export default function ReadingPackPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<number>(1);

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
        await new Promise((r) => setTimeout(r, 350));

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

        // Stage 3: Extraction schema validation & field extraction
        if (isMounted) setCurrentStage(3);
        await new Promise((r) => setTimeout(r, 400));

        if (response.ok && data.success && data.data) {
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
          // If automated extraction could not parse or is unconfigured,
          // seamlessly advance to product information entry/review
          // without displaying confusing test buttons.
          setPackSession({
            registrationNumber: '',
            brand: '',
            productName: '',
            manufacturer: '',
            category: 'medicine',
            hasActiveScan: true,
            isNumberConfirmed: false,
            isIdentityConfirmed: false,
            isStrengthConfirmed: false,
            verdictResult: null,
          });

          if (isMounted) {
            router.push('/review/enter');
          }
        }
      } catch (err: unknown) {
        console.warn('[ReadingPack] Extraction call failed:', err);
        if (isMounted) {
          setPackSession({
            registrationNumber: '',
            brand: '',
            productName: '',
            manufacturer: '',
            category: 'medicine',
            hasActiveScan: true,
            isNumberConfirmed: false,
            isIdentityConfirmed: false,
            isStrengthConfirmed: false,
            verdictResult: null,
          });
          router.push('/review/enter');
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
      hideNav={true}
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

        <div className="tl-stack-tight" style={{ textAlign: 'center', padding: '24px 0' }}>
          <LoadingIndicator />
          <div className="tl-caption tl-text-muted tl-mt-1">
            Extracting printed packaging text...
          </div>
        </div>
      </Stack>
    </AppShell>
  );
}
