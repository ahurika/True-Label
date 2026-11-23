'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { Button, NumberPlate, CheckRow, Surface } from '@/components/ui';
import { VerdictSlip } from '@/components/verdict';
import { EqualIcon, MinusIcon, BellIcon, NotEqualIcon, FlagIcon } from '@/components/icons';
import { getPackSession, resetPackSession, PackSessionData } from '@/lib/session/pack-store';

/**
 * Screen D01: The available evidence (PRD v4.0 §8)
 * Renders the deterministic verdict evaluated by the engine.
 * Four Locked Verdicts:
 * - Priority 1: alert_match (Matches a NAFDAC alert)
 * - Priority 2: registration_discrepancy (Registration details don't match)
 * - Priority 3: could_not_confirm (Could not confirm)
 * - Priority 4: registry_match (Registry details match + mandatory caveat)
 */
export default function ResultPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackSessionData | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan && session.verdictResult) {
      setPack(session);
    } else {
      setPack(null);
    }
  }, []);

  const handleShare = async () => {
    if (!pack || !pack.verdictResult) return;
    setIsSharing(true);
    setShareFeedback(null);

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: pack.scanId,
          confirmedPack: {
            registrationNumber: pack.registrationNumber,
            brand: pack.brand,
            productName: pack.productName,
            manufacturer: pack.manufacturer,
            category: pack.category,
            medicineStrength: pack.medicineStrength,
            dosageForm: pack.dosageForm,
            batchNumber: pack.batchNumber,
            expiryDate: pack.expiryDate,
            isManuallyEntered: pack.isManuallyEntered,
          },
          verdictResult: pack.verdictResult,
        }),
      });

      const data = await res.json();
      if (data.success && data.shareUrl) {
        setShareUrl(data.shareUrl);
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.shareUrl);
          setShareFeedback('Share link copied to clipboard (valid for 30 days).');
        } else {
          setShareFeedback('Share link created (valid for 30 days).');
        }
      }
    } catch (err) {
      console.error('[Share] Failed to create share link:', err);
      setShareFeedback('Could not create share link.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleStartNewCheck = () => {
    resetPackSession();
    router.push('/scan/capture');
  };

  // If no active scan result exists, render honest empty state
  if (!pack || !pack.verdictResult) {
    return (
      <AppShell
        headerProps={{
          title: 'The available evidence',
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
              <Link href="/scan/capture" className="tl-w-full">
                <Button variant="primary" fullWidth>
                  Scan a pack
                </Button>
              </Link>
              <Link href="/review/enter" className="tl-w-full">
                <Button variant="secondary" fullWidth>
                  Type registration number
                </Button>
              </Link>
            </div>
          </div>
        </Stack>
      </AppShell>
    );
  }

  const result = pack.verdictResult;
  const verdictCode = result.verdict;
  const isRegistered = verdictCode === 'registry_match';
  const isAlert = verdictCode === 'alert_match';
  const isDiscrepancy = verdictCode === 'registration_discrepancy';
  const isUnconfirmed = verdictCode === 'could_not_confirm';

  return (
    <AppShell
      headerProps={{
        title: 'The available evidence',
        backHref: '/review/confirm',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">
          Documentary Evidence Comparison · {pack.isManuallyEntered ? 'Manual Entry' : 'Camera Scan'}
        </div>

        <h1 className="tl-display">The available evidence</h1>

        {/* Official Verdict Slip */}
        <VerdictSlip
          verdict={verdictCode}
          title={result.displayLabel}
          body={result.explanation || result.summary}
          showCaveat={result.mandatoryCaveat}
        />

        {/* Confirmed Registration Number Plate */}
        <NumberPlate value={pack.registrationNumber || 'NOT DETECTED'} />

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

        {/* Evidence Breakdown for Verdict 4: Registry details match */}
        {isRegistered && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">What we checked</div>
            <CheckRow
              icon={<EqualIcon size={20} className="tl-text-muted" />}
              label="Registration number"
              value={`Matches confirmed pack number exactly (${pack.registrationNumber})`}
            />
            <div className="tl-divider" />
            <CheckRow
              icon={<EqualIcon size={20} className="tl-text-muted" />}
              label="Brand &amp; product identity"
              value={`${pack.brand} — ${pack.productName}`}
            />
            {pack.manufacturer && (
              <>
                <div className="tl-divider" />
                <CheckRow
                  icon={<EqualIcon size={20} className="tl-text-muted" />}
                  label="Manufacturer"
                  value={pack.manufacturer}
                />
              </>
            )}
            <div className="tl-divider" />
            <CheckRow
              icon={<EqualIcon size={20} className="tl-text-muted" />}
              label="Record status"
              value="Active and not expired in statutory source"
            />
            <div className="tl-divider" />
            <CheckRow
              icon={<MinusIcon size={20} className="tl-text-muted" />}
              label="NAFDAC alerts"
              value="No active public recall notices match this batch or pack name"
            />
            <div className="tl-divider" />
            <CheckRow
              icon={<MinusIcon size={20} className="tl-text-muted" />}
              label="Data source"
              value={result.sourceMetadata?.sourceName || 'Curated NAFDAC gazette reference records'}
            />
          </Surface>
        )}

        {/* Evidence Breakdown for Verdict 1: Matches a NAFDAC alert */}
        {isAlert && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">NAFDAC Recall Notice</div>
            <CheckRow
              icon={<BellIcon size={20} className="tl-text-muted" />}
              label="Alert Reference"
              value={result.matchedAlert?.alertNumber || 'Official Recall Alert'}
            />
            <div className="tl-divider" />
            <CheckRow
              icon={<BellIcon size={20} className="tl-text-muted" />}
              label="Recall Title"
              value={result.matchedAlert?.title || 'Contaminated Product Warning'}
            />
            <div className="tl-divider" />
            <CheckRow
              icon={<BellIcon size={20} className="tl-text-muted" />}
              label="Matched packaging evidence"
              value={`${result.matchedAlert?.matchedField === 'batch_number' ? 'Batch number' : 'Pack name'}: ${result.matchedAlert?.matchedValue}`}
            />
            {result.matchedAlert?.officialSourceUrl && (
              <>
                <div className="tl-divider" />
                <div className="tl-caption tl-mt-1">
                  <a
                    href={result.matchedAlert.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tl-link"
                  >
                    View official NAFDAC bulletin &rarr;
                  </a>
                </div>
              </>
            )}
          </Surface>
        )}

        {/* Evidence Breakdown for Verdict 2: Registration details don't match */}
        {isDiscrepancy && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">Discrepancy Conflict Details</div>
            {result.discrepancies?.map((disc, idx) => (
              <CheckRow
                key={idx}
                icon={<NotEqualIcon size={20} className="tl-text-muted" />}
                label={`Issue ${idx + 1}`}
                value={disc}
              />
            ))}
          </Surface>
        )}

        {/* Evidence Breakdown for Verdict 3: Could not confirm */}
        {isUnconfirmed && (
          <Surface>
            <div className="tl-label-bold tl-mb-1">Why confirmation was not possible</div>
            <p className="tl-caption tl-text-muted">
              {result.explanation ||
                'Available evidence is insufficient to complete a comparison against verified statutory records. Absence from a partial dataset never implies non-registration.'}
            </p>
          </Surface>
        )}

        {/* Source Freshness Information (PRD v4.0 §8) */}
        <div className="tl-surface">
          <div className="tl-label-bold">Source Provenance &amp; Freshness</div>
          <div className="tl-caption tl-text-muted tl-mt-1">
            <strong>Source:</strong> {result.sourceMetadata?.sourceName || 'Curated Statutory Reference Records'}
          </div>
          <div className="tl-caption tl-text-muted">
            <strong>Coverage:</strong> {result.sourceMetadata?.sourceCoverage?.toUpperCase() || 'PARTIAL'} (absence does not prove non-registration)
          </div>
          <div className="tl-caption tl-text-muted">
            <strong>Engine:</strong> {result.decisionEngineVersion || 'v4.0.0-deterministic'}
          </div>
        </div>

        {/* Share feedback confirmation */}
        {shareFeedback && (
          <div className="tl-callout tl-callout-info" style={{ fontSize: '13px' }}>
            {shareFeedback}
            {shareUrl && (
              <div className="tl-mt-1">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="tl-link">
                  Open share link
                </a>
              </div>
            )}
          </div>
        )}

        {/* Next recommended action CTAs */}
        <Stack gap="tight" className="tl-mt-2">
          <Link href="/result/evidence" className="tl-w-full">
            <Button variant="secondary" fullWidth>
              Inspect documentary evidence
            </Button>
          </Link>

          <Button variant="secondary" fullWidth onClick={handleShare} disabled={isSharing}>
            {isSharing ? 'Creating link...' : 'Share read-only check'}
          </Button>

          <Link href="/report" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Report a concern to NAFDAC
            </Button>
          </Link>

          <Button variant="ghost" fullWidth onClick={handleStartNewCheck}>
            Check another pack
          </Button>
        </Stack>
      </Stack>
    </AppShell>
  );
}
