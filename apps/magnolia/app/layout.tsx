import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { LocaleProvider } from '@/components/shared/locale-provider';
import { HeroFramesProvider } from '@/components/shared/hero-frames';
import { Preloader } from '@/components/shared/preloader';
import { SkipLink } from '@/components/shared/skip-link';
import { SiteHeader } from '@/components/shared/site-header';
import { PromptBar } from '@/components/journey/prompt-bar';
import { OverlayView } from '@/components/journey/overlay-view';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin', 'latin-ext', 'vietnamese', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese', 'cyrillic', 'greek'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Magnolia — The Journey of Timeless Value — Khai Sơn City, Hà Nội',
  description: siteConfig.description,
  openGraph: { title: siteConfig.name, locale: 'vi_VN', type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='vi'
      className={`${display.variable} ${sans.variable} snap-panels`}
      style={{ ['--snap-strictness' as string]: siteConfig.scrollSnap }}
    >
      <body>
        <noscript>
          <style>{`#preloader{display:none!important}`}</style>
        </noscript>
        <LocaleProvider>
          {/* The hero film's frames are loaded once here: the preloader counts them and the
              hero draws them, and neither may start its own download. */}
          <HeroFramesProvider>
            <SmoothScroll />
            <Preloader />
            <SkipLink />
            <SiteHeader />
            {children}
            {/* Ô hỏi ghim đáy màn và lớp phủ toàn màn nằm ở layout vì cả hai
                phải sống suốt hành trình, không thuộc về một section nào. */}
            <PromptBar />
            <OverlayView />
          </HeroFramesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
