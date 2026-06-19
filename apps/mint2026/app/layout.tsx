import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

// Display serif — a classical high-contrast garalde for the heritage / mint
// voice. Replaces the Georgia system fallback used in the headlines.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Vault, RCM 2026 Collection',
  description:
    "The Royal Canadian Mint's 2026 vault. Thirty pure gold and silver coins, struck in limited mintage. An interactive discovery experience.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
