import type { Metadata } from 'next';
import { Libertinus_Math, Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Font display của toàn landing (Figma: "Libertinus Math").
const libertinus = Libertinus_Math({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-libertinus',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ecommerce Landing',
  description: 'Ecommerce Landing — demo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${montserrat.variable} ${libertinus.variable}`}>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
