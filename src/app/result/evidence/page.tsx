'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, CheckRow, Surface } from '@/components/ui';
import { MinusIcon } from '@/components/icons';

/**
 * Screen D05: Evidence and its limits
 * Explains source coverage semantics, completeness, freshness, and limitations.
 */
export default function EvidenceLimitsPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Evidence and its limits',
        backHref: '/result',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Methodology and boundaries
        </div>

        <div>
          <h1 className="tl-title-1">Evidence and its limits</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Source coverage ≠ record completeness
          </p>
        </div>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Source Provenance &amp; Boundaries</div>
          <p className="tl-caption tl-text-muted">
            TrueLabel compares packaging evidence against locally curated reference records derived from published NAFDAC gazettes and public safety alerts. It does not perform automated scraping of live government portals without statutory authorization.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Coverage Principles</div>
          <p className="tl-caption tl-text-muted">
            A partial dataset can contain a complete record. Absence from a partial dataset never proves non-registration, and partial absence strictly defaults to &ldquo;Could not confirm&rdquo;.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Coverage Status</div>
          <CheckRow
            icon={<MinusIcon size={20} className="tl-text-muted" />}
            label="Number and identity"
            value="Checked against available curated records"
          />
          <div className="tl-divider" />
          <CheckRow
            icon={<MinusIcon size={20} className="tl-text-muted" />}
            label="NAFDAC alerts"
            value="Checked against active alert index"
          />
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Freshness policy</div>
          <p className="tl-caption tl-text-muted">
            Registry records older than 90 days show a stale-data warning. Public alert indexes older than 14 days show a stale-alert warning.
          </p>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/help" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Read full methodology
            </Button>
          </Link>
          <Link href="/result" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Return to result
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
