'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button } from '@/components/ui';
import { PackCamera } from '@/components/camera';
import { setPackSession } from '@/lib/session/pack-store';

/**
 * Screen B03: Frame the packaging
 * Multi-slot camera and upload experience (Front, Back, Batch).
 * Real-time client-side compression (<500 KB target, 1600px long edge).
 */
export default function ScanCapturePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureComplete = (images: { front: string; back?: string; batch?: string }) => {
    setIsProcessing(true);
    const additionals: string[] = [];
    if (images.back) additionals.push(images.back);
    if (images.batch) additionals.push(images.batch);

    // Save real captured photos into ephemeral pack session
    setPackSession({
      capturedPreviewUrl: images.front,
      additionalImages: additionals,
      hasActiveScan: true,
      isNumberConfirmed: false,
      isIdentityConfirmed: false,
      isStrengthConfirmed: false,
      verdictResult: null,
    });

    // Navigate to reading state
    router.push('/scan/reading');
  };

  return (
    <AppShell
      hideNav={true}
      headerProps={{
        title: 'Capture packaging',
        backHref: '/scan',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Packaging Photography · Up to 3 Images</div>

        <div>
          <h1 className="tl-title-1">Frame the front of the pack</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Capture clear photos of the brand name and NAFDAC registration number. You can also add the back directions and batch area.
          </p>
        </div>

        {/* Real Multi-Slot Camera Viewfinder */}
        <PackCamera onCaptureComplete={handleCaptureComplete} isProcessing={isProcessing} />

        <div className="tl-divider" />

        <Stack gap="tight">
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="ghost" fullWidth disabled={isProcessing}>
              Type details manually instead
            </Button>
          </Link>
          <Link href="/help" className="tl-w-full">
            <Button variant="ghost" fullWidth disabled={isProcessing}>
              Photo &amp; lighting guidance
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
