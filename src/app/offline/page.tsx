import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button } from '@/components/ui';
import { StateBlock } from '@/components/feedback';
import { OfflineIllustration } from '@/components/illustrations';

/**
 * Screen A03: You appear to be offline
 * Offline notice: Evidence cannot be reached; no offline checking claim.
 */
export default function OfflinePage() {
  return (
    <AppShell
      headerProps={{
        title: 'You appear to be offline',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-4" style={{ alignItems: 'center' }}>
        <OfflineIllustration />

        <StateBlock
          headingLevel="h1"
          title="You appear to be offline"
          body="TrueLabel requires an internet connection to compare pack details against available official records. No offline verification claim is made."
          actions={
            <Stack gap="tight">
              <Link href="/" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Retry connection
                </Button>
              </Link>
              <Link href="/review/enter" className="tl-w-full">
                <Button variant="ghost" fullWidth>
                  Type details to prepare
                </Button>
              </Link>
            </Stack>
          }
        />
      </Stack>
    </AppShell>
  );
}
