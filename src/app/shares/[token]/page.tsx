import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, Surface, SpecRow } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';
import { getShareRecordByToken } from '@/lib/server/share-store';

export const metadata: Metadata = {
  title: 'Shared Verification Result | TrueLabel',
  description: 'Read-only packaging evidence check result shared via TrueLabel.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = getShareRecordByToken(token);

  if (!share || share.isExpired) {
    return (
      <AppShell
        headerProps={{
          title: 'Shared Result Unavailable',
          backHref: '/',
        }}
      >
        <Stack gap="loose" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">Link Expired or Invalid</div>

          <div>
            <h1 className="tl-title-1">This shared result is unavailable</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              Shared verification links expire after 30 days to protect data freshness and privacy.
            </p>
          </div>

          <div className="tl-surface" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p className="tl-caption tl-text-muted tl-mb-2">
              To check this packaging or another product, you can initiate a fresh check.
            </p>
            <div className="tl-stack-tight">
              <Link href="/scan/capture" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Scan a pack
                </Button>
              </Link>
              <Link href="/" className="tl-w-full">
                <Button variant="ghost" fullWidth>
                  Go to TrueLabel home
                </Button>
              </Link>
            </div>
          </div>
        </Stack>
      </AppShell>
    );
  }

  const { confirmedPack, verdictResult } = share;
  const isRegistered = verdictResult.verdict === 'registry_match';

  return (
    <AppShell
      headerProps={{
        title: 'Shared packaging check',
        backHref: '/',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Read-Only Shared Verification Check · Valid for 30 days
        </div>

        <h1 className="tl-display">Shared packaging check</h1>

        {/* Verdict Slip */}
        <VerdictSlip
          verdict={verdictResult.verdict}
          title={verdictResult.displayLabel}
          body={verdictResult.explanation}
          showCaveat={verdictResult.mandatoryCaveat}
        />

        <NumberPlate value={confirmedPack.registrationNumber} />

        {/* Confirmed Packaging Details */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Confirmed Packaging Details</div>
          <SpecRow term="Brand" value={confirmedPack.brand} />
          <SpecRow term="Product name" value={confirmedPack.productName} />
          {confirmedPack.manufacturer && (
            <SpecRow term="Manufacturer" value={confirmedPack.manufacturer} />
          )}
          <SpecRow term="Category" value={confirmedPack.category.toUpperCase()} />
          {confirmedPack.batchNumber && (
            <SpecRow term="Batch / code" value={confirmedPack.batchNumber} />
          )}
          {confirmedPack.expiryDate && (
            <SpecRow term="Expiry date" value={confirmedPack.expiryDate} />
          )}
          {confirmedPack.medicineStrength && (
            <SpecRow term="Strength" value={confirmedPack.medicineStrength} />
          )}
        </Surface>

        {/* Mandatory Copied-Number Invariant */}
        {isRegistered && (
          <div className="tl-caveat">
            <strong>Mandatory Caveat:</strong> A matching registration record does not prove that the physical contents of this pack are genuine or safe. Counterfeiters frequently copy authentic registration numbers onto fake packaging.
          </div>
        )}

        {/* Expiration Notice */}
        <div className="tl-surface">
          <div className="tl-caption tl-text-muted">
            Shared on: {new Date(share.createdAt).toLocaleDateString('en-GB')} · Expires on:{' '}
            {new Date(share.expiresAt).toLocaleDateString('en-GB')}
          </div>
        </div>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Check your own pack
            </Button>
          </Link>
          <Link href="/" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Learn about TrueLabel
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
