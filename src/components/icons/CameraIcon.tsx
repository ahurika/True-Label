import React from 'react';
import type { SVGProps } from 'react';

interface CameraIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function CameraIcon({ size = 24, className, ...props }: CameraIconProps) {
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
      {/* Camera body */}
      <rect x="2" y="7" width="20" height="13" rx="2" />
      {/* Viewfinder notch */}
      <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      {/* Lens */}
      <circle cx="12" cy="14" r="3" />
    </svg>
  );
}
