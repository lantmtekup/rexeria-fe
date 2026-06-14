import type { Metadata } from 'next';

import { StudioShowcase } from '@/components/landing/StudioShowcase';

export const metadata: Metadata = {
  title: { absolute: 'Studio — ReXeR Studio' },
  alternates: { canonical: '/rexer/studio' },
  description:
    'ReXeR Studio transforms your digital assets into interactive experiences that engage deeper and convert smarter. Built once. Delivered everywhere.',
};

export default function StudioPage() {
  return <StudioShowcase />;
}
