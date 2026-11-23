import React from 'react';
import type { SVGProps } from 'react';

interface MedicineLabelIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function MedicineLabelIllustration({
  className,
  ...props
}: MedicineLabelIllustrationProps) {
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
      {/* Medicine bottle body */}
      <rect
        x="65"
        y="35"
        width="70"
        height="100"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.06))"
      />

      {/* Cap */}
      <rect
        x="78"
        y="20"
        width="44"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.1))"
      />

      {/* Label area */}
      <rect
        x="75"
        y="58"
        width="50"
        height="55"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.04))"
      />

      {/* Label text lines */}
      <path d="M82 68h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M82 77h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 86h36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 95h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M82 104h30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Pointing arrow — indicating "read this label" */}
      <path
        d="M150 80h-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M140 75l-6 5 6 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
