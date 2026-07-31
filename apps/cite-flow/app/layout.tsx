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
  title: 'Cite Flow',
  description: 'Cite Flow app.',
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
