import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Tomato paste tin / can
 * Cylindrical food can with top/bottom rims and label panel.
 */
export function TomatoPasteTinIllustration({
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
      {/* Top rim lid ellipse */}
      <ellipse
        cx="80"
        y="36"
        rx="42"
        ry="14"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />
      {/* Pull tab ring */}
      <circle cx="80" cy="36" r="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="80" y1="42" x2="80" y2="46" stroke="currentColor" strokeWidth="1.5" />

      {/* Can body */}
      <path
        d="M38 36 V118 C38 126 57 132 80 132 C103 132 122 126 122 118 V36"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* Bottom rim curve */}
      <path
        d="M38 118 C38 126 57 132 80 132 C103 132 122 126 122 118"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Wrap-around label panel */}
      <path
        d="M38 56 C56 62 104 62 122 56 V102 C104 108 56 108 38 102 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
      />

      {/* Schematic label text lines */}
      <line x1="56" y1="74" x2="104" y2="74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="82" x2="98" y2="82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="90" x2="92" y2="90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
