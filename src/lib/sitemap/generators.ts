// /**
//  * Sitemap Generators
//  * Helper functions to generate sitemap entries for different route types
//  */

// import type { MetadataRoute } from 'next';
// import {
//   getAllTours,
//   getTourType,
//   getAllTourCategories,
// } from '@/services/logics/tour';
// import { getNewsList, getCategoryNews } from '@/services/logics/news';
// import { getListCar, getCarCategories } from '@/services/logics/car';
// import { getRecruitments } from '@/services/logics/recruitment';
// import { ROUTER } from '@/settings/constants/router';
// import { createLanguageAlternates, replaceDynamicParams } from './types';

// /**
//  * Generate sitemap entries for tours
//  */
// export async function generateTourSitemapEntries(
//   baseUrl: string
// ): Promise<MetadataRoute.Sitemap> {
//   try {
//     const toursData = await getAllTours({
//       limit: 999,
//       page: 1,
//     });

//     if (!toursData?.data || !Array.isArray(toursData.data)) {
//       return [];
//     }

//     const entries = toursData.data
//       .filter(tour => tour.slug)
//       .map(tour => {
//         const viPath = replaceDynamicParams(ROUTER.TOUR_DETAIL.vi, {
//           slug: tour.slug?.vi,
//         });
//         const enPath = replaceDynamicParams(ROUTER.TOUR_DETAIL.en, {
//           slug: tour.slug?.en,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
//           changeFrequency: 'weekly' as const,
//           priority: 0.8,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     return entries;
//   } catch {
//     return [];
//   }
// }

// /**
//  * Generate sitemap entries for news articles
//  */
// export async function generateNewsSitemapEntries(
//   baseUrl: string
// ): Promise<MetadataRoute.Sitemap> {
//   try {
//     // Fetch news and categories
//     const [newsData, categoriesResponse] = await Promise.all([
//       getNewsList({
//         limit: 999,
//         page: 1,
//       }),
//       getCategoryNews({}, 'vi'),
//     ]);

//     if (!newsData?.success || !categoriesResponse?.success) {
//       return [];
//     }

//     if (
//       !newsData.data?.data ||
//       !Array.isArray(newsData.data.data) ||
//       !Array.isArray(categoriesResponse.data)
//     ) {
//       return [];
//     }

//     // Create a map of category id to slug
//     const categoryMap = new Map(
//       categoriesResponse.data
//         .filter(cat => cat.id && cat.slug)
//         .map(cat => [cat.id, cat.slug])
//     );

//     // Generate entries for news articles with category slugs
//     const newsEntries: MetadataRoute.Sitemap = newsData.data.data
//       .filter(news => news.slug)
//       .map(news => {
//         // Get the first category slug if available
//         const firstCategory = news.categories?.[0];
//         const categoryId = firstCategory
//           ? typeof firstCategory === 'string'
//             ? firstCategory
//             : firstCategory.id
//           : null;
//         const categorySlug = categoryId ? categoryMap.get(categoryId) : null;

//         if (categorySlug) {
//           const viPath = replaceDynamicParams(ROUTER.NEWS_DETAIL.vi, {
//             categorySlug,
//             slug: news?.slug?.vi,
//           });
//           const enPath = replaceDynamicParams(ROUTER.NEWS_DETAIL.en, {
//             categorySlug,
//             slug: news.slug?.en,
//           });

//           return {
//             url: `${baseUrl}${viPath}`,
//             lastModified: news.publishedAt
//               ? new Date(news.publishedAt)
//               : new Date(),
//             changeFrequency: 'daily' as const,
//             priority: 0.8,
//             alternates: {
//               languages: createLanguageAlternates(baseUrl, viPath, enPath),
//             },
//           };
//         }
//         return null;
//       })
//       .filter(Boolean) as MetadataRoute.Sitemap;

//     // Generate entries for news category pages
//     const categoryEntries: MetadataRoute.Sitemap = categoriesResponse.data
//       .filter(category => category.slug)
//       .map(category => {
//         const viPath = replaceDynamicParams(ROUTER.NEWS_BY_CATEGORY.vi, {
//           categorySlug: category.slug,
//         });
//         const enPath = replaceDynamicParams(ROUTER.NEWS_BY_CATEGORY.en, {
//           categorySlug: category.slug,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: new Date(),
//           changeFrequency: 'daily' as const,
//           priority: 0.7,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     return [...newsEntries, ...categoryEntries];
//   } catch {
//     return [];
//   }
// }

// /**
//  * Generate sitemap entries for cars
//  */
// export async function generateCarSitemapEntries(
//   baseUrl: string
// ): Promise<MetadataRoute.Sitemap> {
//   try {
//     // Fetch cars and categories
//     const [carsResponse, categoriesResponse] = await Promise.all([
//       getListCar({
//         limit: 999,
//         page: 1,
//       }),
//       getCarCategories({ limit: 50 }, 'vi'),
//     ]);

//     if (!carsResponse || !categoriesResponse?.success) {
//       return [];
//     }

//     const carsData =
//       carsResponse &&
//       typeof carsResponse === 'object' &&
//       'data' in carsResponse &&
//       Array.isArray(carsResponse.data)
//         ? carsResponse.data
//         : [];

//     if (!Array.isArray(categoriesResponse.data)) {
//       return [];
//     }

