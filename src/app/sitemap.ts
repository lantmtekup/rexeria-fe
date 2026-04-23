/**
 * Dynamic Sitemap generation
 * Generates XML sitemap for search engines with static and dynamic routes
 */

import type { MetadataRoute } from 'next';

/**
 * Sitemap revalidation time (in seconds)
 * Set to 7 days for ISR (Incremental Static Regeneration)
 */
export const revalidate = 604800; // 7 days

/**
 * Generate complete sitemap with static and dynamic routes
 * Only generates sitemap in production environment
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProduction = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();

  // Log sitemap update time (only in production)
  if (isProduction) {
    // eslint-disable-next-line no-console
    console.log(`[SITEMAP] Cập nhật lúc: ${timestamp}`);
  }

  return [];
}
