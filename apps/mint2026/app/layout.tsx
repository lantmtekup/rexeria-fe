import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Vault — Bộ sưu tập RCM 2026',
  description:
    'Hầm bảo vật 2026 của Royal Canadian Mint — 30 đồng tiền vàng & bạc nguyên chất, đúc giới hạn. Trải nghiệm khám phá tương tác.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='vi'>
      <body>{children}</body>
    </html>
  );
}
