import React from 'react';
import Link from 'next/link';
import { AppShell, Stack, ThemeToggle } from '@/components/layout';
import { Button, CalloutMarker, Surface } from '@/components/ui';
import { siteConfig } from '@/config/site';

/**
 * Screen A01: Before you buy, read the label.
 * The primary public entry point for TrueLabel.
 */
export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteConfig.url}/#app`,
        name: siteConfig.name,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All modern web browsers',
        description: siteConfig.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NGN',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${siteConfig.url}/#webpage`,
        url: siteConfig.url,
        name: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteConfig.url}/#website`,
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
    ],
  };

  return (
    <AppShell
      headerProps={{
        rightAction: <ThemeToggle />,
      }}
    >
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Stack gap="loose" className="tl-mt-2">
        {/* Verification scope badge */}
        <div className="tl-caption tl-text-muted">
          NAFDAC Documentary Evidence Verification
        </div>

        {/* Hero headline */}
        <div>
          <h1 className="tl-display">Before you buy, read the label.</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Photograph a pack, review what was read, then inspect the available evidence.
          </p>
        </div>

        {/* Guided steps */}
        <Surface>
          <Stack gap="default">
            <div className="tl-cluster" style={{ gap: 12 }}>
              <CalloutMarker number={1} />
              <div>
                <div className="tl-label-bold">Read the pack</div>
                <div className="tl-caption tl-text-muted">
                  Up to three images: front, back and batch area.
                </div>
              </div>
            </div>

            <div className="tl-divider" />

            <div className="tl-cluster" style={{ gap: 12 }}>
              <CalloutMarker number={2} />
              <div>
                <div className="tl-label-bold">Keep the limits in view</div>
                <div className="tl-caption tl-text-muted">
                  A comparison does not authenticate the contents.
                </div>
              </div>
            </div>
          </Stack>
        </Surface>

        {/* Primary actions */}
        <Stack gap="tight">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Scan a product
            </Button>
          </Link>
          <Link href="/review/enter" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Enter product details manually
            </Button>
          </Link>
          <Link href="/how-it-works" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              How TrueLabel works
            </Button>
          </Link>
        </Stack>

        {/* Disclaimer / Stance */}
        <div className="tl-caveat">
          TrueLabel evaluates documentary packaging evidence against official public records. It never guarantees that physical contents are genuine, safe, or unadulterated.
        </div>
      </Stack>
    </AppShell>
  );
}
