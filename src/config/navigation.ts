/**
 * TrueLabel Central Navigation Configuration (PRD v4.0 §4)
 * Authoritative single source of truth for application routes,
 * dynamic active-state matching, and responsive visibility.
 */

export interface NavigationItem {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  iconName: 'home' | 'scan' | 'history' | 'help' | 'evidence' | 'info';
  matchStrategy: 'exact' | 'prefix';
  visibility: 'all' | 'mobile-only' | 'desktop-only';
  description?: string;
  badge?: string;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'nav-home',
    label: 'Home',
    href: '/',
    iconName: 'home',
    matchStrategy: 'exact',
    visibility: 'all',
    description: 'Start a check or explore TrueLabel',
  },
  {
    id: 'nav-scan',
    label: 'Scan a product',
    shortLabel: 'Scan',
    href: '/scan',
    iconName: 'scan',
    matchStrategy: 'prefix',
    visibility: 'all',
    description: 'Photograph packaging or enter printed details',
  },
  {
    id: 'nav-how-it-works',
    label: 'How it works',
    shortLabel: 'How it works',
    href: '/how-it-works',
    iconName: 'evidence',
    matchStrategy: 'prefix',
    visibility: 'all',
    description: 'Packaging reading workflow, 4 verdicts and boundaries',
  },
  {
    id: 'nav-reference',
    label: 'Product checks',
    shortLabel: 'Reference',
    href: '/reference',
    iconName: 'history',
    matchStrategy: 'prefix',
    visibility: 'desktop-only',
    description: 'Inspect verified reference cards and category checklists',
  },
  {
    id: 'nav-about',
    label: 'About TrueLabel',
    shortLabel: 'About',
    href: '/about',
    iconName: 'info',
    matchStrategy: 'prefix',
    visibility: 'desktop-only',
    description: 'Our mission, independence safeguards and principles',
  },
  {
    id: 'nav-help',
    label: 'Help & Safety',
    shortLabel: 'Help',
    href: '/help',
    iconName: 'help',
    matchStrategy: 'prefix',
    visibility: 'all',
    description: 'Packaging photo guidance, FAQs and NAFDAC channels',
  },
];

/**
 * Evaluates whether a given navigation item is active for the current pathname.
 */
export function isNavigationActive(pathname: string, item: NavigationItem): boolean {
  if (item.matchStrategy === 'exact') {
    return pathname === item.href;
  }
  // Prefix matching: '/scan' matches '/scan', '/scan/capture', '/scan/reading'
  // Also handle review and result flows under scan journey
  if (item.href === '/scan') {
    return (
      pathname.startsWith('/scan') ||
      pathname.startsWith('/review') ||
      pathname.startsWith('/result')
    );
  }
  return pathname.startsWith(item.href);
}
