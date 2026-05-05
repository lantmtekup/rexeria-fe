/**
 * SEO Constants and Default Values
 */

export const SEO_CONSTANTS = {
  // Site information
  SITE_NAME: '',
  SITE_DESCRIPTION: '',
  DEFAULT_LOCALE: 'vi_VN',

  // Title & Description lengths (SEO best practices)
  TITLE_MAX_LENGTH: 60,
  TITLE_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 160,
  DESCRIPTION_MIN_LENGTH: 10,

  // OG Image dimensions
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
  TWITTER_IMAGE_WIDTH: 1200,
  TWITTER_IMAGE_HEIGHT: 600,

  // Default images
  DEFAULT_OG_IMAGE: '/brand/rexer-wordmark.svg',
  DEFAULT_IMAGE_ALT: '',

  // Site URLs (from environment variables)
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',

  // Organization info for Schema.org
  ORGANIZATION: {
    name: '',
    url: '',
    logo: '/brand/rexer-wordmark.svg',
    description: '',
  },

  // Social media
  TWITTER_HANDLE: '',
  FACEBOOK_HANDLE: '',

  // Keywords
  DEFAULT_KEYWORDS: [],
} as const;

/**
 * Helper to get full canonical URL
 */
export const getCanonicalUrl = (path: string = ''): string => {
  const baseUrl = SEO_CONSTANTS.SITE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Helper to truncate text to max length
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};
