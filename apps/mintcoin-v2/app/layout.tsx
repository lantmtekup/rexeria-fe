import type { Metadata } from 'next';
import './globals.css';
import SmoothScrollProvider from './components/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'The Jack Pine — 1 kilo Pure Gold Coin (Kunai scaffold)',
  description:
    'Kunai template cloned scaffold — content + animation locked, color & typography placeholder for design pass.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='lenis'>
      <head>
        <link
          rel='preconnect'
          href='https://d10zufojjcedud.cloudfront.net'
          crossOrigin=''
        />
        <link rel='dns-prefetch' href='https://d10zufojjcedud.cloudfront.net' />
        {/* Yuji Syuku — Japanese serif for the Manifesto block (Kunai clone) */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin=''
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Yuji+Syuku&display=swap'
          rel='stylesheet'
        />
        <link
          rel='preload'
          as='image'
          href='https://d10zufojjcedud.cloudfront.net/coin-nextjs/hero-coin.webp'
          fetchPriority='high'
        />
      </head>
      <body className='bg-neutral-100 text-neutral-900 antialiased'>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
