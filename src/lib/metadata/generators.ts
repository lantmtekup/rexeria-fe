// /**
//  * Metadata Generator Functions
//  * Helper functions to generate SEO metadata for pages
//  */

// import type { Metadata } from 'next';

// import { SEO_CONSTANTS, getCanonicalUrl, truncateText } from './constants';
// import type {
//   BaseMetadataParams,
//   OpenGraphParams,
//   TwitterCardParams,
// } from '@/types/metadata';

// type OpenGraphType = 'website' | 'article';

// /**
//  * Generate complete page metadata
//  */
// export const generatePageMetadata = (params: BaseMetadataParams): Metadata => {
//   const { title, description, keywords, canonical } = params;

//   const metadata: Metadata = {
//     title: truncateText(title, SEO_CONSTANTS.TITLE_MAX_LENGTH),
//     description: truncateText(
//       description,
//       SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH
//     ),
//     keywords: keywords?.join(', ') || SEO_CONSTANTS.DEFAULT_KEYWORDS.join(', '),
//   };

//   if (canonical) {
//     metadata.alternates = {
//       canonical: getCanonicalUrl(canonical),
//     };
//   }

//   return metadata;
// };

// /**
//  * Generate Open Graph metadata
//  */
// export const generateOpenGraph = (
//   params: OpenGraphParams
// ): Metadata['openGraph'] => {
//   const {
//     title,
//     description,
//     image,
//     type = 'website',
//     locale,
//     canonical,
//     imageAlt,
//   } = params;

//   const ogType: OpenGraphType =
//     type === 'product' ? 'website' : (type as OpenGraphType);

//   return {
//     type: ogType,
//     locale: locale || SEO_CONSTANTS.DEFAULT_LOCALE,
//     url: canonical ? getCanonicalUrl(canonical) : SEO_CONSTANTS.SITE_URL,
//     siteName: SEO_CONSTANTS.SITE_NAME,
//     title: title
//       ? truncateText(title, SEO_CONSTANTS.TITLE_MAX_LENGTH)
//       : undefined,
//     description: description
//       ? truncateText(description, SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH)
//       : undefined,
//     images: [
//       {
//         url: image || SEO_CONSTANTS.DEFAULT_OG_IMAGE,
//         width: SEO_CONSTANTS.OG_IMAGE_WIDTH,
//         height: SEO_CONSTANTS.OG_IMAGE_HEIGHT,
//         alt: imageAlt || SEO_CONSTANTS.DEFAULT_IMAGE_ALT,
//       },
//     ],
//   };
// };

// /**
//  * Generate Twitter Card metadata
//  */
// export const generateTwitterCard = (
//   params: TwitterCardParams
// ): Metadata['twitter'] => {
//   const { card = 'summary_large_image', title, description, image } = params;

//   return {
//     card,
//     title: title
//       ? truncateText(title, SEO_CONSTANTS.TITLE_MAX_LENGTH)
//       : undefined,
//     description: description
//       ? truncateText(description, SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH)
//       : undefined,
//     images: image
//       ? [
//           {
//             url: image,
//             width: SEO_CONSTANTS.TWITTER_IMAGE_WIDTH,
//             height: SEO_CONSTANTS.TWITTER_IMAGE_HEIGHT,
//           },
//         ]
//       : undefined,
//   };
// };

// /**
//  * Generate alternate URLs (canonical, languages)
//  */
// export const generateAlternates = (
//   canonical?: string,
//   languages?: Record<string, string>
// ): Metadata['alternates'] => {
//   const alternates: Metadata['alternates'] = {};

//   if (canonical) {
//     alternates.canonical = getCanonicalUrl(canonical);
//   }

//   if (languages && Object.keys(languages).length > 0) {
//     alternates.languages = {};
//     for (const [lang, url] of Object.entries(languages)) {
//       const canonicalUrl = getCanonicalUrl(url);
//       if (alternates.languages) {
//         alternates.languages[lang as keyof typeof alternates.languages] =
//           canonicalUrl as any;
//       }
//     }
//   }

//   return alternates;
// };

// /**
//  * Generate complete metadata with all SEO elements
//  */
// export const generateCompleteMetadata = (params: OpenGraphParams): Metadata => {
//   const {
//     title,
//     description,
//     canonical,
//     image,
//     type = 'website',
//     keywords,
//   } = params;

//   const baseMetadata = generatePageMetadata({
//     title,
//     description,
//     keywords,
//     canonical,
//   });
//   const openGraphMetadata = generateOpenGraph({
//     ...params,
//     type,
//     image,
//   });

//   const twitterMetadata = generateTwitterCard({
//     title,
//     description,
//     image,
//   });

//   return {
//     ...baseMetadata,
//     openGraph: openGraphMetadata,
//     twitter: twitterMetadata,
//     alternates: generateAlternates(canonical),
//   };
// };

// /**
//  * Generate dynamic metadata (for async pages with fetched data)
//  */
// export const generateDynamicMetadata = (params: OpenGraphParams): Metadata => {
//   return generateCompleteMetadata(params);
// };
