import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fabrics Protection | Technical Fabrics',
  description:
    'Technical shade fabrics engineered for design, performance and presence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
