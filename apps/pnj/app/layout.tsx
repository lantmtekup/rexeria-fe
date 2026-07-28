import type { Metadata } from 'next';
import './globals.css';
import SmoothScrollProvider from './components/SmoothScrollProvider';

const TITLE = 'PNJ';
const DESCRIPTION = 'PNJ';

export const metadata: Metadata = {
  metadataBase: new URL('https://mintcoin.rexerstudio.com'),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: '/logo-pnj-favicon.png',
    shortcut: '/logo-pnj-favicon.png',
    apple: '/logo-pnj-favicon.png',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://mintcoin.rexerstudio.com',
    siteName: 'Royal Canadian Mint',
    images: [{ url: '/logo-pnj-favicon.png', width: 78, height: 78 }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/logo-pnj-favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='lenis' suppressHydrationWarning>
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
            React mounts the <img>. */}
        <link
          rel='preload'
          as='image'
          href='/bg-hero.png'
          fetchPriority='high'
        />
        {/* Key canvas frames preloaded via media-gated preloads so each
            viewport only fetches its frame set (desktop 76, mobile 32). */}
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='/frames/frame-001.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='/frames/frame-019.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='/frames/frame-038.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='/frames/frame-057.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(min-width: 768px)'
          href='/frames/frame-076.webp'
        />
        {/* Mobile gets the 32-frame set (480×270). Preload key frames so
            the sticky scrub has decoded data ready. */}
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='/frames-mobile/frame-001.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='/frames-mobile/frame-016.webp'
        />
        <link
          rel='preload'
          as='image'
          media='(max-width: 767px)'
          href='/frames-mobile/frame-032.webp'
        />
      </head>
      <body className='antialiased' suppressHydrationWarning>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
