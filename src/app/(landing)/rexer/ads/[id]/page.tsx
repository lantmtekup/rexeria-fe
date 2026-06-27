import type { Metadata } from 'next';

import { StudioAdDetail } from '@/components/landing/ad-showcase/StudioAdDetail';

export const metadata: Metadata = {
  title: { absolute: 'Format demo — ReXeR Studio' },
  robots: { index: false },
};

export default async function StudioAdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudioAdDetail id={id} />;
}
