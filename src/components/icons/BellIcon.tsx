import React from 'react';
import type { SVGProps } from 'react';

interface BellIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function BellIcon({ size = 24, className, ...props }: BellIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Bell body */}
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      {/* Clapper */}
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
