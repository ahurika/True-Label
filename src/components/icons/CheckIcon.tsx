import React from 'react';
import type { SVGProps } from 'react';

interface CheckIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function CheckIcon({ size = 16, className, ...props }: CheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
