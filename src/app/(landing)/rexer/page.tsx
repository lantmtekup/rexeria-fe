import type { Metadata } from 'next';

import { StudioHome } from '@/components/landing/StudioHome';

export const metadata: Metadata = {
  title: 'ReXeR Studio — Interactive product experiences',
  description:
    'ReXeR Studio transforms your digital assets into interactive experiences that engage deeper and convert smarter. Built once. Delivered everywhere.',
};

export default function RexerHome() {
  return <StudioHome />;
}
