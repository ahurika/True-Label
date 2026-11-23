import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Cream jar / cosmetic tub
 * Low-profile cylindrical jar with wide screw lid.
 */
export function CreamJarIllustration({
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
      {/* Wide Lid Top */}
      <ellipse
        cx="80"
        y="48"
        rx="48"
        ry="14"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Lid Rim Side */}
      <path
        d="M32 48 V62 C32 70 53 76 80 76 C107 76 128 70 128 62 V48"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.3))"
      />

      {/* Jar Body */}
      <path
        d="M36 62 V112 C36 122 55 130 80 130 C105 130 124 122 124 112 V62"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Jar base contour */}
      <path
        d="M36 112 C36 122 55 130 80 130 C105 130 124 122 124 112"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Label band on jar body */}
      <path
        d="M36 78 C52 86 108 86 124 78 V100 C108 108 52 108 36 100 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="60" y1="89" x2="100" y2="89" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="95" x2="92" y2="95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
