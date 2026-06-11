/**
 * Sitemap cho search engines. Hiện liệt kê các trang LANDING public
 * (rexerstudio.com). Trang app (portal/admin) sau đăng nhập không đưa vào.
 * `/` là canonical của trang chủ (middleware rewrite / → /rexer).
 */

import type { MetadataRoute } from 'next';

import { SEO_CONSTANTS } from '@/lib/metadata';

/** Revalidate 1 ngày. */
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SEO_CONSTANTS.SITE_URL.replace(/\/$/, '');
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/rexer/studio`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/rexer/projects`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/rexer/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/rexer/contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];
}
