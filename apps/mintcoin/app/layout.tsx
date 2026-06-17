import type { Metadata } from 'next';
import './globals.css';
import SmoothScrollProvider from './components/SmoothScrollProvider';

const TITLE =
  'The Jack Pine by Tom Thomson | 1 Kilo Pure Gold Coin (2026) | Royal Canadian Mint';
const DESCRIPTION =
  "A 1006.1g, 99.99% pure gold proof coin from the Royal Canadian Mint, engraving Tom Thomson's iconic 1916–17 painting. Mintage: 75.";

export const metadata: Metadata = {
  metadataBase: new URL('https://mintcoin.rexerstudio.com'),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: '/mint-icon.png',
    shortcut: '/mint-icon.png',
    apple: '/mint-icon.png',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://mintcoin.rexerstudio.com',
    siteName: 'Royal Canadian Mint',
    images: [{ url: '/mint-icon.png', width: 78, height: 78 }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/mint-icon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='lenis'>
      <head>
        {/* TLS warm-up: opens the connection to CloudFront before any
            <img> request fires. Shaves ~150-300ms off first asset load. */}
        <link
          rel='preconnect'
          href='https://d10zufojjcedud.cloudfront.net'
          crossOrigin=''
        />
        <link rel='dns-prefetch' href='https://d10zufojjcedud.cloudfront.net' />
        {/* Hero LCP — preload kicks off fetch during HTML parse, before
            React mounts the <img>. 78KB WebP arrives basically instantly. */}
        <link
          rel='preload'
          as='image'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/hero-coin.webp'
          fetchPriority='high'
        />
        {/* Key canvas frames preloaded via media-gated preloads so each
            viewport only fetches its frame set (desktop 96, mobile 32). */}
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-001.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-024.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-048.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-072.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-096.webp'
        />
        {/* Mobile gets the 32-frame set (480×270, ~256KB total). Preload
            key frames so the sticky scrub has decoded data ready. */}
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames-mobile/frame-001.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames-mobile/frame-016.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames-mobile/frame-032.webp'
        />
      </head>
      <body className='antialiased'>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
