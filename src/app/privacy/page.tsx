import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AppShell, Stack } from '@/components/layout';
import { Button, Surface } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy & Zero Image Retention | TrueLabel',
  description:
    'Discover how TrueLabel protects user privacy through zero image persistence, ephemeral 30-minute state, NDPA compliance, and pseudonymous identifiers.',
  alternates: {
    canonical: 'https://truelabel.ng/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <AppShell
      headerProps={{
        title: 'Privacy Policy',
        backHref: '/',
      }}
    >
      <Stack gap="loose" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Privacy Architecture &amp; Data Protection</div>

        <div>
          <h1 className="tl-display">Privacy by architecture.</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            TrueLabel is built from the ground up around strict data minimization and zero image retention under the Nigeria Data Protection Act (NDPA).
          </p>
        </div>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Zero Image Retention Guarantee</div>
          <p className="tl-caption tl-text-muted">
            Uploaded product packaging photos are processed exclusively in transient volatile memory (RAM) to transcribe printed text. Once extraction is complete, image buffers are immediately discarded. TrueLabel never writes packaging photos to disks, databases, object stores (S3), or application logs.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Ephemeral 30-Minute Scan State</div>
          <p className="tl-caption tl-text-muted">
            Transient scan sessions exist solely to allow you to review and confirm extracted text. Scan sessions automatically expire and are purged after exactly 30 minutes. You can also purge your scan state immediately at any time.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Read-Only Shared Results (30-Day Expiry)</div>
          <p className="tl-caption tl-text-muted">
            When you choose to share a verification result, a high-entropy random token is generated. Only the SHA-256 hash of this token is stored. Shared results contain confirmed text fields and evidence metadata only—never original photographs or personal identifiers. Shared links automatically expire after 30 days and carry noindex/nofollow tags.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Pseudonymous Identifiers</div>
          <p className="tl-caption tl-text-muted">
            Application telemetry and audit logs record only cryptographically hashed identifiers (HMAC-SHA256). We never collect or store your phone number, name, precise geolocation, or payment credentials.
          </p>
        </Surface>

        <Surface>
          <div className="tl-label-bold tl-mb-1">Third-Party AI Vision Subprocessors</div>
          <p className="tl-caption tl-text-muted">
            Packaging photos are sent to our AI vision subprocessor (Google Gemini 1.5 Flash) via secure TLS encryption for the sole purpose of structured text transcription. We do not permit subprocessors to use consumer packaging photographs to train general public AI models.
          </p>
        </Surface>

        <div className="tl-mt-2">
          <Link href="/terms" className="tl-w-full" style={{ display: 'block' }}>
            <Button variant="secondary" fullWidth>
              Read Terms of Service
            </Button>
          </Link>
        </div>
      </Stack>
    </AppShell>
  );
}
