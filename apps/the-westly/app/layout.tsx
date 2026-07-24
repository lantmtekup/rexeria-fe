import type { Metadata } from 'next';
import { Cormorant_Infant } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const cormorant = Cormorant_Infant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Westly',
  description: 'The Westly app.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={cormorant.variable} suppressHydrationWarning>
      <body className='font-sans antialiased' suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
