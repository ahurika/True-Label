import React from 'react';
import { LedgerIcon } from '../icons/LedgerIcon';
import { MagnifierQuestionIcon } from '../icons/MagnifierQuestionIcon';
import { FlagIcon } from '../icons/FlagIcon';
import { BellIcon } from '../icons/BellIcon';
import { VerdictCode } from '@/domain/types';

export type LegacyVerdictType = 'registered' | 'unconfirmed' | 'number-problem' | 'alert';
export type VerdictType = VerdictCode | LegacyVerdictType;

export interface VerdictIconProps {
  verdict: VerdictType;
  size?: number;
  className?: string;
}

export const VerdictIcon: React.FC<VerdictIconProps> = ({ verdict, size = 24, className }) => {
  switch (verdict) {
    case 'registry_match':
    case 'registered':
      return <LedgerIcon size={size} className={className} />;
    case 'could_not_confirm':
    case 'unconfirmed':
      return <MagnifierQuestionIcon size={size} className={className} />;
    case 'registration_discrepancy':
    case 'number-problem':
      return <FlagIcon size={size} className={className} />;
    case 'alert_match':
    case 'alert':
      return <BellIcon size={size} className={className} />;
    default:
      return <MagnifierQuestionIcon size={size} className={className} />;
  }
};
