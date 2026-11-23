import React from 'react';
import type { SVGProps } from 'react';

interface MinusIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function MinusIcon({ size = 24, className, ...props }: MinusIconProps) {
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
      {/* Horizontal dash / minus */}
      <path d="M5 12h14" />
    </svg>
  );
}
