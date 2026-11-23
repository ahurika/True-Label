import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Instant noodle pack
 * Horizontal crinkle-cut flow-wrap pouch with side seals and brand banner.
 */
export function NoodlePackIllustration({
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
      {/* Left serrated seal */}
      <path
        d="M26 44 L32 48 L26 54 L32 60 L26 66 L32 72 L26 78 L32 84 L26 90 L32 96 L26 102 L32 108 L26 114 L34 114 V44 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Right serrated seal */}
      <path
        d="M134 44 L128 48 L134 54 L128 60 L134 66 L128 72 L134 78 L128 84 L134 90 L128 96 L134 102 L128 108 L134 114 L126 114 V44 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Main pouch body */}
      <rect
        x="34"
        y="42"
        width="92"
        height="74"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Pouch pillow crease lines */}
      <path d="M38 48 C60 54 100 54 122 48" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M38 110 C60 104 100 104 122 110" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Center printed label / graphic area */}
      <rect
        x="48"
        y="56"
        width="64"
        height="46"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      {/* Label lines */}
      <line x1="56" y1="68" x2="104" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="78" x2="96" y2="78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="88" x2="88" y2="88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
