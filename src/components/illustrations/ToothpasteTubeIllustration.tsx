import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Toothpaste tube
 * Squeezable tube with crimped end, tapered shoulders, and flip/screw cap.
 */
export function ToothpasteTubeIllustration({
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
      {/* Crimped top seam */}
      <rect
        x="48"
        y="22"
        width="64"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="52" y1="26" x2="108" y2="26" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />

      {/* Main flexible tube body */}
      <path
        d="M52 30 L60 110 C60 118 68 122 72 122 H88 C92 122 100 118 100 110 L108 30 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Cap at bottom */}
      <rect
        x="68"
        y="122"
        width="24"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="72" y1="126" x2="72" y2="136" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="126" x2="80" y2="136" stroke="currentColor" strokeWidth="1" />
      <line x1="88" y1="126" x2="88" y2="136" stroke="currentColor" strokeWidth="1" />

      {/* Front brand banner */}
      <path
        d="M58 54 H102 V86 H58 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="66" y1="64" x2="94" y2="64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="66" y1="74" x2="88" y2="74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
