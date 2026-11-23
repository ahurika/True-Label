import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About TrueLabel — Consumer Packaging Transparency in Nigeria',
  description:
    'Learn about TrueLabel, our evidence-first principles, independence safeguards, and our mission to make packaging information understandable.',
  alternates: {
    canonical: 'https://truelabel.ng/about',
  },
};

export default function AboutPage() {
  return (
    <AppShell
      headerProps={{
        title: 'About TrueLabel',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Product Identity &amp; Mission</div>

        <div>
          <h1 className="tl-display">Know what your product label says.</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Understand what available official records show. See what remains uncertain.
          </p>
        </div>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Our Mission</div>
          <p className="tl-caption tl-text-muted">
            TrueLabel is an independent, consumer-first information platform created for Nigerian shoppers and family caregivers. We bridge the interpretation gap between complex statutory gazettes and consumer packaging at the point of purchase.
          </p>
        </Surface>

        <div>
          <h2 className="tl-title-2">Our non-negotiable principles</h2>
        </div>

        <Stack gap="tight">
          <Surface>
            <div className="tl-label-bold">Evidence before conclusions</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              We never guess, simulate, or assume information. When evidence is incomplete or partial, we report uncertainty clearly rather than fabricating conclusions.
            </p>
          </Surface>

          <Surface>
            <div className="tl-label-bold">The Zero-AI Verdict Law</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Multimodal AI vision is strictly restricted to reading packaging text. AI models never choose, recommend, or adjust verification verdicts. All decisions are made by 100% deterministic, test-covered code.
            </p>
          </Surface>

          <Surface>
            <div className="tl-label-bold">No Commercial Influence on Verdicts</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              TrueLabel does not sell favourable verdicts, marketing approval seals, or commercial ranking. We remain strictly independent.
            </p>
          </Surface>

          <Surface>
            <div className="tl-label-bold">Strict Medicine Boundary</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Medicine packaging is displayed in faithful label-only mode. We strictly prohibit dose calculations, scheduling, or medical advice. Consumers are always directed to speak with a licensed pharmacist.
            </p>
          </Surface>

          <Surface>
            <div className="tl-label-bold">Zero Image Retention</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Your packaging photos belong to you. We process photos exclusively in volatile RAM and discard them immediately. Photos are never saved to disks, databases, or cloud buckets.
            </p>
          </Surface>
        </Stack>

        <div className="tl-caveat">
          TrueLabel evaluates documentary packaging evidence against official public records. It never guarantees that physical contents are genuine, safe, or unadulterated.
        </div>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Scan a product now
            </Button>
          </Link>
          <Link href="/privacy" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Read our privacy architecture
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