//     // Create a map of category id to slug
//     const categoryMap = new Map(
//       categoriesResponse.data
//         .filter(cat => cat.id && cat.slug)
//         .map(cat => [cat.id, cat.slug])
//     );

//     // Generate entries for car detail pages
//     const carEntries: MetadataRoute.Sitemap = carsData
//       .filter(car => car.slug)
//       .map(car => {
//         // Get the category slug
//         const categoryId =
//           typeof car.category === 'string' ? car.category : car.category?._id;
//         const categorySlug = categoryId ? categoryMap.get(categoryId) : null;

//         if (categorySlug && car.slug) {
//           const viPath = replaceDynamicParams(ROUTER.CAR_DETAIL.vi, {
//             categorySlug,
//             slug: car.slug,
//           });
//           const enPath = replaceDynamicParams(ROUTER.CAR_DETAIL.en, {
//             categorySlug,
//             slug: car.slug,
//           });

//           return {
//             url: `${baseUrl}${viPath}`,
//             lastModified: car.updatedAt ? new Date(car.updatedAt) : new Date(),
//             changeFrequency: 'weekly' as const,
//             priority: 0.8,
//             alternates: {
//               languages: createLanguageAlternates(baseUrl, viPath, enPath),
//             },
//           };
//         }
//         return null;
//       })
//       .filter(Boolean) as MetadataRoute.Sitemap;

//     // Generate entries for car category pages
//     const categoryEntries: MetadataRoute.Sitemap = categoriesResponse.data
//       .filter(category => category.slug)
//       .map(category => {
//         const viPath = replaceDynamicParams(ROUTER.CAR_CATEGORY_DETAIL.vi, {
//           categorySlug: category.slug,
//         });
//         const enPath = replaceDynamicParams(ROUTER.CAR_CATEGORY_DETAIL.en, {
//           categorySlug: category.slug,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: new Date(),
//           changeFrequency: 'weekly' as const,
//           priority: 0.7,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     return [...carEntries, ...categoryEntries];
//   } catch {
//     return [];
//   }
// }

// /**
//  * Generate sitemap entries for recruitment posts
//  */
// export async function generateRecruitmentSitemapEntries(
//   baseUrl: string
// ): Promise<MetadataRoute.Sitemap> {
//   try {
//     const recruitmentsResponse = await getRecruitments({
//       queryString: {
//         limit: 999,
//         page: 1,
//       },
//       lang: 'vi',
//     });

//     if (!recruitmentsResponse?.success) {
//       return [];
//     }

//     if (
//       !recruitmentsResponse.data?.data ||
//       !Array.isArray(recruitmentsResponse.data.data)
//     ) {
//       return [];
//     }

//     const entries = recruitmentsResponse.data.data
//       .filter(recruitment => recruitment.slug)
//       .map(recruitment => {
//         const viPath = replaceDynamicParams(ROUTER.CAREERS_DETAILS.vi, {
//           slug: recruitment.slug,
//         });
//         const enPath = replaceDynamicParams(ROUTER.CAREERS_DETAILS.en, {
//           slug: recruitment.slug,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: recruitment.updatedAt
//             ? new Date(recruitment.updatedAt)
//             : new Date(),
//           changeFrequency: 'weekly' as const,
//           priority: 0.7,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     return entries;
//   } catch {
//     return [];
//   }
// }

// /**
//  * Generate sitemap entries for tour categories and types
//  */
// export async function generateCategorySitemapEntries(
//   baseUrl: string
// ): Promise<MetadataRoute.Sitemap> {
//   try {
//     // Fetch tour categories and tour types
//     const [categoriesData, typesData] = await Promise.all([
//       getAllTourCategories({
//         limit: 999,
//         page: 1,
//       }),
//       getTourType({
//         limit: 999,
//         page: 1,
//       }),
//     ]);

//     if (!categoriesData?.data || !typesData?.data) {
//       return [];
//     }

//     if (!Array.isArray(categoriesData.data) || !Array.isArray(typesData.data)) {
//       return [];
//     }

//     // Generate entries for tour category pages
//     const categoryEntries: MetadataRoute.Sitemap = categoriesData.data
//       .filter(category => category?.slug)
//       .map(category => {
//         const viPath = replaceDynamicParams(ROUTER.TOUR_CATEGORY_DETAIL.vi, {
//           slug: category?.slug?.vi,
//         });
//         const enPath = replaceDynamicParams(ROUTER.TOUR_CATEGORY_DETAIL.en, {
//           slug: category?.slug?.en,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: new Date(),
//           changeFrequency: 'monthly' as const,
//           priority: 0.7,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     // Generate entries for tour type pages
//     const typeEntries: MetadataRoute.Sitemap = typesData.data
//       .filter(type => type.slug)
//       .map(type => {
//         const viPath = replaceDynamicParams(ROUTER.TOUR_TYPE.vi, {
//           slug: type.slug?.vi,
//         });
//         const enPath = replaceDynamicParams(ROUTER.TOUR_TYPE.en, {
//           slug: type.slug?.en,
//         });

//         return {
//           url: `${baseUrl}${viPath}`,
//           lastModified: new Date(),
//           changeFrequency: 'monthly' as const,
//           priority: 0.7,
//           alternates: {
//             languages: createLanguageAlternates(baseUrl, viPath, enPath),
//           },
//         };
//       });

//     return [...categoryEntries, ...typeEntries];
//   } catch {
//     return [];
//   }
// }
