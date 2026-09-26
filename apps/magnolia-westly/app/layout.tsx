import type { Metadata } from 'next';
import { Cormorant_Infant, Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const cormorant = Cormorant_Infant({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Inter carries the UI/label layer (eyebrows, small caps); headings stay Cormorant.
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Magnolia — Private Residences',
  description:
    'The Magnolia Private Residences — Khai Sơn City, Long Biên, Hà Nội.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='vi'
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className='font-sans antialiased' suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
