import React from 'react';
import type { SVGProps } from 'react';

interface ChevronLeftIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function ChevronLeftIcon({ size = 24, className, ...props }: ChevronLeftIconProps) {
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
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}
