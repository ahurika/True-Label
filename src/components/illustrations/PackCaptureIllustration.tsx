import React from 'react';
import type { SVGProps } from 'react';

interface PackCaptureIllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function PackCaptureIllustration({
  className,
  ...props
}: PackCaptureIllustrationProps) {
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
      {/* Product box */}
      <rect
        x="60"
        y="30"
        width="80"
        height="100"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--tl-color-blue-50, rgba(37,99,235,0.06))"
      />
      {/* Label lines on box */}
      <path d="M78 55h44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 65h30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 80h44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 90h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Camera viewfinder corners */}
      <path d="M30 25h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 25v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M170 25h-18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M170 25v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M30 135h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 135v-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M170 135h-18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M170 135v-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Focus dot */}
      <circle cx="100" cy="80" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
