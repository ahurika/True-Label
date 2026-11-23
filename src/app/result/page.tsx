'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, SpecRow, Surface } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';
import { FlagIcon } from '@/components/icons';
import { getPackSession, resetPackSession, PackSessionData } from '@/lib/session/pack-store';

/**
 * Screen D01: The available evidence (PRD v4.0 §8)
 * Clean, simplified result view displaying authoritative verdict and confirmed product information.
 * Follows user directive: shows product information cleanly without excessive clickable elements,
 * concluding with exactly two primary actions: "Retake Photo" and "Close".
 */
export default function ResultPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackSessionData | null>(null);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan && session.verdictResult) {
      setPack(session);
    } else {
      setPack(null);
    }
  }, []);

  const handleRetakePhoto = () => {
    resetPackSession();
    router.push('/scan/capture');
  };

  const handleClose = () => {
    resetPackSession();
    router.push('/');
  };

  // If no active scan result exists, render honest empty state
  if (!pack || !pack.verdictResult) {
    return (
      <AppShell
        hideNav={true}
        headerProps={{
          title: 'Verification Result',
          backHref: '/',
        }}
      >
        <Stack gap="loose" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">No Verification Result Available</div>

          <div>
            <h1 className="tl-title-1">No active check found</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              TrueLabel evaluates packaging evidence when you photograph a pack or type its details.
            </p>
          </div>

          <div className="tl-surface" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div className="tl-body tl-text-muted tl-mb-2">
              Start a new check to compare packaging against statutory records and public safety alerts.
            </div>
            <div className="tl-stack-tight">
              <Button variant="primary" fullWidth onClick={handleRetakePhoto}>
                Retake Photo
              </Button>
              <Button variant="secondary" fullWidth onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </Stack>
      </AppShell>
    );
  }

  const result = pack.verdictResult;
  const verdictCode = result.verdict;
  const isAlert = verdictCode === 'alert_match';
  const isDiscrepancy = verdictCode === 'registration_discrepancy';

  return (
    <AppShell
      hideNav={true}
      headerProps={{
        title: 'The available evidence',
        backHref: '/',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Documentary Evidence Comparison · {pack.isManuallyEntered ? 'Manual Entry' : 'Camera Scan'}
        </div>

        <h1 className="tl-display">The available evidence</h1>

        {/* Official Verdict Slip with Mandatory Copied-Number Caveat on Positive Verdict */}
        <VerdictSlip
          verdict={verdictCode}
          title={result.displayLabel}
          body={result.explanation || result.summary}
          showCaveat={result.mandatoryCaveat}
        />

        {/* Confirmed Registration Number Plate */}
        <NumberPlate value={pack.registrationNumber || 'NOT DETECTED'} />

        {/* Product Information */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Product Details</div>
          {pack.brand && <SpecRow term="Brand" value={pack.brand} />}
          {pack.productName && <SpecRow term="Product name" value={pack.productName} />}
          {pack.manufacturer && <SpecRow term="Manufacturer" value={pack.manufacturer} />}
          {pack.category && <SpecRow term="Category" value={pack.category.toUpperCase()} />}
          {pack.batchNumber && <SpecRow term="Batch / code" value={pack.batchNumber} />}
          {pack.expiryDate && <SpecRow term="Expiry date" value={pack.expiryDate} />}
          {pack.medicineStrength && <SpecRow term="Strength" value={pack.medicineStrength} />}
        </Surface>

        {/* Verbatim Directions & Mandatory Pharmacist Notice for Medicines */}
        {pack.category === 'medicine' && (
          <>
            {pack.directions && (
              <Surface>
                <div className="tl-label-bold">Verbatim Printed Directions</div>
                <p className="tl-body tl-mt-1" style={{ whiteSpace: 'pre-line' }}>
                  {pack.directions}
                </p>
              </Surface>
            )}
            <div className="tl-caveat">
              <strong>Mandatory pharmacist notice:</strong> For questions about how to use this medicine, ask a licensed pharmacist or doctor. Do not rely on this app to change the directions on the pack.
            </div>
          </>
        )}

        {/* Recall Details for Verdict 1: Matches a NAFDAC alert */}
        {isAlert && result.matchedAlert && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">NAFDAC Recall Notice</div>
            <SpecRow term="Alert Reference" value={result.matchedAlert.alertNumber || 'Official Recall Alert'} />
            <SpecRow term="Recall Title" value={result.matchedAlert.title || 'Contaminated Product Warning'} />
            <SpecRow
              term="Matched packaging evidence"
              value={`${result.matchedAlert.matchedField === 'batch_number' ? 'Batch number' : 'Pack name'}: ${result.matchedAlert.matchedValue}`}
            />
          </Surface>
        )}

        {/* Discrepancy Details for Verdict 2: Registration details don't match */}
        {isDiscrepancy && result.discrepancies && result.discrepancies.length > 0 && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">Discrepancy Details</div>
            {result.discrepancies.map((disc, idx) => (
              <SpecRow key={idx} term={`Issue ${idx + 1}`} value={disc} />
            ))}
          </Surface>
        )}

        {/* Independent Flags (PRD v4.0 §6.4) */}
        {result.flags && result.flags.length > 0 && (
          <div className="tl-stack-tight">
            {result.flags.includes('ALERT_ON_BRAND') && (
              <div className="tl-callout tl-callout-warning" style={{ fontSize: '13px' }}>
                <FlagIcon size={18} className="tl-mr-1" />
                <strong>Brand Advisory:</strong> An official NAFDAC alert mentions this brand, but this specific pack name or batch is not listed as affected.
              </div>
            )}
            {result.flags.includes('LOOKALIKE_NAME') && (
              <div className="tl-callout tl-callout-warning" style={{ fontSize: '13px' }}>
                <FlagIcon size={18} className="tl-mr-1" />
                <strong>Lookalike Warning:</strong> Printed brand resembles a registered brand name but has spelling variations.
              </div>
            )}
            {result.flags.includes('EXPIRED_PRODUCT') && (
              <div className="tl-callout tl-callout-danger" style={{ fontSize: '13px' }}>
                <strong>Product Expired:</strong> Printed expiry date is in the past. Do not use or consume expired items.
              </div>
            )}
            {result.flags.includes('DATE_ISSUE') && (
              <div className="tl-callout tl-callout-warning" style={{ fontSize: '13px' }}>
                <strong>Date Inconsistency:</strong> Printed dates appear ambiguous or inconsistent.
              </div>
            )}
          </div>
        )}

        {/* Subtle Provenance & Freshness Footer */}
        <div className="tl-caption tl-text-muted" style={{ textAlign: 'center', margin: '8px 0' }}>
          Source: {result.sourceMetadata?.sourceName || 'Curated Statutory Reference Records'} · Coverage: {result.sourceMetadata?.sourceCoverage?.toUpperCase() || 'PARTIAL'} (absence does not prove non-registration)
        </div>

        {/* Result Action CTAs: Exactly Two Actions */}
        <Stack gap="tight" className="tl-mt-2">
          <Button variant="primary" fullWidth onClick={handleRetakePhoto}>
            Retake Photo
          </Button>

          <Button variant="secondary" fullWidth onClick={handleClose}>
            Close
          </Button>
        </Stack>
      </Stack>
    </AppShell>
  );
}
