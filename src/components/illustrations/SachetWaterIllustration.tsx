import React from 'react';
import type { SVGProps } from 'react';

export interface IllustrationProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Product schematic: Sachet water pouch
 * Pillow sachet with sealed top/bottom seams and center printed label area.
 */
export function SachetWaterIllustration({
  className,
  size = 160,
  ...props
}: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Top heat-seal seam */}
      <rect
        x="40"
        y="24"
        width="80"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="48" y1="29" x2="112" y2="29" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      {/* Main sachet body with slight convex bulge */}
      <path
        d="M44 34 C36 70 36 90 44 126 L116 126 C124 90 124 70 116 34 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Bottom heat-seal seam */}
      <rect
        x="40"
        y="126"
        width="80"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="48" y1="131" x2="112" y2="131" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      {/* Center printed label panel */}
      <rect
        x="54"
        y="58"
        width="52"
        height="44"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      {/* Schematic label text lines */}
      <line x1="62" y1="68" x2="98" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="76" x2="92" y2="76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="84" x2="86" y2="84" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="92" x2="94" y2="92" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
