import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button } from '@/components/ui';
import { EmptyHistoryIllustration } from '@/components/illustrations';

/**
 * Screen: Local history (optional under §10.9, off by default)
 */
export default function HistoryPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Check History',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-4" style={{ alignItems: 'center', textAlign: 'center' }}>
        <EmptyHistoryIllustration />

        <div>
          <h1 className="tl-title-2">No history saved</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Local check receipts stay on this device only when enabled. TrueLabel does not store packaging photos.
          </p>
        </div>

        <Link href="/scan" className="tl-w-full">
          <Button variant="primary" fullWidth>
            Start a check
          </Button>
        </Link>
      </Stack>
    </AppShell>
  );
}
