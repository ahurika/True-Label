'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell, Stack } from '@/components/layout';
import { FormField, TextInput } from '@/components/forms';
import { Button, Surface } from '@/components/ui';
import { getPackSession } from '@/lib/session/pack-store';

/**
 * Screen E01: Report a concern (PRD v4.0 §11 & Journey E)
 * Controlled reporting flow providing verified official NAFDAC contact channels.
 * TrueLabel never claims regulatory receipt unless confirmed by an authorized API.
 */
export default function ReportConcernPage() {
  const [pack, setPack] = useState<{
    registrationNumber?: string;
    brand?: string;
    productName?: string;
    manufacturer?: string;
    batchNumber?: string;
  } | null>(null);

  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan) {
      setPack({
        registrationNumber: session.registrationNumber,
        brand: session.brand,
        productName: session.productName,
        manufacturer: session.manufacturer,
        batchNumber: session.batchNumber,
      });
    }
  }, []);

  const reportSummaryText = `TRUELABEL CONSUMER REPORT
Registration Number: ${pack?.registrationNumber || 'Not provided'}
Brand Name: ${pack?.brand || 'Not provided'}
Product Name: ${pack?.productName || 'Not provided'}
Manufacturer: ${pack?.manufacturer || 'Not provided'}
Batch / Lot: ${pack?.batchNumber || 'Not provided'}
Purchase Location: ${location || 'Not provided'}
Purchase Date: ${purchaseDate || 'Not provided'}
Concern Details: ${details || 'Potential packaging discrepancy identified during documentary check.'}
Generated via TrueLabel Nigeria (https://truelabel.ng)`;

  const handleCopyReport = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(reportSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSubmitInternalFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'report',
          issueType: 'suspected_fake',
          registrationNumber: pack?.registrationNumber,
          brand: pack?.brand,
          productName: pack?.productName,
          purchaseLocation: location,
          details,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedRef(data.referenceId || 'REF-' + Date.now().toString(36).toUpperCase());
      }
    } catch (err) {
      console.error('[Report] Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      headerProps={{
        title: 'Report a concern',
        backHref: '/result',
      }}
    >
      <Stack gap="default" className="tl-mt-2">
        <div className="tl-caption tl-text-muted">Consumer Protection &amp; Reporting</div>

        <div>
          <h1 className="tl-title-1">Report a packaging concern</h1>
          <p className="tl-body tl-text-muted tl-mt-1">
            If you suspect packaging misrepresentation, counterfeit labelling, or contaminated batches, report directly to regulatory authorities.
          </p>
        </div>

        {/* Official Verified Destinations */}
        <Surface>
          <div className="tl-label-bold tl-mb-1">Verified Official NAFDAC Channels</div>
          <div className="tl-stack-tight tl-caption tl-mt-1">
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:nafdac@nafdac.gov.ng" className="tl-link">
                nafdac@nafdac.gov.ng
              </a>
            </div>
            <div>
              <strong>Pharmacovigilance Portal:</strong>{' '}
              <a
                href="https://primus.nafdac.gov.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="tl-link"
              >
                NAFDAC Primus e-Reporting &rarr;
              </a>
            </div>
            <div>
              <strong>Toll-Free Hotline:</strong> 0700-1-NAFDAC (0700-1-623322)
            </div>
          </div>
        </Surface>

        {/* Copy Report Summary Card */}
        <Surface>
          <div className="tl-label-bold">Evidence Summary for Report</div>
          <div className="tl-caption tl-text-muted tl-mt-1" style={{ whiteSpace: 'pre-line', fontSize: '12px' }}>
            {reportSummaryText}
          </div>
          <div className="tl-mt-2">
            <Button variant="secondary" onClick={handleCopyReport}>
              {copied ? '✓ Report text copied' : 'Copy report text to clipboard'}
            </Button>
          </div>
        </Surface>

        {/* Optional Local Report Submission */}
        {submittedRef ? (
          <div className="tl-surface" style={{ borderLeft: '4px solid var(--color-status-ok-border)' }}>
            <div className="tl-label-bold">Report Logged Locally</div>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Reference code: <strong>{submittedRef}</strong>.
            </p>
            <p className="tl-caption tl-text-muted tl-mt-1">
              Please also send your report to <strong>nafdac@nafdac.gov.ng</strong>. TrueLabel does not claim the regulator has received your submission until official channels confirm receipt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitInternalFeedback}>
            <Surface>
              <div className="tl-label-bold tl-mb-1">Additional details (Optional)</div>

              <Stack gap="tight" className="tl-mt-1">
                <FormField label="Where was this pack purchased?" htmlFor="location">
                  <TextInput
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Balogun Market, Lagos / Chemist in Ikeja"
                  />
                </FormField>

                <FormField label="Purchase date" htmlFor="purchaseDate">
                  <TextInput
                    id="purchaseDate"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    placeholder="e.g. 15 November 2026"
                  />
                </FormField>

                <FormField label="Observations / Suspicion" htmlFor="details">
                  <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe packaging smell, strange print quality, missing tamper band, etc."
                    className="tl-input"
                    rows={3}
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </FormField>

                <div className="tl-mt-1">
                  <Button variant="primary" fullWidth type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Log concern'}
                  </Button>
                </div>
              </Stack>
            </Surface>
          </form>
        )}

        <Stack gap="tight" className="tl-mt-2">
          <Link href="/result" className="tl-w-full">
            <Button variant="ghost" fullWidth>
              Return to verification result
            </Button>
          </Link>
        </Stack>
      </Stack>
    </AppShell>
  );
}
