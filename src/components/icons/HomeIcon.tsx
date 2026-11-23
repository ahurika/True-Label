import React from 'react';
import type { SVGProps } from 'react';

interface HomeIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function HomeIcon({ size = 24, className, ...props }: HomeIconProps) {
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
      {/* Roof */}
      <path d="M3 12 12 3l9 9" />
      {/* House body */}
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      {/* Door */}
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}
