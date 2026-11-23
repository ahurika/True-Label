import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface, CalloutMarker } from '@/components/ui';
import { LedgerIcon, BellIcon, FlagIcon, MagnifierQuestionIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'How It Works — Packaging Reading & Verification Workflow | TrueLabel',
  description:
    'Understand how TrueLabel reads packaging, confirms identity details, checks official NAFDAC recall alerts, and compares against statutory records.',
  alternates: {
    canonical: 'https://truelabel.ng/how-it-works',
  },
};

export default function HowItWorksPage() {
  return (
    <AppShell
      headerProps={{
        title: 'How TrueLabel works',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Workflow &amp; Verification Methodology</div>

        <div>
          <h1 className="tl-display">How TrueLabel works</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            TrueLabel helps Nigerian consumers read product packaging and compare printed details against available regulatory records and official safety alerts.
          </p>
        </div>

        {/* 3-Step Guided Workflow */}
        <Surface>
          <Stack gap="default">
            <div className="tl-cluster" style={{ gap: 12 }}>
              <CalloutMarker number={1} />
              <div>
                <div className="tl-label-bold">Guided Packaging Reading</div>
                <div className="tl-caption tl-text-muted tl-mt-1">
                  Photograph the front of your packaging (up to three photos including back directions and batch area) or type the number manually. Photos are processed exclusively in volatile RAM and discarded immediately.
                </div>
              </div>
            </div>

            <div className="tl-divider" />

            <div className="tl-cluster" style={{ gap: 12 }}>
              <CalloutMarker number={2} />
              <div>
                <div className="tl-label-bold">Explicit User Confirmation</div>
                <div className="tl-caption tl-text-muted tl-mt-1">
                  You review and explicitly confirm the registration number, brand, product name, and manufacturer. For medicines, active strength must also be confirmed. We never assume OCR transcription is accurate without your confirmation.
                </div>
              </div>
            </div>

            <div className="tl-divider" />

            <div className="tl-cluster" style={{ gap: 12 }}>
              <CalloutMarker number={3} />
              <div>
                <div className="tl-label-bold">Deterministic Evidence Comparison</div>
                <div className="tl-caption tl-text-muted tl-mt-1">
                  Our pure TypeScript decision engine evaluates public safety alerts first, followed by registration status and statutory records in strict priority order. AI models have zero role in determining verdicts.
                </div>
              </div>
            </div>
          </Stack>
        </Surface>

        {/* The Four Locked Verdicts (PRD v4.0 §6.1) */}
        <div>
          <h2 className="tl-title-2">The four locked verdicts</h2>
          <p className="tl-body tl-text-muted tl-mt-1">
            Every product check produces exactly one evidence-based outcome evaluated in strict priority sequence:
          </p>
        </div>

        <Stack gap="tight">
          <Surface>
            <div className="tl-cluster" style={{ gap: 10 }}>
              <BellIcon size={24} style={{ color: 'var(--color-status-danger)' }} />
              <div>
                <div className="tl-label-bold">Matches a NAFDAC alert</div>
                <div className="tl-caption tl-text-muted">
                  Triggered when an exact batch number or approved affected-pack name matches an active official NAFDAC recall notice. Do not consume or distribute.
                </div>
              </div>
            </div>
          </Surface>

          <Surface>
            <div className="tl-cluster" style={{ gap: 10 }}>
              <FlagIcon size={24} style={{ color: 'var(--color-status-warn)' }} />
              <div>
                <div className="tl-label-bold">Registration details don&apos;t match</div>
                <div className="tl-caption tl-text-muted">
                  Triggered when reliable evidence establishes that the number belongs to a different product or manufacturer, or the record is explicitly inactive/expired in source records.
                </div>
              </div>
            </div>
          </Surface>

          <Surface>
            <div className="tl-cluster" style={{ gap: 10 }}>
              <MagnifierQuestionIcon size={24} style={{ color: 'var(--color-status-info)' }} />
              <div>
                <div className="tl-label-bold">Could not confirm</div>
                <div className="tl-caption tl-text-muted">
                  The safe fallback. Used when evidence is insufficient, critical fields are unreadable, or a product is absent from a partial dataset. Absence from a partial list never implies non-registration.
                </div>
              </div>
            </div>
          </Surface>

          <Surface>
            <div className="tl-cluster" style={{ gap: 10 }}>
              <LedgerIcon size={24} style={{ color: 'var(--color-status-ok)' }} />
              <div>
                <div className="tl-label-bold">Registry details match</div>
                <div className="tl-caption tl-text-muted">
                  Confirmed identity details correspond to an active official statutory registration record. Displays the mandatory copied-number caveat.
                </div>
              </div>
            </div>
          </Surface>
        </Stack>

        {/* Non-Authentication Invariant (PRD §3) */}
        <div className="tl-caveat">
          <strong>Mandatory Caveat:</strong> A matching registration record does not prove that the physical contents of this pack are genuine or safe. Counterfeiters frequently copy authentic registration numbers onto fake packaging. TrueLabel compares documentary evidence and never replaces regulatory inspection or chemical laboratory analysis.
        </div>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Start a product check
            </Button>
          </Link>
          <Link href="/reference" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Inspect reference library
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
