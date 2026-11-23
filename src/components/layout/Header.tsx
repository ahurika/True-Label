'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ThemeToggle } from './ThemeToggle';

export interface HeaderProps {
  title?: string;
  backHref?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  brandOnly?: boolean;
}

/**
 * Top Application Header
 * Minimal, balanced, and visually quiet across all viewports.
 * Contains ONLY:
 * - TrueLabel logo (linking to '/')
 * - Light/dark theme toggle
 * (With optional back chevron on subpages).
 */
export const Header: React.FC<HeaderProps> = ({
  backHref,
  onBack,
  rightAction,
}) => {
  return (
    <header className="tl-header">
      <div className="tl-header-left">
        {backHref ? (
          <Link href={backHref} className="tl-header-back" aria-label="Go back">
            <ChevronLeftIcon size={24} />
          </Link>
        ) : onBack ? (
          <button type="button" onClick={onBack} className="tl-header-back" aria-label="Go back">
            <ChevronLeftIcon size={24} />
          </button>
        ) : null}

        <Link href="/" className="tl-header-logo" aria-label="TrueLabel home">
          <span className="tl-logo-text">TrueLabel</span>
        </Link>
      </div>

      <div className="tl-header-spacer" />

      <div className="tl-header-right">
        {rightAction || <ThemeToggle />}
      </div>
    </header>
  );
};
