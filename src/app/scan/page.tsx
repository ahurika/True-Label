'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface } from '@/components/ui';
import { PackCaptureIllustration } from '@/components/illustrations';

/**
 * Screen B01: Before a photo is processed
 * Privacy gate and ephemeral memory processing disclosure.
 */
export default function ScanPrivacyPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Before a photo is processed',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Camera Privacy &amp; Terms</div>

        <div>
          <h1 className="tl-title-1">Before a photo is processed</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Packaging photos are processed exclusively in volatile memory to extract printed text and are discarded immediately.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PackCaptureIllustration />
        </div>

        <Surface>
          <div className="tl-label-bold">Zero Image Retention</div>
          <p className="tl-caption tl-text-muted tl-mt-1">
            TrueLabel never saves, sells, or retains your packaging photos on persistent disks, databases, or cloud storage.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold">A manual route remains available</div>
          <p className="tl-caption tl-text-muted tl-mt-1">
            You can type printed details manually instead of capturing or uploading an image.
          </p>
        </Surface>

        <Stack gap="tight">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Open camera
            </Button>
          </Link>
          <Link href="/help" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Privacy policy &amp; methodology
            </Button>
          </Link>
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Type the number manually
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
