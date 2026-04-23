/**
 * Robots.txt generation
 * Controls which pages search engines should crawl
 */

import type { MetadataRoute } from 'next';

import { SEO_CONSTANTS } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/tai-khoan/', '/_next/', '/admin/'],
      },
      // Allow specific bots to crawl everything
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/tai-khoan/', '/admin/'],
      },
    ],
    sitemap: `${SEO_CONSTANTS.SITE_URL}/sitemap.xml`,
  };
}
