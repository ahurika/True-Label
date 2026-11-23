import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button } from '@/components/ui';
import { StateBlock } from '@/components/feedback';
import { MagnifierQuestionIcon } from '@/components/icons';

/**
 * Screen A02: The service is unavailable
 * Fallback screen when server or external registry dependencies fail.
 */
export default function UnavailablePage() {
  return (
    <AppShell
      headerProps={{
        title: 'Service unavailable',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-4">
        <StateBlock
          headingLevel="h1"
          icon={<MagnifierQuestionIcon size={48} />}
          title="The service is unavailable"
          body="The verification service cannot be reached right now. Please try again in a few moments, or check directly on the official NAFDAC portal."
          actions={
            <Stack gap="tight">
              <Link href="/scan" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Try again
                </Button>
              </Link>
              <Link href="/" className="tl-w-full">
                <Button variant="ghost" fullWidth>
                  Return home
                </Button>
              </Link>
            </Stack>
          }
        />
      </Stack>
    </AppShell>
  );
}
