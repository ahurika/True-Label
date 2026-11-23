'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, CheckRow, Surface } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';
import { BellIcon } from '@/components/icons';

/**
 * Screen D02: Matches a NAFDAC alert
 * VERDICT 2: Matches a NAFDAC alert
 * (Engine evaluation priority: Priority 1 - public alerts win immediately)
 * Active public alert for batch or affected-pack name.
 */
export default function ResultAlertPage() {
  return (
    <AppShell
      headerProps={{
        title: 'The available evidence',
        backHref: '/result',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Active Alert Finding
        </div>

        <h1 className="tl-display">The available evidence</h1>

        {/* Verdict Slip: Matches a NAFDAC alert */}
        <VerdictSlip
          verdict="alert"
          title="Matches a NAFDAC alert"
          body="A specific public NAFDAC alert names this batch or affected-pack name."
          showCaveat={false}
        />

        <NumberPlate value="04-9999" label="NAFDAC Reg No (Alert Match)" />

        <Surface>
          <div className="tl-label-bold tl-mb-1">Alert Details</div>
          <CheckRow
            icon={<BellIcon size={20} className="tl-text-muted" />}
            label="NAFDAC Public Alert"
            value="Notice No. 2026/088 — Recall of Contaminated Cough Syrup"
          />
          <div className="tl-divider" />
          <CheckRow
            icon={<BellIcon size={20} className="tl-text-muted" />}
            label="Matched batch"
            value="B2024-X9 (Matches official recall notice)"
          />
          <p className="tl-caption tl-text-muted tl-mt-1">
            This verdict is triggered deterministically by an exact match to a published public recall notice.
          </p>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/result/evidence" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Inspect the alert evidence
            </Button>
          </Link>
          <Link href="/" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Return home
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
