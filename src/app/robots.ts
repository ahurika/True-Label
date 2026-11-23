import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Dynamic robots.txt Generator (Next.js App Router)
 * Allows indexing of public educational content.
 * Strictly disallows indexing of private scan flows, OCR results, and user history.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/how-it-works',
          '/about',
          '/reference',
          '/help',
          '/privacy',
          '/terms',
          '/offline',
          '/unavailable',
        ],
        disallow: [
          '/scan/',
          '/scan',
          '/review/',
          '/review',
          '/result/',
          '/result',
          '/report/',
          '/report',
          '/shares/',
          '/shares',
          '/history/',
          '/history',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
