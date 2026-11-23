import React from 'react';
import type { SVGProps } from 'react';

interface LedgerIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function LedgerIcon({ size = 24, className, ...props }: LedgerIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Open book / ledger */}
      <path d="M2 4c0-1 1-2 3-2s4 1 7 3c3-2 5-3 7-3s3 1 3 2v14c0 .5-.5 1-1 1-1.5 0-3.5 1-6 3h-6c-2.5-2-4.5-3-6-3-.5 0-1-.5-1-1V4z" />
      <path d="M12 5v17" />
      {/* Page lines */}
      <path d="M5 8h4" />
      <path d="M5 11h4" />
      <path d="M15 8h4" />
      <path d="M15 11h4" />
    </svg>
  );
}
