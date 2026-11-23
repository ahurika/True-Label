import React from 'react';
import { IllustrationProps } from './SachetWaterIllustration';

/**
 * Product schematic: Blister strip
 * Push-through pharmaceutical blister card with 10 individual tablet pockets (2x5 grid).
 */
export function BlisterStripIllustration({
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
      {/* Foil backing card with rounded corners */}
      <rect
        x="36"
        y="24"
        width="88"
        height="112"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-surface, #F4F6FA)"
      />

      {/* 2 columns x 5 rows of blister tablet pockets */}
      {[
        { cx: 58, cy: 40 },
        { cx: 102, cy: 40 },
        { cx: 58, cy: 62 },
        { cx: 102, cy: 62 },
        { cx: 58, cy: 84 },
        { cx: 102, cy: 84 },
        { cx: 58, cy: 106 },
        { cx: 102, cy: 106 },
        { cx: 58, cy: 124 },
        { cx: 102, cy: 124 },
      ].map((pos, idx) => (
        <g key={idx}>
          {/* Outer blister bubble rim */}
          <rect
            x={pos.cx - 12}
            y={pos.cy - 7}
            width="24"
            height="14"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="var(--color-primary-tint, rgba(230, 237, 246, 0.5))"
          />
          {/* Inner pill highlight */}
          <line
            x1={pos.cx - 6}
            y1={pos.cy}
            x2={pos.cx + 6}
            y2={pos.cy}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Central perforation line */}
      <line
        x1="80"
        y1="28"
        x2="80"
        y2="132"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.5"
      />
    </svg>
  );
}
