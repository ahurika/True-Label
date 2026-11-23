'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, CheckRow, Surface } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';
import { NotEqualIcon } from '@/components/icons';

/**
 * Screen D03: Number problem
 * VERDICT 3: Number problem
 * (Engine evaluation priority: Priority 2 - registration number conflicts/expired)
 * Number malformed, expired, or registered to a different product.
 */
export default function ResultNumberProblemPage() {
  return (
    <AppShell
      headerProps={{
        title: 'The available evidence',
        backHref: '/result',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Number Conflict Finding
        </div>

        <h1 className="tl-display">The available evidence</h1>

        {/* Verdict Slip: Number problem */}
        <VerdictSlip
          verdict="number-problem"
          title="Number problem"
          body="The supplied number or record conflicts with the details confirmed on the pack."
          showCaveat={false}
        />

        <NumberPlate value="04-1234" label="NAFDAC Reg No (Conflict)" />

        <Surface>
          <div className="tl-label-bold tl-mb-1">Discrepancy Details</div>
          <CheckRow
            icon={<NotEqualIcon size={20} className="tl-text-muted" />}
            label="Identity conflict"
            value="Registration number 04-1234 is registered to 'Paracetamol 500mg Tablets' (Emzor), not this pack"
          />
          <p className="tl-caption tl-text-muted tl-mt-1">
            A real mismatch requires legible confirmed pack details and sufficiently complete source evidence.
          </p>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/result/evidence" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Inspect comparison evidence
            </Button>
          </Link>
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Correct pack details
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
