import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms of Service & Documentary Stance | TrueLabel',
  description:
    'Review TrueLabel terms of service, non-authentication stance, medicine label boundaries, and statutory evidence limitations.',
  alternates: {
    canonical: 'https://truelabel.ng/terms',
  },
};

export default function TermsPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Terms of Service',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Legal Terms &amp; Product Boundaries</div>

        <div>
          <h1 className="tl-display">Terms of Service</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Please read these terms carefully before using TrueLabel. By using this service, you agree to these documentary comparison terms.
          </p>
        </div>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Documentary Comparison Only (Not Physical Authentication)</div>
          <p className="tl-caption tl-text-muted">
            TrueLabel provides documentary packaging comparison against available statutory public records and official recall alerts. TrueLabel does NOT inspect, authenticate, or certify the physical or chemical contents inside any pack, does not establish that a product is safe or unadulterated, and does not replace the statutory authority of NAFDAC or analytical laboratories.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">The Copied Number Reality</div>
          <p className="tl-caption tl-text-muted">
            Counterfeit packaging frequently copies genuine, active registration numbers and manufacturer details from authentic products. Therefore, finding a matching registration record in an official gazette never guarantees that the physical contents inside the packaging are authentic, genuine, or safe.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Medicine Module &amp; Pharmacist Disclaimer</div>
          <p className="tl-caption tl-text-muted">
            The medicine module displays printed label directions verbatim. TrueLabel does not calculate dosages, does not recommend dosing schedules, does not convert frequency abbreviations, and does not provide medical or clinical advice. For all questions about using a medicine, consult a licensed pharmacist or physician.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Coverage and Freshness Semantics</div>
          <p className="tl-caption tl-text-muted">
            TrueLabel references curated statutory datasets derived from published NAFDAC Official Gazettes. Because our dataset has partial coverage, the absence of a registration number from our database does NOT establish that a product is unregistered.
          </p>
        </Surface>

        <div className="tl-caveat">
          TrueLabel evaluates documentary packaging evidence against official public records. It never guarantees that physical contents are genuine, safe, or unadulterated.
        </div>

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/scan/capture" className="tl-w-full">
            <Button variant="primary" fullWidth>
              Accept &amp; Scan a Pack
            </Button>
          </Link>
          <Link href="/privacy" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              View Privacy Policy
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
