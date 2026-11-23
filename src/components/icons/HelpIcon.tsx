import React from 'react';
import type { SVGProps } from 'react';

interface HelpIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function HelpIcon({ size = 24, className, ...props }: HelpIconProps) {
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
      {/* Circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Question mark arc */}
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      {/* Dot */}
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
