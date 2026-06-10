import type { Metadata } from 'next';

import { StartProjectCta } from '@/components/landing/StartProjectCta';
import { StudioHome } from '@/components/landing/StudioHome';

export const metadata: Metadata = {
  title:
    'ReXeR Studio — Transforming brand touchpoints to Interactive Experience',
  description:
    'From content chaos to customer conversion: we craft immersive, interactive experiences for your brand digital touchpoints.',
};

export default function RexerHome() {
  return (
    <>
      <StudioHome />
      <StartProjectCta />
    </>
  );
}
