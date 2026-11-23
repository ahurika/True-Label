import React from 'react';
import type { SVGProps } from 'react';

interface ReadingIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function ReadingIllustration({
  className,
  ...props
}: ReadingIllustrationProps) {
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
      {/* Document / page */}
      <rect
        x="55"
        y="15"
        width="90"
        height="120"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.06))"
      />

      {/* Text lines being read */}
      <path d="M72 40h56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 52h40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 64h56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 76h48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 88h56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 100h30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Magnifying glass scanning the page */}
      <circle
        cx="148"
        cy="95"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.08))"
      />
      <path d="M161 108l10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Highlight line inside magnifier */}
      <path d="M136 92h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M136 98h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
