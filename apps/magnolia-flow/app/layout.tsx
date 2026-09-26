import type { Metadata } from 'next';
import { Abril_Fatface, Aboreto } from 'next/font/google';
import { SmoothScrollProvider } from './components';
import './globals.css';

const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-abril-fatface',
  display: 'swap',
});

const aboreto = Aboreto({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-aboreto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Magnolia — The Journey of Timeless Value',
  description:
    'The Magnolia Private Residences — Khai Son City, Long Bien, Hanoi.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={`${abrilFatface.variable} ${aboreto.variable} lenis`}
      suppressHydrationWarning
    >
      <body className='font-abril' suppressHydrationWarning>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
