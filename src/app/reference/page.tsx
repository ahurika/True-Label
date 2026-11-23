import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface, NumberPlate, SpecRow } from '@/components/ui';
import { CURATED_REGISTRY_RECORDS } from '@/lib/db/repository';

export const metadata: Metadata = {
  title: 'Reference Library — Statutory Product Records | TrueLabel',
  description:
    'Browse verified statutory packaging reference cards derived from published NAFDAC Official Gazettes with field-level provenance.',
  alternates: {
    canonical: 'https://truelabel.ng/reference',
  },
};

export default function ReferenceLibraryPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Reference Library',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Statutory Gazette Reference Cards</div>

        <div>
          <h1 className="tl-display">Reference Library</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Verified packaging reference cards curated from published NAFDAC Official Gazettes and public recall alerts.
          </p>
        </div>

        {/* Coverage Boundary Notice */}
        <div className="tl-caveat">
          <strong>Reference Scope:</strong> This library is a curated sample list (partial coverage). Absence from this library does NOT imply a product is unregistered. A matching reference card does not prove that physical contents are genuine or safe.
        </div>

        {/* Curated Product Cards */}
        <Stack gap="default">
          {CURATED_REGISTRY_RECORDS.map((record) => (
            <Surface key={record.registrationNumber}>
              <div className="tl-cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="tl-label-bold">{record.brand ? `${record.brand} — ${record.productName}` : record.productName}</div>
                  <div className="tl-caption tl-text-muted tl-mt-1">
                    Category: {record.category.toUpperCase()} · Status: {record.status.toUpperCase()}
                  </div>
                </div>
                <div style={{ maxWidth: '140px' }}>
                  <NumberPlate value={record.registrationNumber} />
                </div>
              </div>

              <div className="tl-divider tl-my-2" />

              <SpecRow term="Manufacturer" value={record.manufacturer || 'Not specified'} />
              <SpecRow term="Registered until" value={record.registeredUntil || 'Current'} />
              <SpecRow term="Statutory Source" value={record.sourceName || 'NAFDAC Official Gazette'} />

              {record.sourceUrl && (
                <div className="tl-mt-2 tl-caption">
                  <a
                    href={record.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tl-link"
                  >
                    View gazette reference &rarr;
                  </a>
                </div>
              )}
            </Surface>
          ))}
        </Stack>

        {/* No-Card Fallback Section (PRD v4.0 §9) */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Product not in the reference library?</div>
          <p className="tl-caption tl-text-muted">
            Our reference cards are curated from verified gazette publications. If your product does not appear here:
          </p>
          <ul className="tl-caption tl-text-muted tl-mt-1" style={{ paddingLeft: '18px', listStyleType: 'disc' }}>
            <li>It may be registered under a newer or different NAFDAC gazette volume.</li>
            <li>You can still perform an evidence check using camera scanning or manual typing.</li>
            <li>You can verify registration directly on the official NAFDAC portal (nafdac.gov.ng).</li>
          </ul>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Scan a product pack
            </Button>
          </Link>
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Type registration number
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
