import type { Metadata } from 'next';

import { StartProjectCta } from '@/components/landing/StartProjectCta';
import { StudioHome } from '@/components/landing/StudioHome';

export const metadata: Metadata = {
  // `absolute`: title đã chứa brand → không nối thêm template "| ReXeR Studio".
  title: {
    absolute:
      'ReXeR Studio — Transforming brand touchpoints to Interactive Experience',
  },
  description:
    'From content chaos to customer conversion: we craft immersive, interactive experiences for your brand digital touchpoints.',
  // `/` là canonical (middleware rewrite / → /rexer: 2 URL cùng nội dung).
  alternates: { canonical: '/' },
};

export default function RexerHome() {
  return (
    <>
      <StudioHome />
      <StartProjectCta />
    </>
  );
}
