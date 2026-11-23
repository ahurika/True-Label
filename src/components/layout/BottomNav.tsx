'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAVIGATION, isNavigationActive } from '@/config/navigation';
import { HomeIcon, ScanIcon, LedgerIcon, HelpIcon } from '../icons';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <HomeIcon size={24} />;
      case 'scan':
        return <ScanIcon size={28} />;
      case 'evidence':
      case 'history':
        return <LedgerIcon size={22} />;
      case 'info':
      case 'help':
      default:
        return <HelpIcon size={24} />;
    }
  };

  const mobileItems = MAIN_NAVIGATION.filter((item) => item.visibility !== 'desktop-only');

  return (
    <nav className="tl-bottom-nav" aria-label="Primary mobile navigation">
      {mobileItems.map((item) => {
        const isActive = isNavigationActive(pathname, item);
        const label = item.shortLabel || item.label;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`tl-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {renderIcon(item.iconName)}
            <span style={{ fontWeight: item.id === 'nav-scan' ? 600 : undefined }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
