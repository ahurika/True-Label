import React from 'react';
import type { SVGProps } from 'react';

interface FlagIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function FlagIcon({ size = 24, className, ...props }: FlagIconProps) {
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
      {/* Flagpole */}
      <path d="M5 3v18" />
      {/* Flag body */}
      <path d="M5 3h12l-3 4 3 4H5" />
    </svg>
  );
}
