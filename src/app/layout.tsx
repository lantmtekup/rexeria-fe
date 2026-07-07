import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';
// import Script from 'next/script';

import Providers from './providers';
import { Toaster } from '@/components/atoms/sonner';
import { GOOGLE_FONTS_HREF } from '@/lib/fonts';
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

  // Landing host (EN) → og:locale en_US; app/portal giữ vi_VN.
  const host = (await headers()).get('host') ?? '';
  const isLandingHost =
    host === 'rexerstudio.com' || host === 'www.rexerstudio.com';
  const ogLocale = isLandingHost ? 'en_US' : SEO_CONSTANTS.DEFAULT_LOCALE;

  return {
    // Gốc resolve mọi URL tương đối trong metadata (og:image, canonical…).
    // Thiếu cái này từng làm og:image trỏ http://localhost:3000 trên prod.
    metadataBase: new URL(SEO_CONSTANTS.SITE_URL),
    title: {
      default: title,
      template: `%s | ${SEO_CONSTANTS.SITE_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: SEO_CONSTANTS.ORGANIZATION.name }],
    creator: SEO_CONSTANTS.ORGANIZATION.name,
    publisher: SEO_CONSTANTS.ORGANIZATION.name,
    // KHÔNG đặt canonical global ở đây — canonical = SITE_URL trên mọi trang
    // sẽ khiến tất cả trang con tự nhận là bản sao của trang chủ. Canonical
    // khai báo theo từng page (xem (landing)/rexer/*).
    icons: {
      icon: '/brand/rexer-wordmark.svg',
      shortcut: '/brand/rexer-wordmark.svg',
      apple: '/brand/rexer-wordmark.svg',
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
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

  // Landing (rexerstudio.com) nội dung tiếng Anh → khai báo lang="en" cho đúng
  // SEO/accessibility; portal.* và app giữ theo locale user (mặc định vi).
  const host = (await headers()).get('host') ?? '';
  const isLandingHost =
    host === 'rexerstudio.com' || host === 'www.rexerstudio.com';
  const htmlLang = isLandingHost ? 'en' : locale;

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        {/* Google Fonts — curated free Vietnamese-friendly families. See
            src/lib/fonts.ts for the registry. Inter is loaded separately
            via next/font (above). */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='stylesheet' href={GOOGLE_FONTS_HREF} />
      </head>
      <body
        className={`${inter.variable} bg-background antialiased`}
        suppressHydrationWarning
      >
        <Providers locale={locale} messages={messages} timezone={timezone}>
          {children}
          <Toaster position='top-right' />
        </Providers>
      </body>
    </html>
  );
}
