import React from 'react';
import type { SVGProps } from 'react';

interface OfflineIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function OfflineIllustration({
  className,
  ...props
}: OfflineIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Cloud body */}
      <path
        d="M60 90a25 25 0 0 1 2-50 30 30 0 0 1 56 5 20 20 0 0 1 12 35H60z"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.06))"
      />

      {/* Disconnect slash */}
      <path
        d="M75 60l50 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M125 60l-50 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Signal waves (broken) */}
      <path
        d="M85 115c0 0 5-8 15-8s15 8 15 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
      <path
        d="M75 125c0 0 10-12 25-12s25 12 25 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />

      {/* Small dot */}
      <circle cx="100" cy="140" r="2.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
