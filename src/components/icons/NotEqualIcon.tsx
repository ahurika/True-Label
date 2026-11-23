import React from 'react';
import type { SVGProps } from 'react';

interface NotEqualIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function NotEqualIcon({ size = 24, className, ...props }: NotEqualIconProps) {
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
      {/* Equal sign — two parallel horizontal lines */}
      <path d="M5 9h14" />
      <path d="M5 15h14" />
      {/* Diagonal slash */}
      <path d="M17 5 7 19" />
    </svg>
  );
}
