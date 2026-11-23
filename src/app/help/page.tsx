import React from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, CheckRow, Surface } from '@/components/ui';

/**
 * Screen I01: Help with a careful check
 * Help, guidance, documentation, and methodology.
 */
export default function HelpPage() {
  const topics = [
    { title: 'Take a readable pack photo', href: '/scan/capture' },
    { title: 'Understand the four verdicts', href: '/result/evidence' },
    { title: 'How evidence is compared', href: '/result/evidence' },
    { title: 'Privacy and zero photo retention', href: '/scan' },
    { title: 'Source and freshness policy', href: '/result/evidence' },
  ];

  return (
    <AppShell
      headerProps={{
        title: 'Help with a careful check',
        backHref: '/',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Support & guidance
        </div>

        <div>
          <h1 className="tl-title-1">Help with a careful check</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Learn how TrueLabel reads packaging, compares records, and presents evidence.
          </p>
        </div>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Help Topics</div>
          {topics.map((t, idx) => (
            <React.Fragment key={t.title}>
              {idx > 0 && <div className="tl-divider" />}
              <Link href={t.href} className="tl-w-full">
                <CheckRow label={t.title} value="Read guide →" />
              </Link>
            </React.Fragment>
          ))}
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Pharmacist Notice</div>
          <p className="tl-caption tl-text-muted">
            For questions about how to use any medicine, ask a licensed pharmacist. Do not rely on this application to change the directions on the pack.
          </p>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Start a check
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
