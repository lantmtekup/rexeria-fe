import type { ReactNode } from 'react';
import { SmoothScroll } from '@/components/smooth-scroll';
import './globals.css';

export const metadata = {
  title: 'Framer Clone',
  description: 'Scaffolded by the framer-clone skill.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
