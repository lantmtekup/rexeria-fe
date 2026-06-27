import type { Metadata } from 'next';

import { StudioAdShowcase } from '@/components/landing/ad-showcase/StudioAdShowcase';

export const metadata: Metadata = {
  title: { absolute: 'Ads — ReXeR Studio' },
  alternates: { canonical: '/rexer/ads' },
  description:
    'Interactive ad formats you can drag, swipe, scratch and tap — live in the browser. Built once. Delivered everywhere.',
};

export default function AdsPage() {
  return <StudioAdShowcase />;
}
