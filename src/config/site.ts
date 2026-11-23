/**
 * TrueLabel Site & SEO Configuration
 * Central source of truth for canonical metadata, OpenGraph,
 * Twitter cards, and structured data schemas.
 */

export const siteConfig = {
  name: 'TrueLabel',
  shortName: 'TrueLabel',
  tagline: 'Before you buy, read the label.',
  pidginTagline: 'Check am before you buy am.',
  description:
    'Mobile-first packaging evidence verification tool for Nigerian consumers. Compare printed pack details against official NAFDAC records and public alerts.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://truelabel.ng',
  ogImage: '/images/og-truelabel.png',
  locale: 'en_NG',
  alternateLocales: ['pcm_NG'],
  category: 'Consumer Protection / Packaging Verification',
  creator: 'TrueLabel Nigeria',
  keywords: [
    'NAFDAC registration check',
    'Nigeria product packaging verification',
    'NAFDAC public alerts',
    'counterfeit packaging warning signs',
    'Nigerian consumer protection',
    'read product label before buying',
  ],
  publisher: 'TrueLabel',
  indexableRoutes: ['/', '/help', '/unavailable', '/offline'],
  privateRoutes: ['/scan', '/review', '/result', '/history', '/api'],
} as const;

export type SiteConfig = typeof siteConfig;
