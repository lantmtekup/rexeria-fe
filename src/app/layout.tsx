import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';
// import Script from 'next/script';

import Providers from './providers';
import { Toaster } from '@/components/atoms/sonner';
import { SEO_CONSTANTS } from '@/lib/metadata';
import {
  convertLang,
  getValueSettled,
} from '@/helpers/transformation/objectTransforms';
import { seoConfigService } from '@/server/services/seoConfig.service';
import type { LocalizedText } from '@/types/common';

import '../styles/globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const [configResult, localeResult] = await Promise.allSettled([
    seoConfigService.getSeoConfig(),
    getLocale(),
  ]);

  const config = getValueSettled(configResult);
  const locale = getValueSettled(localeResult) ?? 'vi';
  const lang = locale as keyof LocalizedText;
  const localized = config ? convertLang(config, lang) : null;

  const title = localized?.title || SEO_CONSTANTS.SITE_NAME;
  const description = localized?.description || SEO_CONSTANTS.SITE_DESCRIPTION;
  const keywords = config?.keywords || '';
  const ogImage = config?.ogImageUrl || SEO_CONSTANTS.DEFAULT_OG_IMAGE;

  return {
    title: {
      default: title,
      template: `%s | ${SEO_CONSTANTS.SITE_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: SEO_CONSTANTS.ORGANIZATION.name }],
    creator: SEO_CONSTANTS.ORGANIZATION.name,
    publisher: SEO_CONSTANTS.ORGANIZATION.name,
    alternates: {
      canonical: SEO_CONSTANTS.SITE_URL,
    },
    icons: {
      icon: '/brand/rexer-wordmark.svg',
      shortcut: '/brand/rexer-wordmark.svg',
      apple: '/brand/rexer-wordmark.svg',
    },
    openGraph: {
      type: 'website',
      locale: SEO_CONSTANTS.DEFAULT_LOCALE,
      url: SEO_CONSTANTS.SITE_URL,
      siteName: SEO_CONSTANTS.SITE_NAME,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: SEO_CONSTANTS.OG_IMAGE_WIDTH,
          height: SEO_CONSTANTS.OG_IMAGE_HEIGHT,
          alt: SEO_CONSTANTS.DEFAULT_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timezone = await getTimeZone();

  // const organizationSchema = generateOrganizationSchema();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* <head>
        <Script
          id='organization-schema'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: serializeSchema(organizationSchema),
          }}
        />
      </head> */}
      <body className={`${inter.variable} bg-background antialiased`}>
        <Providers locale={locale} messages={messages} timezone={timezone}>
          {children}
          <Toaster position='top-right' />
        </Providers>
      </body>
    </html>
  );
}
