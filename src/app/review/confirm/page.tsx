'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, Surface } from '@/components/ui';
import { ConfirmButton } from '@/components/forms';
import { getPackSession, setPackSession, PackSessionData } from '@/lib/session/pack-store';

/**
 * Screen C03: Check the identity fields (PRD v4.0 §5 Step 5)
 * Explicit identity confirmation gate before evaluating statutory records.
 * Renders honest empty state when no active session exists.
 */
export default function ConfirmIdentityPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackSessionData | null>(null);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan) {
      setPack(session);
      setIdentityConfirmed(session.isIdentityConfirmed);
    } else {
      setPack(null);
    }
  }, []);

  const handleConfirmChange = (confirmed: boolean) => {
    setIdentityConfirmed(confirmed);
    setPackSession({ isIdentityConfirmed: confirmed });
  };

  const handleVerify = async () => {
    if (!pack) return;
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: pack.registrationNumber,
          isNumberConfirmedByUser: pack.isNumberConfirmed,
          brand: pack.brand,
          productName: pack.productName,
          manufacturer: pack.manufacturer,
          isIdentityConfirmedByUser: true,
          category: pack.category,
          medicineStrength: pack.medicineStrength,
          isStrengthConfirmedByUser: pack.isStrengthConfirmed,
          batchNumber: pack.batchNumber,
          expiryDate: pack.expiryDate,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setPackSession({
          verdictResult: data.result,
        });
      }
    } catch (err: unknown) {
      console.warn('[ConfirmIdentity] Evaluation error:', err);
    } finally {
      setIsVerifying(false);
      router.push('/result');
    }
  };

  if (!pack || !pack.hasActiveScan) {
    return (
      <AppShell
        headerProps={{
          title: 'Confirm identity',
          backHref: '/',
        }}
      >
        <Stack gap="loose" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">No Active Scan</div>
          <div>
            <h1 className="tl-title-1">No packaging scan found</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              Start by photographing a product pack or typing registration details manually.
            </p>
          </div>
          <div className="tl-stack-tight">
            <Link href="/scan/capture" className="tl-w-full">
              <Button variant="primary" fullWidth>
                Scan a pack
              </Button>
            </Link>
            <Link href="/review/enter" className="tl-w-full">
              <Button variant="secondary" fullWidth>
                Type details manually
              </Button>
            </Link>
          </div>
        </Stack>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerProps={{
        title: 'Check the identity fields',
        backHref: '/review',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Identity Confirmation Gate</div>

        <div>
          <h1 className="tl-title-1">Check the identity fields</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Read all three against the physical pack before continuing.
          </p>
        </div>

        <NumberPlate value={pack.registrationNumber || 'NOT DETECTED'} />

        <Surface>
          <div className="tl-label-bold tl-mb-1">Read all three against the physical pack</div>
          <div className="tl-stack-tight tl-caption tl-mt-1">
            <div>
              <strong>Brand:</strong> {pack.brand || 'Not specified'}
            </div>
            <div>
              <strong>Product:</strong> {pack.productName || 'Not specified'}
            </div>
            <div>
              <strong>Manufacturer:</strong> {pack.manufacturer || 'Not specified'}
            </div>
          </div>
        </Surface>

        <Surface>
          <div className="tl-label-bold">Your confirmation is required</div>
          <p className="tl-caption tl-text-muted tl-mt-1">
            Number confirmation alone cannot support a positive registration match.
          </p>
          <div className="tl-mt-2">
            <ConfirmButton
              confirmed={identityConfirmed}
              onConfirmChange={handleConfirmChange}
              unconfirmedLabel="Confirm brand, product and maker"
              confirmedLabel="Identity fields confirmed"
            />
          </div>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Button
            variant="primary"
            fullWidth
            disabled={!identityConfirmed || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? 'Evaluating evidence...' : 'Inspect available evidence'}
          </Button>

          <Link href="/review/enter" className="tl-w-full">
            <Button variant="ghost" fullWidth disabled={isVerifying}>
              Edit the fields
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
