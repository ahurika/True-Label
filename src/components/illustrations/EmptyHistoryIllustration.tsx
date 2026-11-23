import React from 'react';
import type { SVGProps } from 'react';

interface EmptyHistoryIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function EmptyHistoryIllustration({
  className,
  ...props
}: EmptyHistoryIllustrationProps) {
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
      {/* Stack of blank cards */}
      <rect
        x="55"
        y="22"
        width="90"
        height="60"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 3"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.04))"
      />
      <rect
        x="50"
        y="28"
        width="90"
        height="60"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 3"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.06))"
      />
      <rect
        x="45"
        y="34"
        width="90"
        height="60"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.08))"
      />

      {/* Empty state indicator — small clock */}
      <circle
        cx="100"
        cy="118"
        r="14"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M100 110v8l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Dots suggesting empty list */}
      <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="90" cy="55" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="110" cy="55" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
