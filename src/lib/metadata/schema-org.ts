// /**
//  * Schema.org JSON-LD Generators
//  * Generate structured data for better SEO
//  */

// import { SEO_CONSTANTS, getCanonicalUrl } from './constants';
// import type {
//   SchemaOrgProduct,
//   SchemaOrgArticle,
//   SchemaOrgBreadcrumb,
//   SchemaOrgOrganization,
//   SchemaOrgAggregateRating,
// } from '@/types/metadata';
// import type { Rating } from '@/types/car';

// /**
//  * Generate Organization schema
//  */
// export const generateOrganizationSchema = (
//   overrides?: Partial<SchemaOrgOrganization>
// ): SchemaOrgOrganization => {
//   return {
//     '@type': 'Organization',
//     name: SEO_CONSTANTS.ORGANIZATION.name,
//     url: SEO_CONSTANTS.ORGANIZATION.url,
//     logo: SEO_CONSTANTS.ORGANIZATION.logo,
//     description: SEO_CONSTANTS.ORGANIZATION.description,
//     ...overrides,
//   };
// };

// /**
//  * Generate Breadcrumb schema
//  */
// export const generateBreadcrumbSchema = (
//   items: Array<{ name: string; url: string }>
// ): SchemaOrgBreadcrumb => {
//   return {
//     '@type': 'BreadcrumbList',
//     itemListElement: items.map((item, index) => ({
//       '@type': 'ListItem',
//       position: index + 1,
//       name: item.name,
//       item: getCanonicalUrl(item.url),
//     })),
//   };
// };

// /**
//  * Generate AggregateRating schema from rating data
//  */
// export const generateAggregateRatingSchema = (
//   rating?: Rating
// ): SchemaOrgAggregateRating | undefined => {
//   if (
//     !rating ||
//     !rating.average ||
//     !rating.totalCount ||
//     rating.totalCount === 0
//   ) {
//     return undefined;
//   }

//   return {
//     '@type': 'AggregateRating',
//     ratingValue: Number(rating?.average?.toFixed(1)),
//     reviewCount: rating?.totalCount,
//     bestRating: 5,
//     worstRating: 1,
//   };
// };

// /**
//  * Generate Product schema (for Tour, Car)
//  */
// export const generateProductSchema = (params: {
//   name: string;
//   description: string;
//   image?: string | string[];
//   url?: string;
//   brandName?: string;
//   rating?: Rating;
// }): SchemaOrgProduct => {
//   const aggregateRating = generateAggregateRatingSchema(params.rating);

//   return {
//     '@type': 'Product',
//     name: params.name,
//     description: params.description,
//     image: params.image,
//     url: params.url ? getCanonicalUrl(params.url) : undefined,
//     brand: {
//       '@type': 'Brand',
//       name: params.brandName || SEO_CONSTANTS.ORGANIZATION.name,
//     },
//     ...(aggregateRating && { aggregateRating }),
//   };
// };

// /**
//  * Generate Article schema (for News, Blog)
//  */
// export const generateArticleSchema = (params: {
//   headline: string;
//   description: string;
//   image?: string | string[];
//   url?: string;
//   datePublished?: string;
//   dateModified?: string;
//   authorName?: string;
// }): SchemaOrgArticle => {
//   const base: SchemaOrgArticle = {
//     '@type': 'Article',
//     headline: params.headline,
//     description: params.description,
//   };

//   if (params.image) {
//     base.image = params.image;
//   }

//   if (params.url) {
//     // Note: Article schema uses 'url' in a different structure
//   }

//   if (params.datePublished) {
//     base.datePublished = params.datePublished;
//   }

//   if (params.dateModified) {
//     base.dateModified = params.dateModified;
//   }

//   if (params.authorName) {
//     base.author = {
//       '@type': 'Person',
//       name: params.authorName,
//     };
//   }

//   return base;
// };

// /**
//  * Convert schema to JSON-LD script tag content
//  */
// export const serializeSchema = (schema: object): string => {
//   return JSON.stringify(schema, null, 2);
// };

// /**
//  * Generate multiple schemas for a page
//  */
// export const generateMultipleSchemas = (schemas: Array<object>): string => {
//   return schemas.map(serializeSchema).join('\n\n');
// };
