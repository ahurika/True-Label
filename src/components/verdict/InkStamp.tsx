import React from 'react';
import { VerdictType, VerdictIcon } from './VerdictIcon';

export interface InkStampProps extends React.HTMLAttributes<HTMLDivElement> {
  verdict: VerdictType;
}

export const InkStamp: React.FC<InkStampProps> = ({
  verdict,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`tl-ink-stamp ${className}`.trim()}
      data-verdict={verdict}
      aria-hidden="true"
      {...props}
    >
      <VerdictIcon verdict={verdict} size={32} />
    </div>
  );
};
