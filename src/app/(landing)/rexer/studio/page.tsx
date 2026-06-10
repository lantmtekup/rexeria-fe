import type { Metadata } from 'next';

import { StudioShowcase } from '@/components/landing/StudioShowcase';

export const metadata: Metadata = {
  title: 'Studio — ReXeR Studio',
  description:
    'ReXeR Studio transforms your digital assets into interactive experiences that engage deeper and convert smarter. Built once. Delivered everywhere.',
};

export default function StudioPage() {
  return <StudioShowcase />;
}
