'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, Surface } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';

/**
 * Screen D04: Could not confirm
 * VERDICT 4: Could not confirm
 * (Engine evaluation priority: Priority 3 - unconfirmed/insufficient evidence)
 * Insufficient data, partial coverage, unreadable, or missing evidence.
 */
export default function ResultUnconfirmedPage() {
  return (
    <AppShell
      headerProps={{
        title: 'The available evidence',
        backHref: '/result',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Insufficient Evidence
        </div>

        <h1 className="tl-display">The available evidence</h1>

        {/* Verdict Slip: Could not confirm */}
        <VerdictSlip
          verdict="unconfirmed"
          title="Could not confirm"
          body="There is not enough reliable information to make a comparison."
          showCaveat={false}
        />

        <NumberPlate value="UNKNOWN" label="NAFDAC Reg No" />

        <Surface>
          <div className="tl-label-bold tl-mb-1">The evidence is insufficient</div>
          <p className="tl-caption tl-text-muted">
            No complete, current, source-backed comparison is supplied. In accordance with PRD v3.1 §5, missing evidence is never converted into a positive finding.
          </p>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Try a clearer photo
            </Button>
          </Link>
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Type printed details
            </Button>
          </Link>
          <Link href="/result/evidence" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              More result actions
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
