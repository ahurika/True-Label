import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Bottle
 * Beverage or liquid medicine bottle with ribbed screw cap, tapered neck, and main label.
 */
export function BottleIllustration({
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
      {/* Bottle Cap */}
      <rect
        x="70"
        y="18"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      <line x1="75" y1="20" x2="75" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="20" x2="80" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="85" y1="20" x2="85" y2="32" stroke="currentColor" strokeWidth="1" />

      {/* Neck & Shoulder to body */}
      <path
        d="M72 34 V48 C72 58 50 66 50 78 V134 C50 138 54 142 60 142 H100 C106 142 110 138 110 134 V78 C110 66 88 58 88 48 V34 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Front label */}
      <rect
        x="58"
        y="82"
        width="44"
        height="46"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Label lines */}
      <line x1="66" y1="92" x2="94" y2="92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="66" y1="100" x2="90" y2="100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="66" y1="108" x2="84" y2="108" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="66" y1="116" x2="92" y2="116" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
