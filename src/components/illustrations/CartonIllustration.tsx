import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Carton / Box
 * Commercial packaging box with isometric perspective and printed label area.
 */
export function CartonIllustration({
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
      {/* Top flap plane (isometric) */}
      <path
        d="M50 40 L88 22 L124 38 L86 56 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Left side panel */}
      <path
        d="M50 40 L86 56 V134 L50 116 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Right side panel */}
      <path
        d="M86 56 L124 38 V114 L86 134 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--color-surface-sunken, #EAEEF4)"
      />

      {/* Front/Left label panel */}
      <path
        d="M56 64 L80 74 V116 L56 104 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      {/* Front label lines */}
      <line x1="62" y1="78" x2="74" y2="83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="88" x2="74" y2="93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="98" x2="72" y2="102" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right barcode / code mark area */}
      <rect
        x="94"
        y="72"
        width="22"
        height="14"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <line x1="97" y1="76" x2="97" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="100" y1="76" x2="100" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="104" y1="76" x2="104" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="108" y1="76" x2="108" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="112" y1="76" x2="112" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
