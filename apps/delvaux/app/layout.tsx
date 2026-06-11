import type { Metadata } from 'next';
import './globals.css';
import SmoothScrollProvider from './components/SmoothScrollProvider';

export const metadata: Metadata = {
  title:
    'RONCONASLI | Orange Satin Crystal Embellished Slingback Pumps | Manolo Blahnik',
  description:
    'Shop our Manolo Blahnik Orange Satin Crystal Embellished Slingback Pumps.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='lenis'>
      <body className='antialiased'>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
