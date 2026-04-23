/**
 * Web App Manifest
 * Defines how the app appears and behaves when installed
 */

import type { MetadataRoute } from 'next';

import { SEO_CONSTANTS } from '@/lib/metadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO_CONSTANTS.SITE_NAME,
    short_name: SEO_CONSTANTS.SITE_NAME,
    description: SEO_CONSTANTS.SITE_DESCRIPTION,
    start_url: SEO_CONSTANTS.SITE_URL,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
