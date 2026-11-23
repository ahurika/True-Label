'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, Surface, SpecRow, StatusLabel } from '@/components/ui';
import { ConfirmButton } from '@/components/forms';
import { MedicineLabelIllustration } from '@/components/illustrations';
import { getPackSession, setPackSession, PackSessionData } from '@/lib/session/pack-store';

/**
 * Screen C13 & F01: Review the medicine label (PRD §10.7 Strict Label-Only Mode)
 * Faithful printed directions, mandatory strength confirmation, and pharmacist notice.
 * Strictly PROHIBITED: Dosing calculation, scheduling, frequency conversion, demographic questions.
 */
export default function ReviewMedicineLabelPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackSessionData | null>(null);
  const [strengthConfirmed, setStrengthConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan) {
      setPack(session);
      setStrengthConfirmed(session.isStrengthConfirmed);
    } else {
      setPack(null);
    }
  }, []);

  const handleConfirmChange = (confirmed: boolean) => {
    setStrengthConfirmed(confirmed);
    setPackSession({ isStrengthConfirmed: confirmed });
  };

  const handleInspectEvidence = async () => {
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
          category: 'medicine',
          medicineStrength: pack.medicineStrength,
          isStrengthConfirmedByUser: strengthConfirmed,
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
      console.warn('[Medicine] Verification error:', err);
    } finally {
      setIsVerifying(false);
      router.push('/result');
    }
  };

  if (!pack || !pack.hasActiveScan) {
    return (
      <AppShell
        headerProps={{
          title: 'Review medicine label',
          backHref: '/',
        }}
      >
        <Stack gap="loose" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">No Active Medicine Scan</div>
          <div>
            <h1 className="tl-title-1">No medicine scan found</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              Start by photographing a medicine pack or typing the registration number manually.
            </p>
          </div>
          <div className="tl-caveat">
            <strong>Mandatory pharmacist notice:</strong> For questions about how to use this medicine, ask a licensed pharmacist or doctor. Do not rely on this app to change the directions on the pack.
          </div>
          <div className="tl-stack-tight">
            <Link href="/scan/capture" className="tl-w-full">
              <Button variant="primary" fullWidth>
                Scan a medicine pack
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
        title: 'Review the medicine label',
        backHref: '/review',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Strict label-only mode · PRD §10.7</div>

        <div>
          <h1 className="tl-title-1">Review the medicine label</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            Displaying faithfully what is printed on the package. TrueLabel never calculates doses or converts medical abbreviations.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MedicineLabelIllustration />
        </div>

        <NumberPlate value={pack.registrationNumber || 'NOT DETECTED'} />

        {/* Medicine Identity Details */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Printed Medicine Identity</div>
          <SpecRow term="Product name" value={pack.productName || 'Not specified'} />
          <SpecRow term="Active ingredient(s)" value={pack.activeIngredients || pack.productName || 'Not specified'} />
          <SpecRow term="Printed strength" value={pack.medicineStrength || 'Not specified'} />
          {pack.dosageForm && <SpecRow term="Dosage form" value={pack.dosageForm} />}
          <SpecRow term="Manufacturer" value={pack.manufacturer || 'Not specified'} />
        </Surface>

        {/* Verbatim Directions Display */}
        <Surface>
          <div className="tl-label-bold">Verbatim Printed Directions</div>
          <p className="tl-body tl-mt-1" style={{ whiteSpace: 'pre-line' }}>
            {pack.directions ||
              'Follow directions printed on physical carton or package insert. Never exceed prescribed frequency.'}
          </p>
        </Surface>

        {/* Mandatory Pharmacist Notice (PRD §10.7) */}
        <div className="tl-caveat">
          <strong>Mandatory pharmacist notice:</strong> For questions about how to use this medicine, ask a licensed pharmacist or doctor. Do not rely on this app to change the directions on the pack.
        </div>

        {/* Strength Confirmation Gate */}
        <Surface>
          <div className="tl-label-bold">Confirm printed strength</div>
          <p className="tl-caption tl-text-muted tl-mt-1">
            Confirm that the active strength on the pack matches "{pack.medicineStrength || 'printed strength'}".
          </p>
          <div className="tl-mt-2 tl-cluster" style={{ justifyContent: 'space-between' }}>
            <StatusLabel status={strengthConfirmed ? 'confirmed' : 'pending'}>
              {strengthConfirmed ? 'Strength confirmed' : 'Strength not confirmed'}
            </StatusLabel>
            <ConfirmButton
              confirmed={strengthConfirmed}
              onConfirmChange={handleConfirmChange}
              unconfirmedLabel="Confirm strength"
              confirmedLabel="Confirmed"
            />
          </div>
        </Surface>

        <Stack gap="tight" className="tl-mt-2">
          <Button
            variant="primary"
            fullWidth
            disabled={!strengthConfirmed || isVerifying}
            onClick={handleInspectEvidence}
          >
            {isVerifying ? 'Checking statutory records...' : 'Inspect available evidence'}
          </Button>

          <Link href="/review/enter" className="tl-w-full">
            <Button variant="ghost" fullWidth disabled={isVerifying}>
              Edit medicine details
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
