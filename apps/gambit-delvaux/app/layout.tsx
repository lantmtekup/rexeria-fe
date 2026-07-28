import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const atlasGrotesk = localFont({
  src: [
    {
      path: './fonts/AtlasGrotesk-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/AtlasGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/AtlasGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-atlas',
  display: 'swap',
});

const genath = localFont({
  src: './fonts/Genath-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-genath',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Delvaux',
  description: 'Delvaux.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={`${atlasGrotesk.variable} ${genath.variable}`}
      suppressHydrationWarning
    >
      <body className={atlasGrotesk.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
