import React from 'react';
import type { SVGProps } from 'react';

interface MagnifierQuestionIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function MagnifierQuestionIcon({
  size = 24,
  className,
  ...props
}: MagnifierQuestionIconProps) {
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
      {/* Magnifying glass circle */}
      <circle cx="10" cy="10" r="7" />
      {/* Handle */}
      <path d="M15 15 21 21" />
      {/* Question mark inside */}
      <path d="M8 8a2 2 0 0 1 2-2c1.1 0 2 .9 2 2 0 .7-.4 1.3-1 1.7-.4.3-1 .6-1 1.3" />
      <circle cx="10" cy="13" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
