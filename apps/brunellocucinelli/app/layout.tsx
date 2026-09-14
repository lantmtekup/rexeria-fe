import type { Metadata } from 'next';
import {
  Cormorant_Infant,
  IM_Fell_Great_Primer,
  Inter,
} from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import StoryView from './components/StoryView';

const cormorant = Cormorant_Infant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Inter carries the UI/label layer (eyebrows, small caps); headings stay Cormorant.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

// Tiêu đề chương trong trình xem artwork (trang mẫu dùng IM Fell Great Primer).
const fell = IM_Fell_Great_Primer({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-im-fell',
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
    <html
      lang='en'
      className={`${cormorant.variable} ${inter.variable} ${fell.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Reload luôn về đầu: chạy trước khi trình duyệt khôi phục vị trí
            cũ và trước effect của Hero (intro chỉ chạy khi scrollY = 0). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "history.scrollRestoration='manual';window.scrollTo(0,0);",
          }}
        />
      </head>
      <body className='font-sans antialiased' suppressHydrationWarning>
        <SmoothScrollProvider>
          <Header />
          {children}
          <StoryView />
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
