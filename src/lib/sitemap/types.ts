/**
 * Sitemap Types
 * TypeScript types for sitemap generation
 */

import type { MetadataRoute } from 'next';

export type SitemapEntry = MetadataRoute.Sitemap[number];

export interface SitemapConfig {
  priority: number;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
}

export interface RouteConfig extends SitemapConfig {
  basePath: string;
}

/**
 * Generator function type
 */
export type SitemapGenerator = (
  baseUrl: string
) => Promise<MetadataRoute.Sitemap>;

/**
 * Supported languages configuration
 */
export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

/**
 * Helper to create language alternates for URL paths
 * Supports both simple paths and paths with dynamic params
 */
export const createLanguageAlternates = (
  baseUrl: string,
  viPath: string,
  enPath: string
): Record<SupportedLanguage, string> => {
  const cleanViPath = viPath.startsWith('/') ? viPath : `/${viPath}`;
  const cleanEnPath = enPath.startsWith('/') ? enPath : `/${enPath}`;

  return {
    vi: `${baseUrl}${cleanViPath}`,
    en: `${baseUrl}${cleanEnPath}`,
  };
};

/**
 * Helper to replace dynamic params in path
 * Example: '/tour/[slug]' + {slug: 'ha-long'} → '/tour/ha-long'
 */
export const replaceDynamicParams = (
  path: string,
  params: Record<string, string>
): string => {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`[${key}]`, value);
  }
  return result;
};
