import React from 'react';
import { VerdictType, VerdictIcon } from './VerdictIcon';
import { Caveat } from '../feedback/Caveat';
import { getVerdictTitle, requiresCopiedNumberCaveat, VerdictNumber } from '@/domain/verdict-types';
import { VerdictCode } from '@/domain/types';

export interface VerdictSlipProps extends React.HTMLAttributes<HTMLDivElement> {
  verdict: VerdictType;
  verdictNumber?: VerdictNumber;
  title?: string;
  body?: string;
  showCaveat?: boolean;
}

/**
 * VerdictSlip renders exactly one evidence-based verdict state.
 * Uses strict approved terminology and definitions in accordance with PRD v4.0:
 * 1. Matches a NAFDAC alert (alert_match)
 * 2. Registration details don't match (registration_discrepancy)
 * 3. Could not confirm (could_not_confirm)
 * 4. Registry details match (registry_match)
 */
export const VerdictSlip: React.FC<VerdictSlipProps> = ({
  verdict,
  verdictNumber,
  title,
  body,
  showCaveat,
  className = '',
  children,
  ...props
}) => {
  const displayTitle =
    title ||
    (verdictNumber ? getVerdictTitle(verdictNumber) : getVerdictTitle(verdict as VerdictCode));

  const shouldShowCaveat =
    showCaveat !== undefined
      ? showCaveat
      : verdictNumber
      ? requiresCopiedNumberCaveat(verdictNumber)
      : requiresCopiedNumberCaveat(verdict as VerdictCode);

  // Normalize data attribute for CSS token styling
  const tokenVerdict =
    verdict === 'registry_match' || verdict === 'registered'
      ? 'registered'
      : verdict === 'alert_match' || verdict === 'alert'
      ? 'alert'
      : verdict === 'registration_discrepancy' || verdict === 'number-problem'
      ? 'number-problem'
      : 'unconfirmed';

  return (
    <div
      className={`tl-verdict-slip ${className}`.trim()}
      data-verdict={tokenVerdict}
      {...props}
    >
      <div className="tl-verdict-slip-title">
        <VerdictIcon verdict={verdict} size={28} />
        <span>{displayTitle}</span>
      </div>
      {body && <p className="tl-verdict-slip-body">{body}</p>}
      {children}
      {shouldShowCaveat && <Caveat className="tl-mt-2" />}
    </div>
  );
};
