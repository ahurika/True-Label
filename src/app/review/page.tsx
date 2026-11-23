'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, SpecRow, StatusLabel, Surface } from '@/components/ui';
import { ConfirmButton } from '@/components/forms';
import { getPackSession, setPackSession, PackSessionData } from '@/lib/session/pack-store';

/**
 * Screen C01: Review what was read & Unified Confirmation (PRD v4.0 §5 Step 5)
 * Displays extracted or manually entered pack details.
 * Strictly requires explicit user confirmation of registration number and identity fields.
 * Streamlined single-screen verification workflow with zero unnecessary hops.
 */
export default function ReviewPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackSessionData | null>(null);
  const [numberConfirmed, setNumberConfirmed] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [strengthConfirmed, setStrengthConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan) {
      setPack(session);
      setNumberConfirmed(session.isNumberConfirmed);
      setIdentityConfirmed(session.isIdentityConfirmed);
      setStrengthConfirmed(session.isStrengthConfirmed);
    } else {
      setPack(null);
    }
  }, []);

  const handleNumberConfirmChange = (confirmed: boolean) => {
    setNumberConfirmed(confirmed);
    setPackSession({ isNumberConfirmed: confirmed });
  };

  const handleIdentityConfirmChange = (confirmed: boolean) => {
    setIdentityConfirmed(confirmed);
    setPackSession({ isIdentityConfirmed: confirmed });
  };

  const handleStrengthConfirmChange = (confirmed: boolean) => {
    setStrengthConfirmed(confirmed);
    setPackSession({ isStrengthConfirmed: confirmed });
  };

  const isReadyToVerify =
    pack?.category === 'medicine'
      ? numberConfirmed && strengthConfirmed
      : numberConfirmed && identityConfirmed;

  const handleVerify = async () => {
    if (!pack) return;
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: pack.registrationNumber,
          isNumberConfirmedByUser: numberConfirmed,
          brand: pack.brand,
          productName: pack.productName,
          manufacturer: pack.manufacturer,
          isIdentityConfirmedByUser: pack.category === 'medicine' ? true : identityConfirmed,
          category: pack.category,
          medicineStrength: pack.medicineStrength,
          isStrengthConfirmedByUser: pack.category === 'medicine' ? strengthConfirmed : undefined,
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
      console.warn('[ReviewPage] Evaluation error:', err);
    } finally {
      setIsVerifying(false);
      router.push('/result');
    }
  };

  // If no active scan has taken place, display honest empty state
  if (!pack || !pack.hasActiveScan) {
    return (
      <AppShell
        headerProps={{
          title: 'Review packaging',
          backHref: '/',
        }}
      >
        <Stack gap="loose" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">No Active Scan</div>

          <div>
            <h1 className="tl-title-1">No packaging scan found</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              Start by photographing a product pack or typing the printed registration details manually.
            </p>
          </div>

          <div className="tl-surface" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div className="tl-body tl-text-muted tl-mb-2">
              TrueLabel requires confirmed packaging details before checking statutory records.
            </div>
            <div className="tl-stack-tight">
              <Link href="/scan/capture" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Scan packaging photos
                </Button>
              </Link>
              <Link href="/review/enter" className="tl-w-full">
                <Button variant="secondary" fullWidth>
                  Enter details manually
                </Button>
              </Link>
            </div>
          </div>
        </Stack>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerProps={{
        title: 'Review what was read',
        backHref: '/scan/capture',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Extracted Packaging Details · {pack.isManuallyEntered ? 'Manually Entered' : 'AI Read from Photo'}
        </div>

        <div>
          <h1 className="tl-title-1">Review what was read</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Compare every character with your physical pack. This confirms transcription accuracy only.
          </p>
        </div>

        {/* Step A: Registration Number Plate with confirmation */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Registration number</div>
          <NumberPlate value={pack.registrationNumber || 'NOT DETECTED'} />
          <div className="tl-mt-2 tl-cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusLabel status={numberConfirmed ? 'confirmed' : 'pending'}>
              {numberConfirmed ? 'Number confirmed' : 'Number not confirmed'}
            </StatusLabel>
            <ConfirmButton
              confirmed={numberConfirmed}
              onConfirmChange={handleNumberConfirmChange}
              unconfirmedLabel="Confirm number"
              confirmedLabel="Confirmed"
            />
          </div>
        </Surface>

        {/* Step B: Printed Identity Details */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Printed Pack Details</div>
          <SpecRow term="Brand" value={pack.brand || 'Not specified'} />
          <SpecRow term="Product name" value={pack.productName || 'Not specified'} />
          <SpecRow term="Manufacturer" value={pack.manufacturer || 'Not specified'} />
          <SpecRow term="Category" value={pack.category.toUpperCase()} />
          {pack.batchNumber && <SpecRow term="Batch / code" value={pack.batchNumber} />}
          {pack.expiryDate && <SpecRow term="Expiry date" value={pack.expiryDate} />}
          {pack.medicineStrength && <SpecRow term="Strength" value={pack.medicineStrength} />}
        </Surface>

        {/* Step C: Category-Specific Confirmation */}
        {pack.category === 'medicine' ? (
          <>
            <Surface>
              <div className="tl-label-bold">Verbatim Printed Directions</div>
              <p className="tl-body tl-mt-1" style={{ whiteSpace: 'pre-line' }}>
                {pack.directions ||
                  'Follow directions printed on physical carton or package insert. Never exceed prescribed frequency.'}
              </p>
            </Surface>

            <div className="tl-caveat">
              <strong>Mandatory pharmacist notice:</strong> For questions about how to use this medicine, ask a licensed pharmacist or doctor. Do not rely on this app to change the directions on the pack.
            </div>

            <Surface>
              <div className="tl-label-bold">Confirm printed strength</div>
              <p className="tl-caption tl-text-muted tl-mt-1">
                Confirm that the active strength on the pack matches &ldquo;{pack.medicineStrength || 'printed strength'}&rdquo;.
              </p>
              <div className="tl-mt-2 tl-cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusLabel status={strengthConfirmed ? 'confirmed' : 'pending'}>
                  {strengthConfirmed ? 'Strength confirmed' : 'Strength not confirmed'}
                </StatusLabel>
                <ConfirmButton
                  confirmed={strengthConfirmed}
                  onConfirmChange={handleStrengthConfirmChange}
                  unconfirmedLabel="Confirm strength"
                  confirmedLabel="Confirmed"
                />
              </div>
            </Surface>
          </>
        ) : (
          <Surface>
            <div className="tl-label-bold">Confirm identity details</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Read brand, product name, and manufacturer against physical packaging.
            </p>
            <div className="tl-mt-2 tl-cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusLabel status={identityConfirmed ? 'confirmed' : 'pending'}>
                {identityConfirmed ? 'Identity confirmed' : 'Identity not confirmed'}
              </StatusLabel>
              <ConfirmButton
                confirmed={identityConfirmed}
                onConfirmChange={handleIdentityConfirmChange}
                unconfirmedLabel="Confirm brand, product and maker"
                confirmedLabel="Identity fields confirmed"
              />
            </div>
          </Surface>
        )}

        {/* Primary and Secondary Actions */}
        <Stack gap="tight" className="tl-mt-2">
          <Button
            variant="primary"
            fullWidth
            disabled={!isReadyToVerify || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? 'Evaluating evidence...' : 'Inspect available evidence'}
          </Button>

          {pack.category === 'medicine' ? (
            <Button
              variant="secondary"
              fullWidth
              disabled={!numberConfirmed}
              onClick={() => router.push('/review/medicine')}
            >
              Continue to medicine review
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              disabled={!numberConfirmed}
              onClick={() => router.push('/review/confirm')}
            >
              Continue to check identity
            </Button>
          )}

          <Button variant="ghost" fullWidth onClick={() => router.push('/review/enter')}>
            Edit pack details
          </Button>

          {!pack.isManuallyEntered && (
            <Button variant="ghost" fullWidth onClick={() => router.push('/scan/capture')}>
              Retake photo
            </Button>
          )}
        </Stack>
      </Stack>
    </AppShell>
  );
}
